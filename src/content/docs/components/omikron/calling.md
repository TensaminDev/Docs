---
title: Calling
---

Calling authentication happens on the Omikron and the actual traffic goes trough a self hosted instance of LiveKit. The self hosted LiveKit instance also acts as the signaling server for the calls. The Omikron only authenticates users to join calls.

## Getting a `Call-Token`

To get a `Call-Token` provide a `Call-ID`, when the `Call-ID` provided is currently in use and the user is not invited an error will be returned.
Else:

##### `REQ:`

```json
{
  "type": "call_token",
  "data": {
    "call_id": "<uuid>"
  }
}
```

##### `RES:`

```json
{
  "type": "call_token",
  "data": {
    "call_token": "<token>"
  }
}
```

## Inviting someone

Inviting someone to a call that does not exist or you're not invited to will result in an error.

##### `REQ:`

```json
{
  "type": "call_invite",
  "data": {
    "call_id": "<uuid>",
    "receiver_id": "<uuid>"
  }
}
```

##### `RES:`

```json
{
  "type": "success"
}
```

##### `FORWARD:`

```json
{
  "type": "call_invite",
  "data": {
    "call_id": "<uuid>",
    "sender_id": "<uuid>"
  }
}
```
