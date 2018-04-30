You can include an external resource (image, stylesheet or javascript library/file) in your client interface by linking to it in your client.html file:

```html
<script src="appId/my_script.js"></script>
<link rel="stylesheet" href="appId/my_stylesheet.css">
<img src=”appId/my_photo.jpg”>
```

The corresponding files should be located in the folder `jtree/apps/<appId>` folder. When running the app, the `src` attributes must include the appId, however if you are just opening the client.html file directly in the browser for testing purposes (and not via jtree), then the paths should not include the appId.
