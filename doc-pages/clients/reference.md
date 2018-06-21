#### App

##### `description = 'No description provided.'`
The description of the app, only used in the administrator interface.

##### `html`
Default value:
`<p>Period: {{period.id}}/{{app.numPeriods}}</p>
<p id='time-remaining-div'>Time left: {{clock.minutes}}:{{clock.seconds}}</p>
<span jt-status='active'>
    {{stages}}
</span>
<span jt-status='waiting'>
    <p>WAITING</p>
    <p>The experiment will continue soon.</p>
</span>
`
The content to display at the beginning of the page.

##### `insertJtreeRefAtStartOfClientHTML = true`
Whether or not to insert a link to the jtree library at the start of the page content.

##### `numPeriods = 1`
The number of times to repeat the stages of this app.

##### `textMarkerBegin = '{{'`
The marker that denotes the start of dynamic content in a screen.

##### `textMarkerEnd = '}}'`
The marker that denotes the end of dynamic content in a screen.

#### Group

#### Participant

#### Period

#### Player

#### Session

#### Timer
