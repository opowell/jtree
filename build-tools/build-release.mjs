// Builds the jtree release archives into dist/: download, unpack, run.
//
//   node build-tools/build-release.mjs [--node-version vX.Y.Z] [--targets a,b,c] [--out dist]
//
// Each archive holds a folder jtree-<version>/ with the launchers (start.sh,
// start.command, start.cmd), JAS (vendor/jas), jtree's server with its
// dependencies installed, the client folder (admin interfaces, which need no
// build, and experiment apps).
// One archive per platform target bundles a Node runtime, which JAS's launcher
// picks up; the "portable" one uses the Node already installed (v22+).
//
// Needs git, pnpm, zip and tar. Files come from the working tree (tracked, plus
// untracked files that are not ignored), so commit first for a release that
// matches a tag.

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const ALL_TARGETS = ['darwin-arm64', 'darwin-x64', 'linux-x64', 'linux-arm64', 'win-x64']
const NODE_DIST = 'https://nodejs.org/dist'

// What goes into a release, of jtree's own files.
const INCLUDE = [
  'README.md',
  'start.sh',
  'start.command',
  'start.cmd',
  'apps/',
  'server/package.json',
  'server/pnpm-lock.yaml',
  'server/source/',
  'client/apps/',
  'client/internal/',
  'client/help.html',
]

const parseArgs = (argv) => {
  const args = { targets: ALL_TARGETS, out: 'dist', nodeVersion: undefined }
  for (let i = 0; i < argv.length; i++) {
    const [flag, inlineValue] = argv[i].split(/=(.*)/s)
    const value = inlineValue !== undefined ? inlineValue : argv[++i]
    if (flag === '--node-version') args.nodeVersion = value
    else if (flag === '--targets') args.targets = value.split(',').map((t) => t.trim()).filter(Boolean)
    else if (flag === '--out') args.out = value
    else throw new Error('unknown argument: ' + argv[i])
  }
  const unknown = args.targets.filter((t) => !ALL_TARGETS.includes(t))
  if (unknown.length) throw new Error('unknown target(s): ' + unknown.join(', ') + '. Known: ' + ALL_TARGETS.join(', '))
  return args
}

const isWin = process.platform === 'win32'

// pnpm is a .cmd script on Windows, which Node only runs through a shell.
const run = (command, args, options = {}) =>
  execFileSync(command, args, { stdio: 'inherit', shell: isWin && command === 'pnpm', ...options })

const has = (command) => {
  try {
    execFileSync(isWin ? 'where' : 'which', [command], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const output = (command, args, options = {}) =>
  execFileSync(command, args, { encoding: 'utf8', ...options })

// The newest LTS release, so the bundled Node does not go stale.
const latestLtsVersion = async () => {
  const response = await fetch(NODE_DIST + '/index.json')
  if (!response.ok) throw new Error('could not list Node releases: HTTP ' + response.status)
  const lts = (await response.json()).find((release) => release.lts)
  if (!lts) throw new Error('no LTS release found in the Node release index')
  return lts.version
}

const download = async (url, destination) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('download failed (HTTP ' + response.status + '): ' + url)
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()))
}

const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex')

const verifyChecksum = async (nodeVersion, fileName, file) => {
  const response = await fetch(`${NODE_DIST}/${nodeVersion}/SHASUMS256.txt`)
  if (!response.ok) throw new Error('could not fetch SHASUMS256.txt: HTTP ' + response.status)
  const line = (await response.text()).split('\n').find((l) => l.trim().endsWith(' ' + fileName))
  if (!line) throw new Error('no checksum published for ' + fileName)
  const expected = line.trim().split(/\s+/)[0]
  if (sha256(file) !== expected) throw new Error('checksum mismatch for ' + fileName)
}

// Unpacks a Node archive (one top-level folder) into intoDir, leaving out the
// C headers and man pages.
const extractNode = (archive, intoDir) => {
  const staging = intoDir + '-unpack'
  fs.rmSync(staging, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })
  // GNU tar (Linux) cannot read the Windows .zip; bsdtar (macOS, Windows) can.
  if (archive.endsWith('.zip') && has('unzip')) run('unzip', ['-q', archive, '-d', staging])
  else run('tar', ['-xf', archive, '-C', staging])
  const [top] = fs.readdirSync(staging)
  fs.rmSync(intoDir, { recursive: true, force: true })
  fs.renameSync(path.join(staging, top), intoDir)
  fs.rmSync(staging, { recursive: true, force: true })
  for (const extra of ['include', 'share']) fs.rmSync(path.join(intoDir, extra), { recursive: true, force: true })
}

// Files git knows of: tracked (and still present) plus untracked ones that are not ignored.
const gitFiles = (dir) =>
  output('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: dir })
    .split('\0')
    .filter((f) => f && fs.existsSync(path.join(dir, f)) && fs.lstatSync(path.join(dir, f)).isFile())

const copyFiles = (fromDir, files, toDir) => {
  for (const file of files) {
    const to = path.join(toDir, file)
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.copyFileSync(path.join(fromDir, file), to)
    fs.chmodSync(to, fs.statSync(path.join(fromDir, file)).mode)
  }
}

const removeSymlinks = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isSymbolicLink()) fs.rmSync(full)
    else if (entry.isDirectory()) removeSymlinks(full)
  }
}

const stage = (stageDir) => {
  fs.rmSync(stageDir, { recursive: true, force: true })
  fs.mkdirSync(stageDir, { recursive: true })

  if (output('git', ['status', '--porcelain'], { cwd: root }).trim() !== '') {
    console.log('  note: the working tree has uncommitted changes, which go into the archives')
  }

  // jtree's files.
  const files = gitFiles(root).filter((f) => INCLUDE.some((p) => (p.endsWith('/') ? f.startsWith(p) : f === p)))
  copyFiles(root, files, stageDir)
  for (const generated of ['client/internal/clients/shared/shared.js', 'client/internal/serverState.json']) {
    fs.rmSync(path.join(stageDir, generated), { force: true })
  }

  // JAS, from its submodule, with its committed node_modules.
  const jasDir = path.join(root, 'vendor', 'jas')
  if (!fs.existsSync(path.join(jasDir, 'jas.sh'))) throw new Error('vendor/jas is empty: run git submodule update --init')
  const jasFiles = gitFiles(jasDir).filter((f) => !/^(\.github|\.claude|logs|sessions)\//.test(f) && f !== 'CLAUDE.md')
  copyFiles(jasDir, jasFiles, path.join(stageDir, 'vendor', 'jas'))

  // jtree's server dependencies: a flat node_modules, without symlinks, so the
  // archive unpacks the same everywhere.
  console.log('  installing server dependencies')
  run('pnpm', ['install', '--prod', '--frozen-lockfile', '--ignore-scripts', '--config.node-linker=hoisted'], {
    cwd: path.join(stageDir, 'server'),
  })
  removeSymlinks(path.join(stageDir, 'server', 'node_modules'))
}

const archive = (parentDir, folderName, outputFile) => {
  fs.rmSync(outputFile, { force: true })
  if (outputFile.endsWith('.zip')) run('zip', ['-qry', outputFile, folderName], { cwd: parentDir })
  else run('tar', ['-czf', outputFile, folderName], { cwd: parentDir })
  console.log('  built ' + path.relative(root, outputFile))
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'server', 'package.json'), 'utf8'))
  const nodeVersion = args.nodeVersion || (await latestLtsVersion())

  const outDir = path.resolve(root, args.out)
  const workDir = path.join(outDir, 'work')
  const cacheDir = path.join(outDir, 'node-cache')
  fs.mkdirSync(cacheDir, { recursive: true })
  for (const old of fs.readdirSync(outDir)) {
    if (/^jtree-.*\.(zip|tar\.gz)$/.test(old) || old === 'SHA256SUMS.txt') fs.rmSync(path.join(outDir, old))
  }

  // Archive names leave out the version, so README links to
  // releases/latest/download/<name> keep working; the folder inside has it.
  const folderName = 'jtree-' + version
  const stageDir = path.join(workDir, folderName)

  console.log(`building jtree ${version} release archives (bundled Node ${nodeVersion})`)
  stage(stageDir)
  const built = []

  console.log('portable (no bundled Node):')
  built.push(path.join(outDir, 'jtree-portable.zip'))
  archive(workDir, folderName, built.at(-1))

  for (const target of args.targets) {
    console.log(target + ':')
    const windows = target.startsWith('win-')
    const fileName = `node-${nodeVersion}-${target}.` + (windows ? 'zip' : 'tar.gz')
    const cached = path.join(cacheDir, fileName)
    if (!fs.existsSync(cached)) {
      console.log('  downloading ' + fileName)
      await download(`${NODE_DIST}/${nodeVersion}/${fileName}`, cached)
    }
    await verifyChecksum(nodeVersion, fileName, cached)

    const targetDir = path.join(workDir, target)
    fs.rmSync(targetDir, { recursive: true, force: true })
    fs.mkdirSync(targetDir, { recursive: true })
    fs.cpSync(stageDir, path.join(targetDir, folderName), { recursive: true })
    // Where JAS's launchers look for a bundled Node (vendor/jas/server/find-node.sh, jas.cmd).
    extractNode(cached, path.join(targetDir, folderName, 'vendor', 'jas', 'server', 'node', `${nodeVersion}-${target}`))

    built.push(path.join(outDir, `jtree-${target}.` + (windows ? 'zip' : 'tar.gz')))
    archive(targetDir, folderName, built.at(-1))
    fs.rmSync(targetDir, { recursive: true, force: true })
  }

  fs.writeFileSync(
    path.join(outDir, 'SHA256SUMS.txt'),
    built.map((file) => `${sha256(file)}  ${path.basename(file)}\n`).join(''),
  )
  fs.rmSync(workDir, { recursive: true, force: true })
  console.log('\ndone. Archives are in ' + path.relative(root, outDir) + '/')
}

main().catch((error) => {
  console.error('build-release: ' + error.message)
  process.exit(1)
})
