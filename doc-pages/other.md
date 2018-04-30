# DEVELOPING AND TESTING
There are several ways to test your app if you are using Google Chrome as a browser (support may vary with other browsers).

Enter “debugger” statements in your app.js file. This will launch the browser debugger when the code reaches one of these statements, and you will be able to interact with the server via a console and step through code line by line.
Set breakpoints in your client-side code.
Use the browser console to interact directly with the client interface.

Complete details of these features are available on the Google Chrome developer website (debugging; using the console).

Apps use ...

# TABLES
A table represents an array of items that can change dynamically throughout a session. To create a Table called offers in a Group object, simply call:

```javascript
// app.js
group.addTable(‘offers’);
```

Then, in client.html, the contents of this Table can be presented in a `<select>` element with the corresponding “jt-table” attribute:

```html
// client.html
<select jt-table='offers'></table>
```

Rows are added to the Table on the server by calling:

```javascript
// app.js
group.offers.new(row);
```

When this code is called, it automatically notifies clients of a new row, which in turn calls the client side code:

```javascript
// On client.
offersAdd(newRow);
```

This adds the new row to the client-side table object, and displays it using:

```javascript
// On client.
offersShow(row);
```

This function displays the row on the screen:

For all elements with the attribute “data-table=offers”, repeat:
Add an `<option>` element to the parent element.

The following data attributes are supported on the select element:
- data-show: the property to show of the rows
- data-sortasc: sort ascending by this property
- data-sortdesc: sort descending by this property
- data-filter: only show rows in which this expression returns true (for example, “row.x == 5” will only show rows where the property is equal to 5).

Rows in which `row.makerPId === player.id` will have blue text.

To customize how a row is displayed, simply write your own “offersShow(row)” function in your client file.

```javascript
// On client.
offersShow = function(row) {
	$(‘body’).append(‘<div>’).text(‘Offer ‘ + row.id);
}
```

This will instead add a new <div> element with the text “Offer x” to the page, where x is the id of the new row.

# SENDING MESSAGES
## Clients to server
Any type of message can be sent to the server using the “sendMessage(title, data)” function from the client:

```javascript
// client.html
sendMessage(“sendNumber”, 15)
```

This calls the corresponding app.messages.title(data) on the server, therefore this function should be defined in the app.js file:

```javascript
// app.js
app.messages.sendNumber = function(x) {
	// do something with x.
	this.participant.player.x = x;
}
```

The server-side function is called within the context of the client object that sent the message (i.e. this = the client). This means that the currently active player of this client can be accessed using this.participant.player.

## Server to clients
Messages can be sent to clients in two ways. First, to update a client with the latest version of its player object, the player.sendUpdate function can be used. This will send a copy of the player update to the clients of the player, and call the ‘auto-stage-data’ function.

The second way to send messages is via the emit(title, data) function. This exists for both player and group objects. It takes two arguments, the title of the message to send, and the data to be processed.

```javascript
// app.js
group.emit(‘customMsg’, ‘Hello!’);
```

Using this method, it is necessary to listen explicitly for these messages on the client. This is done by calling socket.on in the connected() method:

```javascript
// On client.
connected = function() {
    socket.on('customMsg', function(data) {
        console.log(data);
    });
}
```

## Circular references
Message data can be any ordinary Javascript object. When the message is sent, the message data is converted to string format. For this reason, it is important that it does not include any circular references. For example, consider the following objects a and b, where:

```javascript
a.linkToB = b
b.linkToA = a
```

Sending either object as message data will throw a `RangeError`. To avoid this problem, the circularity can be temporarily broken, sending the message, then re-establishing the link.

```javascript
a.linkToB = undefined
group.emit(‘sendA’, a)
a.linkToB = b
```
