// Send message to server.
function optIn() {
    var choice = $('#current-price').text();
    socket.emit('opt-in', choice);
}

// On connection, register to listen for certain messages from server.
function connected() {

    // Data sent automatically at beginning of a stage.
    socket.on('auto-stage-data', function(player) {
        console.log('stage-data');
        data.player = player;
        var group = player.group;
        $('#my-bidder-id-result').text(player.id);
        $('#my-value').text(player.value);
        if (group.foundWinner) {
            $('#winner-info').html('Bidder ' + group.winnerName + ' won the auction at a price of E$ ' + group.winningPrice + '.');
        } else {
            $('#winner-info').html('No bidder accepted a price.');
        }
        if (player.id == group.winnerName) {
            $('#payoff-desc').text('your value, E$' + player.value + ', minus the price, E$' + group.winningPrice + ' = ');
        } else {
            $('#payoff-desc').text('');
        }
    });

    socket.on('set-price', function(msg) {
        $('#current-price').text(msg);
    });

}
