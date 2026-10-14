import { serverRoot } from './connection'
import type { ZNode } from '../treatment/znodes'

/*
 * The server's z-Tree treatment editor (server/source/editors/ztree.js, at /api/editor/ztree/...):
 * treatments in z-Tree's text format read as trees and written as z-Tree writes them.
 */

export interface ZOpened {
  appPath: string
  /** Where Save writes: the file, or for z-Tree's binary format a .txt beside it. */
  savePath: string
  format: 'text' | 'binary'
  root: ZNode
  /** What a binary treatment had that its text does not (none, mostly). */
  notes: string[]
  savePathExists?: boolean
}

async function call<T>(action: string, body: unknown): Promise<T> {
  const res = await fetch(`${serverRoot}/api/editor/ztree/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({ error: `${res.status} ${res.statusText}` }))
  if (!res.ok) throw new Error(data.error ?? `${res.status} ${res.statusText}`)
  return data as T
}

export const zeditor = {
  open: (appPath: string) => call<ZOpened>('open', { appPath }),
  blank: (name: string) => call<{ root: ZNode }>('blank', { name }),
  save: (appPath: string, root: ZNode) => call<{ appPath: string }>('save', { appPath, root }),
  text: (root: ZNode) => call<{ text: string }>('text', { root }),
  check: (root: ZNode) => call<{ errors: Array<{ where: string, message: string }>, stages: number }>('check', { root }),
}
