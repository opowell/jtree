Many aspects of HTML elements can be changed, such as color, padding, size and font style (see <a href='https://www.w3schools.com/CSSref/'>w3schools.com</a> for a good reference). One way is to edit the attributes of an element directly:

```html
<p style=’color: blue’>This text will be blue.</p>
```

However, once you want to change more than a handful of attributes, this method gets quite cumbersome. It becomes more efficient to use a stylesheet. The basic idea is that the styles are stored in a stylesheet, the stylesheet is imported into the HTML file, and the class attribute of the elements indicate which styles to apply to each.

The following would be the equivalent stylesheet:

```css
// myStyles.css
.blueText {
	color: blue;
}
```

Then in your HTML, the stylesheet is imported in the <head> tag, and the styles are applied via the class attribute:

```html
// client.html
<link rel="stylesheet" href="<appId>/myStyles.css">
<p class=’blueText’>This text will be blue.</p>
```
