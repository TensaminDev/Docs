---
title: WSS Endpoints
---

The `Omega` can be reached by HTTPS request from `Client` and `Iota`.
`Omikron` servers establish a Secure Websocket when booting.

This documentation is split into `Omikron` (WSS) and `HTTPS`.

## Omikron

### Identification

Any message to the `Omega` will be ignored until Identification.

##### `REQ:`

```json
{
  "type": "identification",
  "data": {
    "omikron": "<omikron-id>",
  }
}
```

##### `REQ & RES:`

```json
{
  "type": "challenge",
  "data": {
    "public_key": "<omegas public key>",
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

### Push Notification

Sends a push notification to a user. The receiver ID can be specified either in the `receiver` field of the message or in the data payload.

##### `REQ:`

```json
{
  "type": "push_notification",
  "data": {
    "receiver_id": "<user-id>", // Optional, if not in receiver field
    "sender_id": "<user-id>"
  }
}
```
