jtree allows you to customize the behavior of HTML elements using special attributes. Any attribute that begins with `jt-` will be updated whenever a player update is received.

Attributes take the form of `jt-<name>="<expression>"`. The expression can be a single variable (i.e. `'period.id'`), or a longer expression that includes several variables (i.e. `'period.id + player.points'`). It has access to `player`, `group`, `period`, `app`, `session` and `stage` objects. The particular behavior of the update depends on the value of `<name>`.

### `jt-displayIf`
Adding this attribute to an element dynamically hides and shows the element whenever player data is changed. If the value of this attribute returns `true`, the element is shown. Otherwise, the element is hidden. All such elements can be refreshed by calling the function `jt.evaluateDisplayConditions()`.

### `jt-text` or `jt-value`
The text value of the element is replaced by the value of the expression.

### `jt-html`
The HTML value of the element is replaced by the value of the expression.

### `jt-decimals`
The element's text is formatted to the given number of decimal places.

### `jt-<attribute>`
Any other attribute of this form will create a new attribute on the element with the name `<attribute>` and a value equal to the evaluated expression. This is useful, for example, when a number input should have a dynamic minimum and/or maximum value. 
