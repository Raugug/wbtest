# Node.js wbtest

## Context

New mobile recharge service for various events: music festivals and the like.

The charging process will be as follows:

A customer hands over his mobile phone and in return receives a device that will indicate the status of the charging process. This device has a led that changes color depending on the state of the charge:

     - red: charging
     - yellow: charge level at least 80%
     - green: fully charged

When the led turns green, the customer can return to the booth, pay for the service and exchange the device for their charged mobile phone.

## Your mission (if you decide to accept it)

Develop a server to which both chargers and devices will connect via websockets.

During the charging process, the charger periodically sends the charge level to the server.

The server processes these messages and sends a charging status to the device associated with that charger.

Each charger has a unique device associated with it (for example, the charger _c1234_ is associated with the device _wABCD_)

### Chargers

Chargers connect to the server like this:

```javascript
const connection = new WebSocket('ws://localhost:3100/chargers/c1234');
```

where _c1234_ is the charger id.

The messages that the chargers send us indicating their charge level (_State of Charge_) are as follows:

```javascript
connection.send(
	JSON.stringify({
		event: 'StateOfCharge',
		data: {
			soc: 70,
		},
	})
);
```

### Devices

Devices connect to the server like this:

```javascript
const connection = new WebSocket('ws://localhost:3200/widgets/wABCD');
```

where _wABCD_ is the device id.

The devices receive messages from the server indicating the charging status (`charging`,` charging80`, and `charged`):

```javascript
{
    event: "StateOfCharge",
    data: {
        status: "charging",
    }
}
```

The possible state of charge are:

- `charging`
- `charging80`: charge level at 80% or higher
- `charged`: fully charged

## Support tools

To make your life easier, we have created some mocks of the charger (_charger_) and the device (_widget_). You should launch each one in a different terminal.

### Charger mock

```bash
npm run start:charger
```

It connects to your server and allows you to send charge level messages.

### Device mock

```bash
npm run start:widget
```

It connects to your server and displays the status it receives on the screen.

### Run Test

```bash
npm test
```

### Run server in development

```bash
npm run start:server-dev
```

### Run Server

```bash
npm run start:server
```

Launch in different terminal. It should be running before launching charger and widget mocks.