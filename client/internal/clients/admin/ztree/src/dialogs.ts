import { markRaw, shallowReactive } from 'vue'
import type { Component } from 'vue'
import MessageBox from './dialogs/MessageBox.vue'

/*
 * z-Tree's dialogs are modal: one is up, and the program waits for its
 * answer. Each here is a component on a stack, opened with `showDialog`,
 * which resolves with whatever the dialog closed with (undefined for Cancel).
 */

export interface DialogEntry {
  id: number
  component: Component
  props: Record<string, unknown>
  resolve: (value: unknown) => void
}

export const dialogStack = shallowReactive<DialogEntry[]>([])
let counter = 0

export function showDialog<T = unknown>(component: Component, props: Record<string, unknown> = {}): Promise<T | undefined> {
  return new Promise((resolve) => {
    dialogStack.push({ id: ++counter, component: markRaw(component), props, resolve: resolve as (value: unknown) => void })
  })
}

export function closeDialog(entry: DialogEntry, value?: unknown) {
  const index = dialogStack.indexOf(entry)
  if (index !== -1) dialogStack.splice(index, 1)
  entry.resolve(value)
}

export type MessageIcon = 'warning' | 'info' | 'question' | 'stop'

/** A message with buttons; resolves with the label of the one pressed. */
export function messageBox(
  text: string,
  options: { title?: string, buttons?: string[], icon?: MessageIcon } = {},
): Promise<string | undefined> {
  return showDialog<string>(MessageBox, {
    text,
    title: options.title ?? 'zTree',
    buttons: options.buttons ?? ['OK'],
    icon: options.icon,
  })
}
