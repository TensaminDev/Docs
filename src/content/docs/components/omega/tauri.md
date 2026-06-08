---
title: Tauri
---

# Tauri

The Tauri system provides push notification capabilities for mobile clients via a secure QUIC connection.

### Connection

Tauri clients connect to the Omega server on port 9189 using QUIC with client certificate authentication.

### Identification

Any message to the Tauri server will be ignored until Identification.

##### `REQ:`

```json
{
  "type": "tauri_identification",
  "data": {
    "user_id": "<user-id>"
  }
}
```

##### `RES:`

```json
{
  "type": "success",
  "id": "<message-id>"
}
```

### Ping & Pong

Tauri clients must respond to ping messages to maintain their connection.

#### `REQ:`

```json
{
  "type": "ping",
  "data": {
    "last_ping": long
  }
}
```

#### `RES:`

```json
{
  "type": "pong",
  "data": {
    "last_ping": long
  }
}
```

### Push Notifications

When a user is offline (no active Iota connection), messages generate push notifications that are sent to Tauri clients.

#### `REQ:`

```json
{
  "type": "push_notification",
  "data": {
    "sender_id": "<user-id>"
  }
}
```

### Read Notifications

When a user reads a message on any device, a read notification is sent to clear the push notification badge on Tauri clients.

#### `REQ:`

```json
{
  "type": "read_notification",
  "data": {
    "sender_id": "<user-id>"
  }
}
```

### Tauri Client Responsibilities

1. Establish QUIC connection to Omega:9189
2. Send `tauri_identification` with user_id
3. Respond to ping messages with pong
4. Display notifications when receiving `push_notification` messages
5. Clear notification badges when receiving `read_notification` messages
6. Maintain connection heartbeat (respond to pings within 30 seconds)

## Omega Server Endpoints (HTTPS)

The Omega server provides an HTTPS API for administrative and data retrieval functions, which Tauri clients can use to synchronize notification state.

### Get User Data

Retrieve user profile information including online status.

#### `GET: /api/get/user/{user_id}`

##### `RES:`

```json
{
  "status": "success",
  "user_id": long,
  "username": "<string>",
  "display": "<string>",
  "public_key": "<base64>",
  "iota_id": long,
  "online_status": "<status>", // user_online, user_offline, user_invisible, etc.
  "sub_level": long,
  "sub_end": long,
  "about": "<string>?",
  "avatar": "<base64>?",
  "status_message": "<string>?"
}
```

### Get User Notifications

Retrieve pending push notifications for a user.

#### `GET: /api/get/notifications/{user_id}`

##### `RES:`

```json
{
  "status": "success",
  "notifications": [
    {
      "sender_id": long,
      "amount": long
    }
  ]
}
```

### Mark Notification as Read

Clear a specific notification.

#### `DELETE: /api/delete/notifications/{user_id}/{sender_id}`

##### `RES:`

```json
{
  "status": "success"
}
```
