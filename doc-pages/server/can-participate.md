By default, all players will play all stages of an app. This behaviour can be customized by creating a `Stage.canPlayerParticipate(player)` function that returns true if the player should play the stage, or false otherwise.

Here is an example:

```javascript
// app.js
myStage.canPlayerParticipate = function(player) {
	if (player.idInGroup == 1) {
		return true;
	} else {
		return false;
    }
}
```

In this example, only the first players of each group will play `myStage`. Other players will proceed directly to the next stage, without calling `myStage.playerStart` and `myStage.playerEnd`.
