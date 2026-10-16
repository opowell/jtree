This tutorial will show you how to program the simple public goods game used in the previous section. In the admin, choose File → New app…. Type `my-public-goods` as the file name, then press "Create". jtree writes `client/apps/my-public-goods.jtt`, and opens it in the App editor.

[Note: "App", "Game" and "Treatment" are used interchangeably in jtree.]

An app is a Javascript file. The App editor shows it in three modes:

- **Structured**: the app as a tree, as z-Tree shows a treatment: its stages, each stage's screens, the elements on each screen (paragraphs, inputs, buttons, ...), and its functions. Choose something in the tree to change it beside the tree: the app's and a stage's settings, an element's text, the variable an input sets (`player.contribution`), its type and limits, and any other attribute. **Add…** puts in a stage, a screen, a function, or an element (a paragraph, a number, a dropdown, radio buttons, a slider, buttons, a table, ...) after the element chosen, or at the end of the screen chosen. Elements can be dragged to another place: before or after another element (the top or bottom half of its row), into a box or a list (the middle of its row), onto a screen (its end), or onto a stage (the end of its active screen), in the same screen or another stage's; hold Ctrl or Alt to copy instead, and drag to another app's editor to copy it there. Stages are dragged to put them in another order. Elements can also be moved with the keys (Alt+↑/↓), duplicated (Ctrl+D), copied, cut and pasted (Ctrl+C/X/V) and deleted (Del). A preview shows the chosen screen, with the chosen element outlined.
- **Forms**: a page for each part: the app's **Settings** and **Functions**, each **stage** (its screens, settings and functions), and **Other code**.
- **Source**: the whole file, where you can write anything; "Apply" (Ctrl+Enter) reads it into the other modes again.

Each change changes only the statement, or the element of a screen, it is about, so the rest of the file stays as you wrote it. Each change is a step of the editor's history, named for what it did ("Move Paragraph", "Set numPeriods"): "Undo" and "Redo" (Ctrl+Z, Ctrl+Shift+Z) go back and forth through it one step at a time, and choose again what was chosen then; the History list beside them goes to any step at once. Steps undone stay in the list until a new change replaces them. This tutorial gives the code, to type in Source; the other modes show what each piece is as you go. "Save" (Ctrl+S) writes the file, and "Save and start a session" also starts a session with the app. You can just as well edit the file in any text editor, then use File → Reload apps.

<img src="images/editor.png" alt="The App editor in Structured mode: the app's tree, with the decide stage's number input chosen and its fields beside it" style="max-width: 100%; border: 1px solid #ddd">

In Forms mode, a stage's page has its screens, settings and functions:

<img src="images/editor-forms.png" alt="The App editor in Forms mode, showing the decide stage's screen, settings and functions" style="max-width: 100%; border: 1px solid #ddd">

First, we will define the parameters and stages of the app. Each app file begins with a pre-defined App object called `app`, and fields are modified and/or added to this object using regular Javascript. Replace what the new app has with the following code:

```javascript
app.numPeriods  = 10;
app.groupSize   = 4;
app.endowment   = 20;
app.factor      = 2;
```

The code above sets the number of periods for this App to 10, and the number of players per group to 4. The last two lines create new fields specific to this app, the endowment that each player will begin with (20), and the production factor (2). In the editor, these are the app's Settings.

The next step is determining the stages of your app. Stages of an app are repeated a given number of times. The repeated public goods game has the following stages:

1. Decision stage: players choose how much to contribute.
2. Results stage: players are shown their profit for this period.

Stages are created and added to the app using the [`app.newStage(stageId)`]{@link App#newStage} function. Add the following code to your file:

```javascript
let decideStage  = app.newStage('decide');
let resultsStage = app.newStage('results');
```

In the editor, the stages are in the tree (Structured) or listed under the app's parts (Forms), where they can also be added, renamed, moved and deleted.

The `content` field of a stage is shown to players when they are active in the stage. Content is mostly regular HTML, which consists of sets of tags. Tags are written in between greater than `<` and less than `>` characters, such as `<p>`. Tags can contain content, in which case they should also usually have an ending tag: `<p>This is a paragraph.</p>`.

For the 'Decide' screen, we want to show the following information to the player:

- A title ("DECISION").
- The player's endowment.
- An input field for the player's contribution.
- A button to confirm the contribution.

We will use the following tags: `<p>` (paragraph) to display text, `<input>` to create an input, and `<button>` to create a button. Set the value of [`decideStage.activeScreen`]{@link Stage#activeScreen} to the following:

```html
<p>DECISION</p>
<p>Your endowment is {{app.endowment}} E$.</p>
<p>Your contribution (E$): <input name='player.contribution' required type='number' min='0' :max='app.endowment' step='1'></p>
```

jtree uses the Vue framework to bind screen elements to player data. For example, regular text that is encapsulated by double curly braces, `{{` and `}}`, is evaluated, rather than interpreted literally. For example, in the decision screen, `{{app.endowment}}` would be replaced with "20". The same applies to tag properties (such as the `max` property in the above example) that are preceded with a `:` character. Available data objects are `player`, `group` (the current player's group), `period` (the group's period), `app`, `session` and `stage`.

<img src="images/participant.png" alt="The decision screen, as players see it" style="max-width: 100%; border: 1px solid #ddd">

The `name` attribute of an `<input>` tag is the name of the field where the input will be stored. So, `player.contribution` will store the value of the input in a field called `contribution` on the `player` object. In the Structured mode, this screen is three paragraphs under the stage's Active screen, the last with the text and the input in it; choosing the input shows its Variable (`name`), Type, Minimum, Maximum (`:max`, an expression), Step and Required.

"OK" buttons do not need to be explicitly added in many cases. They are added automatically to active screens if the screen does not contain any buttons already (see [`Stage.addOKButtonIfNone`]{@link Stage#addOKButtonIfNone}).

Javascript allows multi-line strings through the use of 'backtick' characters, so for example the previous assignment could look like:

```javascript
decideStage.activeScreen = `
    <p>DECISION</p>
    ...
`;
```

For the results stage, we wish to first calculate production of the public good and payoffs, and then display this information to the players. Add the following to the end of your file:

```javascript
resultsStage.groupStart = function(group) {
    group.contributions = group.sum('contribution');
    group.production = group.contributions * app.factor;
    group.prodPerPlayer = group.production / group.players.length;
    for (let i in group.players) { // i = 0, 1, 2, 3
        let player = group.players[i];
        player.points = app.endowment - player.contribution + group.prodPerPlayer;
    }
}
```

The [`Stage.groupStart(group)`]{@link Stage#groupStart} function is called whenever a group begins playing the stage in question. It is passed the Group object, which is essentially a list of Players, as an argument. In our example, whenever a group starts playing this stage, the group contributions, production and production per player are calculated and stored as fields of the group object. Then, for every player in the group, points for the current period are calculated.

Now add the screen content:

```javascript
resultsStage.activeScreen = `
<p>RESULTS</p>
<p>Your endowment was {{app.endowment}} E$. You contributed {{player.contribution}} E$.</p>
<p>In total, players in your group contributed {{group.contributions}} E$, thus the total amount produced was {{group.production | round(2)}} E$.</p>
<p>Thus, your payoff in this period is {{player.points | round(2)}} E$.</p>
`;
```

`| round(2)` shows a number rounded to 2 decimal places.

In summary, the content of the app file is the following:

```javascript
app.numPeriods  = 10;
app.groupSize   = 4;
app.endowment   = 20;
app.factor      = 2;

let decideStage = app.newStage('decide');
decideStage.activeScreen = `
    <p>DECISION</p>
    <p>Your endowment is {{app.endowment}} E$.</p>
    <p>Your contribution (E$): <input name='player.contribution' required type='number' min='0' :max='app.endowment' step='1'></p>
`;

let resultsStage = app.newStage('results');
resultsStage.groupStart = function(group) {
    group.contributions = group.sum('contribution');
    group.production = group.contributions * app.factor;
    group.prodPerPlayer = group.production / group.players.length;
    for (let i in group.players) { // i = 0, 1, 2, 3
        let player = group.players[i];
        player.points = app.endowment - player.contribution + group.prodPerPlayer;
    }
}
resultsStage.activeScreen = `
    <p>RESULTS</p>
    <p>Your endowment was {{app.endowment}} E$. You contributed {{player.contribution}} E$.</p>
    <p>In total, players in your group contributed {{group.contributions}} E$, thus the total amount produced was {{group.production | round(2)}} E$.</p>
    <p>Thus, your payoff in this period is {{player.points | round(2)}} E$.</p>
`;
```

And now the app is complete. Press "Save and start a session" to test it, then follow the previous tutorial on <a href='tutorial-3-running-a-session.html'>running a session.</a> If the app has a mistake, its panel says where (file, line and position).

#### An app as a folder
An app can also be a folder: a file `app.jtt` that sets up the app, and one `.jtt` file per stage beside it. The stage files are added after `app.jtt` has run, in the order of their names; a leading number orders them and is not part of the stage's id, so `1_decide.jtt` is the stage `decide`. In a stage's file, `stage` is that stage and `app` is the app. The public goods game above, as a folder (see `apps/1 sample games/public-good-v2`):

```javascript
// app.jtt
app.numPeriods  = 10;
app.groupSize   = 4;
app.endowment   = 20;
app.factor      = 2;
```

```javascript
// 1_decide.jtt
stage.activeScreen = `
    <p>DECISION</p>
    <p>Your contribution (E$): <input name='player.contribution' required type='number' min='0' :max='app.endowment' step='1'></p>
`;
```

```javascript
// 2_results.jtt
stage.groupStart = function(group) {
    group.contributions = group.sum('contribution');
    // ...
}
stage.activeScreen = `<p>RESULTS</p> ...`;
```

`app.jtt` can still create stages itself, with `app.newStage(id)`, or add a stage file under another id with [`app.addStage(id, file)`]{@link App#addStage}; files it adds are not added again. Other files in the folder (images, `client.js`, ...) are not stages, and the whole folder is copied to the session's output.

#### Checking what players enter
The page's `min`, `max` and `required` only guide the browser. To have the server check what a form sends, declare its fields in `app.fields`, by the name the form uses:

```javascript
app.fields = {
    'player.contribution': { type: 'int', min: 0, max: function(player) { return app.endowment; } },
    'player.color': { type: 'choice', choices: ['red', 'blue'] },
    'player.comment': { type: 'string', blank: true },
};
decideStage.formFields = ['player.contribution', 'player.color'];
decideStage.validate = function(player, values) {
    if (values['player.color'] === 'red' && values['player.contribution'] > 10) {
        return 'Red allows at most 10.';
    }
};
```

`type` is `int`, `number`, `string`, `bool` or `choice`; `min`, `max` and `choices` can be values or functions of the player; a field must be filled in unless `blank` is `true`. [`stage.formFields`]{@link Stage#formFields} lists the fields a stage's form must send, and [`stage.validate(player, values)`]{@link Stage#validate} checks them together, returning a message (or messages by field name). If anything is wrong, nothing is stored, the stage goes on, and the page shows the messages under the fields; templates can show them too, from `formErrors`, e.g. `{{ formErrors['player.contribution'] }}`. Values are stored converted to their type: `'07'` for an `int` field is `7`, and for a `string` field stays `'07'`.
