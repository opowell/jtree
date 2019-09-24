This tutorial will show you how to program the simple public goods game used in the previous section. From the "Apps" page, click "create...". Type `my-public-goods` as the filename, then click "Create".

First, we will define the parameters and stages of the app. Each app file begins with a pre-defined App object called `app`, and fields are modified and/or added to this object using regular Javascript. Add the following code to your file now:

```javascript
app.numPeriods  = 10;
app.groupSize   = 4;
app.endowment   = 20;
app.prodFactor  = 2;
```

The code above sets the number of periods for this App to 10, and the number of players per group to 4. The last two lines create new fields specific to this app, the endowment that each player will begin with (20), and the production factor (2).

The next step is determining the stages of your app. Stages of an app are repeated a given number of times. The repeated public goods game has the following stages:

1. Decision stage: players choose how much to contribute.
2. Results stage: players are shown their profit for this period.

Stages are created and added to the app using the [`app.newStage(stageId)`]{@link App#newStage} function. Add the following code to your file:

```javascript
var decideStage  = app.newStage('decide');
var resultsStage = app.newStage('results');
```

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

The `name` attribute of an `<input>` tag is the name of the field where the input will be stored. So, `player.contribution` will store the value of the input in a field called `contribution` on the `player` object.

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
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
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
<p>In total, players in your group contributed {{group.contributions}} E$, thus the total amount produced was {{group.production.toFixed(2)}} E$.</p>
<p>Thus, your payoff in this period is {{player.points.toFixed(2)}} E$.</p>
`;
```

In summary, the content of the app file is the following:

```javascript
app.numPeriods  = 10;
app.groupSize   = 4;
app.endowment   = 20;
app.factor      = 2;

var decideStage = app.newStage('decide');
decideStage.activeScreen = `
    <p>DECISION</p>
    <p>Your endowment is {{app.endowment}} E$.</p>
    <p>Your contribution (E$): <input name='player.contribution' required type='number' min='0' :max='app.endowment' step='1'></p>
`;

var resultsStage = app.newStage('results');
resultsStage.groupStart = function(group) {
    group.contributions = group.sum('contribution');
    group.production = group.contributions * app.factor;
    group.prodPerPlayer = group.production / group.players.length;
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
        player.points = app.endowment - player.contribution + group.prodPerPlayer;
    }
}
resultsStage.activeScreen = `
    <p>RESULTS</p>
    <p>Your endowment was {{app.endowment}} E$. You contributed {{player.contribution}} E$.</p>
    <p>In total, players in your group contributed {{group.contributions}} E$, thus the total amount produced was {{group.production.toFixed(2)}} E$.</p>
    <p>Thus, your payoff in this period is {{player.points.toFixed(2)}} E$.</p>
`;
```

And now the app is complete. To test it, simply follow the previous tutorial on <a href='file:///Users/esragul/Downloads/jtree-0-2/internal/docs/tutorial-3-running-a-session.html'>running a session.</a>
