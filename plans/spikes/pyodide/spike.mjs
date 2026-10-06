// Can jtree run oTree app logic in Pyodide, in Node, with no build step?
import { loadPyodide } from 'pyodide';
import fs from 'node:fs';

const mb = () => Math.round(process.memoryUsage().rss / 1e6);
const report = {};

// 1. Start-up.
const rss0 = mb();
let t = performance.now();
const py = await loadPyodide();
report.loadMs = Math.round(performance.now() - t);
report.rssBeforeMB = rss0;
report.rssAfterLoadMB = mb();
report.python = py.runPython('import sys; sys.version.split()[0]');

// 2. Two apps from the same source, as separate packages, beside jtree's otree.api shim.
py.FS.mkdirTree('/apps/otree');
py.FS.writeFile('/apps/otree/__init__.py', '');
py.FS.writeFile('/apps/otree/api.py', fs.readFileSync('otree_api.py', 'utf8'));
const src = fs.readFileSync('public_goods.py', 'utf8');
for (const [name, mult] of [['app_pg_1', '1.8'], ['app_pg_2', '3']]) {
    py.FS.mkdirTree('/apps/' + name);
    py.FS.writeFile('/apps/' + name + '/__init__.py', src.replace('MULTIPLIER = 1.8', 'MULTIPLIER = ' + mult));
}
t = performance.now();
py.runPython(`
import sys, json, importlib
sys.path.insert(0, '/apps')

def load_app(name):
    m = importlib.import_module(name)
    m.Group._player_cls = m.Player
    m.Player._group_cls = m.Group
    pages = []
    for p in m.page_sequence:
        info = {'name': p.__name__, 'kind': 'wait' if issubclass(p, m.WaitPage) else 'page'}
        for attr in ('form_model', 'form_fields', 'timeout_seconds'):
            if hasattr(p, attr):
                info[attr] = getattr(p, attr)
        if hasattr(p, 'after_all_players_arrive'):
            f = p.after_all_players_arrive
            info['after_all_players_arrive'] = f if isinstance(f, str) else f.__name__
        pages.append(info)
    consts = {k: v for k, v in vars(m.C).items() if k.isupper()}
    return json.dumps({
        'constants': consts,
        'player': m.Player.schema(),
        'group': m.Group.schema(),
        'pages': pages,
    })
`);
const ir1 = JSON.parse(py.globals.get('load_app')('app_pg_1'));
const ir2 = JSON.parse(py.globals.get('load_app')('app_pg_2'));
report.importMs = Math.round(performance.now() - t);
report.ir = ir1;
report.isolated = ir1.constants.MULTIPLIER === 1.8 && ir2.constants.MULTIPLIER === 3;

// 3. jtree-like JS objects; Python reads and writes them synchronously.
function makeGroup(contributions) {
    const group = { id: 1, players: [] };
    contributions.forEach((c, i) => group.players.push({ id: 'P' + (i + 1), contribution: c, group }));
    return group;
}
const mod1 = py.pyimport('app_pg_1');
const g = makeGroup([10, 20, 30]);
mod1.set_payoffs(mod1.Group(g));
report.payoffs = g.players.map(p => p.payoff);
report.groupFields = { total: g.total_contribution, share: g.individual_share };
report.payoffTypes = g.players.map(p => typeof p.payoff);
report.payoffsCorrect = g.players.every(p => Math.abs(p.payoff - (100 - p.contribution + 60 * 1.8 / 3)) < 1e-9);

// 4. Writing a field the model does not declare is an error, which reaches JS.
try {
    py.runPython(`
import app_pg_1
class _J: pass
app_pg_1.Player(_J()).contributon = 5
`);
    report.undeclaredFieldError = 'none';
} catch (err) {
    report.undeclaredFieldError = String(err.message).trim().split('\n').pop();
}

// 5. Cost of a call: set_payoffs on a group of 3, 10,000 times.
const pyGroup = mod1.Group(g);
const fn = mod1.set_payoffs;
t = performance.now();
for (let i = 0; i < 10000; i++) fn(pyGroup);
report.callUs = Math.round((performance.now() - t) / 10000 * 1000) / 1000 * 1000;
report.rssAfterCallsMB = mb();

// 6. Seeded randomness is deterministic.
const r = () => py.runPython('import random; random.seed(42); [random.randint(1, 100) for _ in range(3)]').toJs();
report.seededRandom = JSON.stringify(r()) === JSON.stringify(r()) ? r() : 'differs';

// 7. Python's ast as JSON, for the converter: the set_payoffs function.
t = performance.now();
const astJson = py.runPython(`
import ast, json
def node(n):
    if isinstance(n, ast.AST):
        d = {'_type': type(n).__name__}
        for f, v in ast.iter_fields(n):
            d[f] = node(v)
        if hasattr(n, 'lineno'):
            d['_line'] = n.lineno
        return d
    if isinstance(n, list):
        return [node(x) for x in n]
    return n if isinstance(n, (str, int, float, bool, type(None))) else repr(n)
tree = ast.parse(open('/apps/app_pg_1/__init__.py').read())
fn = next(x for x in tree.body if isinstance(x, ast.FunctionDef) and x.name == 'set_payoffs')
json.dumps(node(fn))
`);
report.astMs = Math.round(performance.now() - t);
report.astSample = JSON.parse(astJson).body.slice(0, 1);

// 8. Files a release would need.
const dir = new URL('./node_modules/pyodide/', import.meta.url);
report.files = Object.fromEntries(fs.readdirSync(dir).filter(f => /\.(wasm|zip|mjs|json)$/.test(f) && !f.endsWith('.map'))
    .map(f => [f, Math.round(fs.statSync(new URL(f, dir)).size / 1e5) / 10 + ' MB']));

console.log(JSON.stringify(report, null, 2));
