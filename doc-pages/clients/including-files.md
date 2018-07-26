You can include an external resource (image, stylesheet or javascript library/file) in your screens by linking to it in your HTML content:

```html
<script src='<appId>/my_script.js'></script>
<link rel='stylesheet' href='<appId>/my_stylesheet.css'>
<img src='<appId>/my_photo.jpg'>
```

where `<appId>` is the [unique identifier]{@link App#id} of the app.
The corresponding files should be located in the folder `jtree/apps/<appId>` folder. The `src` attributes must include the appId.

For example, see the `pictures` app.
