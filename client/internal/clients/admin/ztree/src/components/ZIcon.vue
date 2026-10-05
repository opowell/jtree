<script setup lang="ts">
// The small pictures z-Tree puts beside each thing: the green tree of the
// background, a table's sheet, a program's wrench, a screen (with a red mark
// when it is the active one), a box, an item, a stage.
defineProps<{ name: string }>()

const ICONS: Record<string, string> = {
  tree: '<rect x="7" y="9.5" width="2" height="5.5" fill="#7a5530"/><ellipse cx="8" cy="6.5" rx="6.5" ry="5.5" fill="#22b014" stroke="#0e6d08"/><ellipse cx="6" cy="4.8" rx="2" ry="1.4" fill="#7fe06f"/>',
  background: '<rect x="7" y="9.5" width="2" height="5.5" fill="#7a5530"/><ellipse cx="8" cy="6.5" rx="6.5" ry="5.5" fill="#22b014" stroke="#0e6d08"/><ellipse cx="6" cy="4.8" rx="2" ry="1.4" fill="#7fe06f"/>',
  table: '<path d="M3.5 3.5h9l-2 9h-9z" fill="#fff" stroke="#333"/><path d="M3 6.5h9M2.4 9.5h9M6.8 3.5l-2 9M9.8 3.5l-2 9" stroke="#333" stroke-width=".8"/>',
  program: '<path d="M10.8 1.6a3.4 3.4 0 0 0-3.4 4.5L1.9 11.6a1.4 1.4 0 0 0 2 2l5.5-5.5a3.4 3.4 0 0 0 4.5-3.4l-2 2-1.8-.4-.4-1.8z" fill="#c9c9c9" stroke="#3a3a3a" stroke-linejoin="round"/>',
  active: '<rect x="1.5" y="2.5" width="13" height="11" fill="#d4d4d4" stroke="#444"/><rect x="5.5" y="5.5" width="5" height="5" fill="#e0201b" stroke="#7d0d0b"/>',
  waiting: '<rect x="1.5" y="2.5" width="13" height="11" fill="#d4d4d4" stroke="#444"/>',
  box: '<rect x="1.5" y="3.5" width="13" height="9" fill="#fff" stroke="#333"/><path d="M1.5 5.5h13" stroke="#333"/>',
  standard: '<rect x="1.5" y="3.5" width="13" height="9" fill="#fff" stroke="#333"/><path d="M3.5 6.5h4M3.5 8.5h4M3.5 10.5h4" stroke="#333"/><rect x="9" y="6" width="4" height="1.6" fill="#555"/><rect x="9" y="8" width="4" height="1.6" fill="#555"/>',
  item: '<rect x="1.5" y="5.5" width="13" height="5" fill="#fff" stroke="#333"/><rect x="2.5" y="6.5" width="4" height="3" fill="#7d7d7d"/>',
  button: '<rect x="2.5" y="5.5" width="11" height="5" rx="1" fill="#e1e1e1" stroke="#333"/>',
  stage: '<path d="M2 13.5V8.5h12v5" fill="#2cb51f" stroke="#0e6d08"/><path d="M4 8.5V4.5h8v4" fill="#55d046" stroke="#0e6d08"/><path d="M1 13.5h14" stroke="#0e6d08"/>',
  error: '<circle cx="8" cy="8" r="6.5" fill="#d9201c"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" stroke-width="1.6"/>',
  monitor: '<rect x="1.5" y="2.5" width="13" height="9" fill="#cfe7ff" stroke="#333"/><path d="M6 13.5h4M8 11.5v2" stroke="#333"/><rect x="7" y="9.5" width="2" height="2" fill="#1d8f13"/><ellipse cx="8" cy="6.5" rx="3" ry="2.5" fill="#22b014"/>',
  leaf: '<path d="M3 13C3 6 7 2.5 13.5 2.5 13.5 9 10 13 3 13z" fill="#4cc23c" stroke="#0e6d08"/><path d="M3 13l7-7" stroke="#0e6d08"/>',
  folder: '<path d="M1.5 3.5h5l1.5 1.5h6.5v8h-13z" fill="#ffd862" stroke="#b58b14"/>',
  file: '<path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#555"/><path d="M9.5 1.5v3h3" fill="none" stroke="#555"/><ellipse cx="8" cy="9" rx="2.6" ry="2.3" fill="#22b014"/><rect x="7.5" y="10.5" width="1" height="2.2" fill="#7a5530"/>',
  new: '<path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#555"/><path d="M9.5 1.5v3h3" fill="none" stroke="#555"/>',
  open: '<path d="M1.5 4.5h5l1.5 1.5h5v2" fill="#ffd862" stroke="#b58b14"/><path d="M1.5 13.5l2.5-6h11l-2.5 6z" fill="#ffe89a" stroke="#b58b14"/><path d="M1.5 4.5v9" stroke="#b58b14"/>',
  save: '<rect x="1.5" y="1.5" width="13" height="13" fill="#3c78c8" stroke="#1d3f70"/><rect x="4" y="1.5" width="8" height="5" fill="#fff"/><rect x="4" y="9" width="8" height="5.5" fill="#d8e4f5"/>',
  cut: '<circle cx="4.5" cy="12" r="2" fill="none" stroke="#333"/><circle cx="11.5" cy="12" r="2" fill="none" stroke="#333"/><path d="M5.6 10.4L11 2M10.4 10.4L5 2" stroke="#333"/>',
  copy: '<rect x="1.5" y="1.5" width="8" height="10" fill="#fff" stroke="#555"/><rect x="6.5" y="4.5" width="8" height="10" fill="#fff" stroke="#555"/>',
  paste: '<rect x="2.5" y="2.5" width="9" height="12" fill="#d6a85a" stroke="#7a5a20"/><rect x="5" y="1.5" width="4" height="2.5" fill="#999" stroke="#555"/><rect x="7.5" y="6.5" width="7" height="8" fill="#fff" stroke="#555"/>',
  print: '<rect x="4.5" y="1.5" width="7" height="5" fill="#fff" stroke="#555"/><rect x="1.5" y="6.5" width="13" height="6" fill="#c8c8c8" stroke="#555"/><rect x="4.5" y="10.5" width="7" height="4" fill="#fff" stroke="#555"/>',
  help: '<circle cx="8" cy="8" r="6.5" fill="#fff" stroke="#1d5fb8"/><path d="M6 6.2a2 2 0 1 1 2.8 1.8c-.6.3-.8.7-.8 1.4" fill="none" stroke="#1d5fb8" stroke-width="1.4"/><circle cx="8" cy="11.6" r=".9" fill="#1d5fb8"/>',
  start: '<path d="M4 2.5l9 5.5-9 5.5z" fill="#1d8f13" stroke="#0e5d08" stroke-linejoin="round"/>',
  stopclock: '<circle cx="8" cy="8.5" r="6" fill="#fff" stroke="#333"/><path d="M8 8.5V5M8 8.5l2.5 1.5" stroke="#333"/><rect x="9.5" y="9.5" width="5" height="5" fill="#d9201c"/>',
  warning: '<path d="M16 3L30 28H2z" fill="#ffd400" stroke="#7a6400" stroke-linejoin="round"/><path d="M16 11v9" stroke="#000" stroke-width="2.6"/><circle cx="16" cy="24" r="1.6"/>',
  info: '<circle cx="16" cy="16" r="14" fill="#1d6fd8"/><path d="M16 14v9" stroke="#fff" stroke-width="3"/><circle cx="16" cy="9.5" r="2" fill="#fff"/>',
  question: '<circle cx="16" cy="16" r="14" fill="#1d6fd8"/><path d="M12 12.5a4 4 0 1 1 5.6 3.7c-1.2.5-1.6 1.3-1.6 2.6" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="16" cy="23.5" r="1.7" fill="#fff"/>',
  stop: '<circle cx="16" cy="16" r="14" fill="#d9201c"/><path d="M11 11l10 10M21 11l-10 10" stroke="#fff" stroke-width="3"/>',
}

const BIG = new Set(['warning', 'info', 'question', 'stop'])
</script>

<template>
  <svg
    :viewBox="BIG.has(name) ? '0 0 32 32' : '0 0 16 16'"
    aria-hidden="true"
    focusable="false"
    v-html="ICONS[name] ?? ICONS.box"
  />
</template>
