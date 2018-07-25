Button actions can be set explicitly using the `onclick=...` attribute:

```html
// client.html
<button onclick='buttonClick();'>
// in client-side javascript
var buttonClick = function() { … }
```

Or in Javascript

```javascript
// In client-side javascript
$('#myButton').click(buttonClick);
```

Buttons can also be linked to select elements by setting their `jt-select` attribute to the name of the corresponding select element.

```html
// client.html
<select name='offersSelect'>...</select>
<button jt-select='offersSelect' jt-action='buttonClick'>
```

This will call the `buttonClick` function on the server, passing in the ID of the currently selected row in the `offersSelect` element. The action function needs to be defined on the server:

```javascript
app.messages.buttonClick = function(id) {
	// do something.
}
```

If the `jt-enabledIf` attribute is present, the button is only active when its condition is fulfilled. `selRow` refers to the selected table row.

```html
<button jt-select='offersSelect' jt-action='buttonClick' jt-enabledIf='selRow.x > 5'>
```
