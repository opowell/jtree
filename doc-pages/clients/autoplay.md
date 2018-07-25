The client has the function [`jt.setAutoplay(boolean)`]{@link jt#setAutoplay} for starting and stopping autoplay. When true, this sets an interval that regularly calls the function [`jt.autoplay()`]{@link jt#autoplay}. By default, this function tries to set the value of a single input that currently has no value. If this is not possible, it tries to “click” a button. If this is not possible, it tries to submit a form.

To implement custom autoplay functionality, simply overwrite the “jt.autoplay” function.

```javascript
<script>
jt.autoplay = function() {
  // Custom functionality goes here.
}
</script>
```
