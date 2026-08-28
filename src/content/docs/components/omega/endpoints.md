---
title: MTP Endpoints
lastUpdated: 2026-08-14
---

`Omega` serves HTTPS API routes and authenticated MTP WebTransport sessions.
`Omikron` connects through the MTP WebTransport endpoint. The Omega service
uses MTP protocol version `0.3.0` and requires transport authentication before
dispatching application frames.

This document covers the MTP connection between `Omikron` and `Omega` and the
control messages handled after authentication. HTTP routes are documented in
[`https.md`](./https.md).

## MTP Omikron Connection

### Authentication

The MTP opening exchange negotiates protocol version `3.0` and completes the
configured cryptographic login or registration flow. Omega uses
`ForceAuthentication`, so an unauthenticated WebTransport session does not
reach the application dispatcher. The authenticated MTP client ID identifies
the `Omikron` connection.

The MTP `Identification`, `Register`, challenge, and signed proof frames are
transport messages. They are not application-level JSON endpoints. After the
handshake, Omega validates the authenticated `Omikron` capability description
before accepting control messages or Relay frames.

### Relay Routing

`Relay` is the reserved MTP communication type for opaque routing between
`Omikron` instances. The logical shape below describes the MTP frame; MTP sends
the frame as binary data, not as JSON.

#### `Relay`

The outer `receiver` is the destination `Iota` next hop. The outer `sender`
field must be absent. The payload contains the sealed Relay metadata and
content and is not opened by Omega.

##### `REQ (Omikron → Omega):`

```json
{
  "type": "Relay",
  "id": "<frame-id>",
  "receiver": "<iota-id>",
  "payload": "<opaque sealed relay payload>"
}
```

##### `FORWARD:`

Omega resolves the destination `Iota` through its primary `Omikron` route and
sends the Relay to that one authenticated connection. The outer receiver and
sealed payload remain unchanged. Omega does not decrypt Relay metadata or
content, resolve the original signer, rewrite the sender, or interpret the
inner application type.

Relay route failures are infrastructure failures. Omega rejects a frame with
an outer sender, a missing destination `Iota`, an unavailable primary route,
an unavailable target connection, or a route that points back to the source
`Omikron`. Omega does not turn these failures into user-authored Relay content.

### Control Messages

Control messages use the negotiated MTP type map after the authenticated
connection is established.

#### `PushNotification`

Sends a notification to a user. The receiver ID can be specified in the MTP
frame's `receiver` field or in the data payload.

##### `REQ (Omikron → Omega):`

```json
{
  "type": "PushNotification",
  "receiver_id": "<user-id>?",
  "sender_id": "<user-id>"
}
```

##### `RES (Omega → Omikron):`

```json
{
  "type": "PushNotification",
  "id": "<frame-id>"
}
```
