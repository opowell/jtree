This tutorial will show you how to program the simple public goods game used in the previous section. Create a file called `my-public-goods.jtt` in the `<jtree>/apps/` folder. The `.jtt` file extension tells jtree this file is an app file.

First, we will define the parameters and stages of the app. Each app file begins with a pre-defined App object called `app`, and fields are modified and/or added to this object using regular Javascript. Add the following code to your file now:

```javascript
app.numPeriods  = 10
app.groupSize   = 4
app.endowment   = 20
app.prodFactor  = 2
```

The code above sets the number of periods for this App to 10, and the number of players per group to 4. The complete set of pre-defined fields and methods for the App object (and all other jtree objects) is available in the Reference documentation. The last two lines create new fields specific to this app, the endowment that each player will begin with (20), and the production factor (2).

The next step is determining the stages of your app. Stages of an app are repeated a given number of times. The repeated public goods game has the following stages:

1. Decision stage: players choose how much to contribute.
2. Results stage: players are shown their profit for this period.

Stages are created and added to the app using the `app.newStage(stageId)` function. Add the following code to the your file:

```javascript
var decideStage  = app.newStage('decide')
var resultsStage = app.newStage('results')
```

Once a stage has been created, fields and functions of that stage can be set and/or overwritten. For example, to set the duration of the results stage to 30 seconds, we use:

```javascript
resultsStage.duration = 30
```

In jtree, players go through an app as part of a group. Therefore it is usually important to define what happens when a group and/or individual player starts each stage of the app.

In the decision stage, the server simply waits for and saves input from the client. jtree handles this sort of behavior automatically for you, therefore there is no server-side logic to write for this stage (the user interface for this stage is defined later). On the other hand, when a group starts playing the results stage, production of the public good and payoffs need to be calculated.

Add the following to the end of your file:

```javascript
// app.js
resultsStage.groupStart = function(group) {
    group.contributions = Utils.sum(group.players, 'contribution')
    group.production = group.contributions * app.prodFactor
    group.prodPerPlayer = group.production / group.players.length
}
```

The `Stage.groupPlay(group)` function is called whenever a group begins playing the stage in question. It is passed the Group object as an argument. In our example, whenever a group starts playing this stage, the group contributions, production and production per player are calculated and stored as fields of the group object.

When a player begins the Results stage, we want to calculate their points for the current period. Add the following to the end of the `app.js` file:

```javascript
// app.js
resultsStage.playerStart = function(player) {
    player.points =   app.endowment
                    - player.contribution
                    + group.prodPerPlayer
    }
}
```

The `Stage.playerPlay` function is called whenever a player begins playing the stage, and is executed after the `stage.groupPlay` function. It is passed a Player object.

In summary, the content of the app file is the following:

```javascript
app.numPeriods  = 10
app.groupSize   = 4
app.endowment   = 20
app.factor      = 2

var decideStage  = app.newStage('decide')
var resultsStage = app.newStage('results')

resultsStage.duration = 30
resultsStage.groupStart = function(group) {
    group.contributions = Utils.sum(group.players, 'contribution')
    group.production = group.contributions * app.prodFactor
    group.prodPerPlayer = group.production / group.players.length
}
resultsStage.playerStart = function(player) {
    player.points =   app.endowment
                    - player.contribution
                    + group.prodPerPlayer
    }
}
```

### client.html

The `client.html` file contains all of the display information for the app. When a participant begins playing our app, this is the page it sees in the browser. The user interface is written in HTML, which consists of sets of tags. Tags are written in between greater than `<` and less than `>` characters, such as `<p>`. Tags can contain content, in which case they should also have an ending tag: `<p>This is a paragraph tag.</p>`.

For this app, we will split our interface into a header and various screens. Only one screen at a time will be shown to the player. We will use one screen for each stage of the app, plus a generic waiting screen for when a participant is waiting to proceed to the next stage. This gives us the following content:

1. Header
2. Decide screen
3. Results screen
4. Waiting screen

Now we create the elements that make up each of these parts.

We start with the header. The header will contain the current period the participant is in. Create a file called `client.html` in the app folder. Add the following text to the file:

```html
<p>Period: 1/10</p>
```

For now, the elements we are creating are static (they will not update as the player progress through the app); later on in this tutorial we will make them dynamic.

One of the advantages of building HTML webpages is that it is easy to check your progress. Open the `client.html` page in your browser now and you should see something similar to:


Figure 1: A single screen element.

For the 'Decide' screen, we want to show the following information to the player:

- A title (“DECISION”).
- The player's endowment.
- An input field for the player's contribution.
- A button to confirm the contribution.

We will use the following tags: `<p>` (paragraph) to display regular text, `<input>` to create an input field, and `<button>` to create a button field.

Add the following text to the bottom of the `client.html` file:

```html
<p>DECISION</p>
<p>Your endowment is E$20.</p>
<p>Your contribution (E$): <input></p>
<button>Make contribution</button>
```

Now when you view the `client.html` file in the browser, you should see something like:


Figure 2: The elements for the decision screen

The content we wish to show for each of the other two screens is:

*Results screen*.
- A title (“RESULTS”).
- The text “Your endowment was E$20.”.
- The text “In total, players in your group contributed E$X, thus the total amount produced was E$Y.”
- The text “Thus, your payoff in this period is E$Z.”.
- An OK button.

*Waiting screen*
- A title (“WAITING”).
- The text “The experiment will continue soon.”.

These elements can be shown with the following code:

```html
<p>RESULTS</p>
<p>Your endowment was E$20.</p>
<p>In total, players in your group contributed E$X, thus the total amount produced was E$Y.</p>
<p>Your payoff in this period is E$Z.</p>
<button>OK</button>
<p>WAITING</p>
<p>The experiment will continue soon.</p>
```

Add this code to the end of the `client.html` file. For the moment, all of these elements will show up on the screen at once. Later we will add code to indicate which parts are to be shown at different times to the player.

Refresh the page in your browser and you should see something like this:


Figure 3: The elements for all screens

We have now created all of the elements of the interface. Before we can actually use our app, we need to add a bit of functionality behind the scenes. First, we need to replace fixed values with dynamic ones. Second, we need to only show certain parts of the screen, depending on the particular stage the player is in. Third, we need to make sure decisions are sent to the server. None of these changes affect the preview of our interface, which should continue to look like Figure 3.

#### Dynamic values
At the start of each stage, jtree sends a Player object to each client. The Player object consists of all Player fields, including information about all parent objects (Group, Period, App, Session - see Reference for complete details). When a client receives this data, it automatically updates the parts of the page that have a `jt-text` attribute.

For example, suppose we want to show the current period number. This is stored in the `player.group.period.id` field. So if we replace:

```html
<p>Period: 1/10</p>
```

with:

```html
<p>Period: <span jt-text='period.id'>1</span>/<span jt-text='app.numPeriods'></span></p>
```

then at the beginning of each stage, the content of the `<span>` tag will update with the current value of the `player.group.period.id` and `app.numPeriods` fields.

In practical terms, `<p>` and `<span>` are very similar. The only difference is in their default layout: `<p>` creates a new paragraph, whereas `<span>` does not (which is why it is used in this case).

The HTML element will take the javascript value of the expression in the `jt.value` attribute, so this can be a single variable (i.e. `'period.id'`), or a longer expression that includes several variables (i.e. `'period.id + 5'`). It has access to `player`, `group`, `period`, `app`, `session` and `stage` objects.

The other dynamic fields we wish to show are the group contributions (`group.contributions`), total amount produced (`group.production`), and the player's payoff (`player.points`). Because these values will often be floating point numbers, we use the `jt-decimals` attribute to specify the number of decimal places to be displayed. The final code ends up looking like this:

```html
<p>Period: <span jt-text='period.id'>1</span>/<span jt-text='app.numPeriods'></span></p>
<p>DECISION</p>
<p>Your endowment is E$<span jt-text='app.endowment'></span>.</p>
<p>Your contribution (E$): <input></p>
<button>Make contribution</button>
<p>RESULTS</p>
<p>Your endowment was E$<span jt-text='app.endowment'></span>.</p>
<p>In total, players in your group contributed E$<span jt-text='group.contributions'>X</span>, thus the total amount produced was E$<span jt-text='group.production' jt-decimals=2>Y</span>.</p>
<p>Thus, your payoff in this period is E$<span jt-text='player.points' jt-decimals=2>Z</span>.</p>
<button>OK</button>
<p>WAITING</p>
<p>The experiment will continue soon.</p>
```

# Screens

We implements screens by separating and wrapping the screen content in <p> tags, and then setting the data attributes of these tags to tell jtree when to show and hide each element. In particular, modify the interface to have the following structure:

```html
<p>Period: <span jt-text='period.id'>1</span>/<span jt-text='app.numPeriods'></span></p>
<p jt-status='playing'>
<p jt-stage='decide'>
		<p>DECISION</p>
<p>Your endowment is E$<span jt-text='app.endowment'></span>.</p>
<p>Your contribution (E$): <input></p>
<button>Make contribution</button>
</p>
<p jt-stage='results'>
<p>RESULTS</p>
<p>Your endowment was E$<span jt-text='app.endowment'></span>.</p>
<p>In total, players in your group contributed E$<span jt-text='group.contributions'>X</span>, thus the total amount produced was E$<span jt-text='group.production' jt-decimals=2>Y</span>.</p>
<p>Thus, your payoff in this period is E$<span jt-text='player.points' jt-decimals=2>Z</span>.</p>
<button>OK</button>
</p>
</p>
<p jt-status='waiting'>
    <p>WAITING</p>
    <p>The experiment will continue soon.</p>
</p>
```

Don't forget to include closing tags. Indentation is not required in HTML, but is useful to keep the code organized.

At the beginning of a stage, elements with a `jt-stage` attribute that match the name of the current stage are shown. Elements with a `jt-stage` attribute that do not match are hidden. The same applies to the status of the player and the `jt-status` attribute.

# Sending input to the server

jtree provides default behavior for sending input to the server via HTML `<form>` tags. `<form>` tags consist of a set of `<input>` tags, and a `<button>` at the end that submits the form. HTML provides several attributes for `<input>` elements, such as type, required, min, max, and step, that allow you to restrict the set of values that can be entered. The `<button>` submits the form to the server. The server will set the appropriate fields on the `player` object based on the name attribute of the `<input>` tags. For example, when a form with the tag `<input name='player.contribution'>` is submitted, the `player.contribution` variable will be set to the value of the `<input>` field. After a form is submitted in this manner, players automatically advance to the next stage.

Modifying the code to incorporate this functionality gives the following:

```html
<p>Period: <span jt-text='period.id'>1</span>/<span jt-text='app.numPeriods'></span></p>
<span jt-status='playing'>
    <span jt-stage='decide'>
		<p>DECISION</p>
        <p>Your endowment is E$<span jt-text='app.endowment'></span>.</p>
        <form>
            <p>Your contribution (E$): <input name='player.contribution' required type='number' min=0 jt-max='app.endowment' step=1></p>
            <button>Make contribution</button>
        </form>
    </span>
    <span jt-stage='results'>
        <p>RESULTS</p>
        <p>Your endowment was E$<span jt-text='app.endowment'></span>.</p>
        <p>In total, players in your group contributed E$<span jt-text='group.contributions'>X</span>, thus the total amount produced was E$<span jt-text='group.production' jt-decimals=2>Y</span>.</p>
        <p>Thus, your payoff in this period is E$<span jt-text='player.points' jt-decimals=2>Z</span>.</p>
        <form>
            <button>OK</button>
        </form>
    </span>
</span>
<span jt-status='waiting'>
    <p>WAITING</p>
    <p>The experiment will continue soon.</p>
</span>
```

If a form only contains a single button, this button submits the form when clicked. Otherwise, the attribute type='submit' must be explicitly added to one of the buttons in the form.

# Finishing touches

The functionality we just added requires the jtree client script to operate. Scripts can be imported into a page using a `<script>` tag. In the case of a jtree app, the contents of the `client.html` file should include:

```html
<script type="text/javascript" src='/participant/jtree.js'></script>
```

This script loads files that are used to connect the client to the server and implement certain default behavior (see Reference for more details).

And now the app is complete. To test it, simply follow the previous tutorial on running a session.
