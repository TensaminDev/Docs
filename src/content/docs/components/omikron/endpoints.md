---
title: Endpoints
---

To use the `Omikrons` functions a Secure Websocket connection must be established.
Where to connect is provided by the `Omega` Server.
All entries are split into `Iota` & `Client`.
As the `Omikron` connects the `Iota` and `Client` by passing messages from one to the other all Communication from `Iota` to `Client` has to contain a `receiver_id`
The `Omikron` will add a `sender_id` to Messages from `Client` to the `Iota`.

The `receiver_id` and `sender_id` of the `Omikron` server are `22222222-2222-2222-2222-222222222222`.

## Identification

Any message to the `Omikron` will be ignored until Identification.

### Iota

##### `REQ:`

```json
{
  "type": "identification",
  "data": {
    "iota_id": "<iota-id>",
  }
}
```

##### `REQ & RES:`

```json
{
  "type": "challenge",
  "data": {
    "public_key": "<omikrons public key>",
    "challenge": "<random encrypted b64 string>"
  }
}
```
##### `REQ & RES:`

```json
{
  "type": "challenge_response",
  "data": {
    "challenge": "<decrypted b64 string>",
  }
}
```
##### `RES:`

```json
{
	"type": "identification_response",
	"data": {
	    "accepted": boolean,
	}
}
```

---

### Client

This is a two step process.

Get a challenge:

#### `REQ:`

```json
{
  "id": "<uuid>",
  "type": "identification",
  "data": {
    "user_id": "<user-id>"
  }
}
```

#### `RES:`

```json
{
  "id": "<uuid>",
  "type": "challenge",
  "data": {
    "challenge": "<base64 string>",
    "public_key": "<base64 string>"
  }
}
```

Send back the solved challenge:

#### `REQ:`

```json
{
  "id": "<uuid>",
  "type": "challenge_response",
  "data": {  
    "challenge": "<decrypted challenge>"
  }
}
```

#### `RES:`

```json
{
  "id": "<uuid>",
  "type": "identification_response",
  "data": {}
}
```

## Ping & Pong

A ping request comes from the Client or Iota and the Omikron returns a pong answer.
The ping request should contain the last Client or Iota ping and the pong answer will contain the last ping of the Omikron.****

### Iota

#### REQ:

```json
{
	"id": "<uuid>",
	"type": "ping",
	"data": {
		"last_ping": long
	}
}
```

#### RES:

```json
{
  "id": "<uuid>",
  "type": "pong",
  "data": {
  	"user_ping": {
  	  "<user-id>": long,
  	  "<user-id>": long
  	}
  }
}
```

### Client

#### `REQ:`

```json
{
  "id": "<uuid>",
  "type": "ping",
  "data": {
  	"last_ping": long
  }
}
```

#### `RES:`

```json
{
  "id": "<uuid>",
  "type": "pong",
  "data": {
  	"last_ping": long
  }
}
```
