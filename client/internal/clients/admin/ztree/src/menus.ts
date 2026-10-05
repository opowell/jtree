import { computed } from 'vue'
import type { MenuItemDef } from 'header-content-layout'
import { state } from './server/connection'
import { canReorder, monitor, windowCommands } from './clients'
import * as act from './actions'
import { fileName } from './treatment/docs'
import { SESSION_TABLES, TREATMENT_TABLES } from './tables'
import { frontTreatment, frontWindow, openWindow, windowIds, windowTitle, workspace } from './windows'

/*
 * z-Tree's menu bar, item for item as the manual's chapter 8 lists it. What
 * jtree can do is wired to it; what it has no counterpart for is there but
 * greyed out, as z-Tree greys out what cannot be done just now.
 */

const off = (label: string, shortcut?: string): MenuItemDef => ({ label, disabled: true, shortcut })
const sep: MenuItemDef = { separator: true }

export const menus = computed<MenuItemDef[]>(() => {
  const session = state.session
  const doc = frontTreatment.value
  const front = frontWindow.value
  const commands = front ? windowCommands[front] : undefined
  const treatments = session?.apps.length ?? 0
  const editable = Boolean(doc && !doc.readOnly)
  const running = Boolean(session?.started && Object.values(session.participants).some((p) => p.player))

  const file: MenuItemDef = {
    label: 'File',
    items: [
      { label: 'New Treatment', action: act.newTreatment },
      off('New Questionnaire'),
      { label: 'Open…', shortcut: 'Ctrl+O', disabled: !state.loaded, action: () => void act.openTreatmentDialog() },
      { label: 'Close', disabled: !front, action: act.closeFront },
      { label: 'Save', shortcut: 'Ctrl+S', disabled: !doc, action: () => act.saveFront() },
      { label: 'Save As…', disabled: !doc, action: () => act.saveFront(true) },
      sep,
      { label: 'Export Treatment…', disabled: !doc, action: act.exportTreatment },
      off('Export Questionnaire…'),
      off('Export GameSafe…'),
      { label: 'Export Table…', disabled: !commands?.exportText || Boolean(doc), action: act.exportTable },
      off('Import…'),
      sep,
      off('Page Setup…'),
      off('Print…', 'Ctrl+P'),
      ...(workspace.recent.length
        ? [sep, ...workspace.recent.map((appId, i) => ({
            label: `${i + 1} ${state.apps[appId] ? fileName(state.apps[appId].appPath || appId) : fileName(appId)}`,
            disabled: !state.apps[appId],
            action: () => act.openTreatment(appId),
          }))]
        : []),
      sep,
      { label: 'Quit', action: () => void act.quit() },
    ],
  }

  const edit: MenuItemDef = {
    label: 'Edit',
    items: [
      off('Undo', 'Ctrl+Z'),
      sep,
      { label: 'Cut', shortcut: 'Ctrl+X', disabled: !commands?.cut || !commands.canCut?.(), action: act.editCut },
      { label: 'Copy', shortcut: 'Ctrl+C', disabled: !commands?.copy, action: act.editCopy },
      { label: 'Paste', shortcut: 'Ctrl+V', disabled: !commands?.paste || !commands.canPaste?.(), action: act.editPaste },
      sep,
      off('Copy groups'),
      off('Paste groups'),
      off('Insert cells'),
      off('Remove cells'),
      sep,
      off('Find…', 'Ctrl+F'),
      off('Find Next', 'F3'),
    ],
  }

  const box = (name: string) => off(`New ${name} Box…`)
  const treatment: MenuItemDef = {
    label: 'Treatment',
    items: [
      { label: 'Info…', disabled: !doc, action: act.frontInfo },
      sep,
      { label: 'New Stage…', disabled: !editable, action: () => void act.newStage() },
      off('New Table…'),
      off('New Table Loader…'),
      off('New Table Dumper…'),
      { label: 'New Program…', disabled: !editable, action: () => void act.newProgram() },
      off('New External Program…'),
      {
        label: 'New Box',
        items: ['Header', 'Standard', 'Calculator Button', 'History', 'Help', 'Container', 'Grid', 'Contract Creation', 'Contract List', 'Contract Grid', 'Message', 'Multimedia', 'Plot', 'Chat'].map(box),
      },
      off('New On-Off Trigger…'),
      off('New Button…'),
      off('New Checker…'),
      off('New Item…'),
      off('New Connector…'),
      off('New Inlet…'),
      off('New Outlet…'),
      {
        label: 'New Plot',
        items: ['Point', 'Plot Input', 'Plot Graph', 'Plot Text', 'Line', 'Rect', 'Pie', 'Axis'].map((name) => off(`New ${name}…`)),
      },
      { label: 'New Slide Show', items: [off('New Slide Show…'), off('Slide sequence…'), off('New Slide…')] },
      sep,
      { label: 'Expand All', disabled: !doc, action: act.expandAll },
      sep,
      { label: 'Stage Tree', checked: true, disabled: !doc },
      off('Parameter Table'),
      sep,
      { label: 'Check', disabled: !doc, action: () => void act.check() },
      sep,
      off('Import Variable Table…'),
      off('Show Variable…'),
      off('Append Variable…'),
      off('Append Text…'),
      sep,
      { label: 'Matching', items: ['Partner', 'Stranger', 'Absolute Stranger', 'Typed Partner', 'Typed Stranger', 'Typed Absolute Stranger'].map((m) => off(m)) },
      { label: 'Utilities', items: [off('Swap stage tree and parameter table')] },
      { label: 'Language', items: [{ label: 'English', checked: true }, off('Deutsch'), off('Français'), off('Italiano')] },
    ],
  }

  const tableItem = (name: string, number: number): MenuItemDef => ({
    label: `${name} Table`,
    disabled: !session || (number > 0 && !treatments),
    action: () => act.openTable(name, number),
  })

  const run: MenuItemDef = {
    label: 'Run',
    items: [
      { label: 'Connection Monitor', action: act.connectionMonitor },
      sep,
      { label: 'Shuffle Clients', disabled: !canReorder.value, action: act.shuffleClients },
      { label: 'Sort Clients', disabled: !canReorder.value, action: act.sortClients },
      sep,
      { label: 'Start Treatment', shortcut: 'F5', disabled: !doc || !session || !state.connected, action: () => void act.startTreatment() },
      off('Start Questionnaire'),
      sep,
      ...SESSION_TABLES.map((name) => tableItem(name, 0)),
      sep,
      ...TREATMENT_TABLES.map((name) => tableItem(name, act.lastTreatment())),
      {
        label: 'all Tables',
        disabled: !treatments,
        items: treatments
          ? Array.from({ length: treatments }, (_, i) => i + 1).flatMap((n) => [
              ...(n > 1 ? [sep] : []),
              ...TREATMENT_TABLES.map((name) => ({ label: `${n} ${name}`, action: () => act.openTable(name, n) })),
            ])
          : [off('No treatment started yet')],
      },
      sep,
      { label: 'Stop Clock', shortcut: 'F12', disabled: !session || !session.isRunning, action: () => void act.stopClock() },
      { label: 'Restart Clock', shortcut: 'Shift+F12', disabled: !session || session.isRunning, action: () => void act.restartClock() },
      sep,
      { label: 'Leave Stage', disabled: !monitor.states.length, action: () => void act.leaveStage() },
      { label: 'Stop after this period', disabled: !running, checked: act.stopAfterThisPeriodChecked(), action: () => void act.stopAfterThisPeriod() },
      sep,
      off('Do clientremove()'),
      off('clientremove() no dropout handler'),
      sep,
      { label: 'Save Client Order', disabled: !session, action: act.saveClientOrder },
      { label: 'Restore Client Order', disabled: !workspace.savedClientOrder.length || !canReorder.value, action: act.restoreClientOrder },
      sep,
      { label: 'Save All Tables', disabled: !session, action: act.saveAllTables },
      { label: 'Restore Session…', disabled: !state.loaded, action: () => void act.restoreSession() },
    ],
  }

  const tools: MenuItemDef = {
    label: 'Tools',
    items: [
      off('Separate Tables…'),
      off('Join Questionnaires file…'),
      off('Join files…'),
      off('Append Files…'),
      off('Split Files…'),
      off('Expand Timefile…'),
      off('Fix File…'),
      sep,
      { label: 'Start z-Leaf…', disabled: !session, action: () => void act.startLeaves() },
      { label: 'z-Leaf address…', disabled: !session, action: act.leafAddress },
      { label: 'Restart all z-Leaves', disabled: !session, action: act.reloadLeaves },
      { label: 'Read treatment files again', disabled: !state.connected, action: () => void act.reloadTreatments() },
    ],
  }

  const view: MenuItemDef = {
    label: 'View',
    items: [
      ...(windowIds.value.length
        ? windowIds.value.map((id) => ({ label: windowTitle(id), checked: id === front, action: () => openWindow(id) }))
        : [off('No windows open')]),
      sep,
      { label: 'Toolbar', checked: workspace.toolbar, action: () => (workspace.toolbar = !workspace.toolbar) },
      { label: 'Status Bar', checked: workspace.statusBar, action: () => (workspace.statusBar = !workspace.statusBar) },
    ],
  }

  const help: MenuItemDef = {
    label: '?',
    items: [
      { label: 'About zTree…', action: act.about },
      { label: 'z-Tree Manual', action: () => window.open('https://www.ztree.uzh.ch/static/doc/manual.pdf', '_blank') },
      { label: 'jtree Documentation', action: () => window.open('https://opowell.github.io/jtree', '_blank') },
    ],
  }

  return [file, edit, treatment, run, tools, view, help]
})
