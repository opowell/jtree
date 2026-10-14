A room gives participants a link that stays the same from session to session, for example one per lab computer. Participants open the room's link, enter their label, and wait; when a session is opened in the room, they go to their page in it.

#### Making a room

A room is a folder in `client/rooms`, named by the room's id, with:

- `labels.txt`: the participants' labels, one per line (optional);
- `room.json`: its settings (optional): `displayName`, shown to participants, and `useSecureURLs` (default `true`), which asks participants for their label's secret code too.

```json
{ "displayName": "Lab 1", "useSecureURLs": false }
```

An oTree project's `ROOMS` are rooms too, with the labels from their `participant_label_file`.

#### Using a room

Participants open `http://<server>:3000/room/<room id>`, and enter their label.

In the admin, the Session panel lists the rooms and their links: "Open this session here" opens the session in a room. Participants waiting in the room, and those who come later, go to their page in the session, each as the participant with their label (or, without one, the next participant, which gets their label). When the session is full, the room says so. The oTree admin's Rooms page does the same.
