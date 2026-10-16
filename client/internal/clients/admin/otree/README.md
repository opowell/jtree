# admin-otree

Served at `/admin/otree/` under jtree's route: an admin for people who know oTree, built like
[admin2](../v2/README.md) (Vue single-file components compiled in the browser by `boot.js`; no
build step) with Bootstrap 5. The Studio's code fields (functions, methods, templates, `__init__.py`,
`settings.py`) are CodeMirror 6 (`/shared/codemirror-6.43.14/`), in `src/components/CodeEditor.vue`.

| View | What it is |
| --- | --- |
| Sessions | Create a session from a project's session config, with its config values; the sessions. |
| Session | Its links, monitor, data, admin reports and payments, as oTree's session pages have them. |
| Rooms | The projects' rooms, their labels and who is waiting. |
| Apps | The oTree apps; Convert writes a jtree app beside one. |
| Studio | oTree projects and apps made and changed as in oTree Studio (below). |

## Studio

`#/studio` lists the oTree projects (folders with a `settings.py`) and apps in the apps folder, and
makes new ones, as oTree Studio starts them.

- **A project** (`#/studio/project/<settings.py>`): its apps, and New app; its session configs
  (name, display name, the apps in order, demo participants, doc, other values), added and deleted;
  and its settings (currency, points, language, participant and session fields, config defaults).
- **An app** (`#/studio/app/<folder>`): its constants; the Subsession, Group and Player fields
  (name, type, label, min, max, initial, choices, blank, widget, doc, and any other argument);
  its functions; its pages in their sequence (added, renamed, moved, left out, deleted), each with
  its template's title and content, its form model and fields and timeout, or a wait page's
  after_all_players_arrive, and its methods (is_displayed, vars_for_template, before_next_page, …);
  and the whole `__init__.py`.

Python reads the files (`server/source/dialects/otree/python/otree_studio.py`) and the server makes each
change in them (`server/source/editors/otree.js`, at `/api/editor/otree/…`), changing only the part
it is about, so code written by hand, and comments, stay as they were. Save writes the app's
`__init__.py` and its pages' templates (only the template blocks that changed), or `settings.py`.
The apps are oTree's: they run in jtree and in oTree. Apps in oTree's older format (`models.py`) run
in jtree but are not edited here.
