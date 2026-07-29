---
title: Endpoints
---

All messages to the `Iota` are either from the `Omikron` directly, from a `Client` or another `Iota` trying to message a `User` on the `Iota`.
All messages will be marked with a `sender_id` this will be added on the `Omikron`.
It is important to note that the `Iota ID` is not shared with others as it is what verifies the `Iota` users to Tensamin.
In the response the `sender_id` & `receiver_id` must be swapped as sender.
When a message comes from an iota without a `sender-id` that the iota has access to or is designated for the client (`33333333-3333-3333-3333-333333333333`) the message will not be send.

## Messages

### Messaging Lifecycle

The messaging system follows a strict derivation loop to ensure delivery and correct state synchronization:

1. The client sends a `message_send` to its Iota.
2. The Iota sends a response `message_send` as confirmation back to the client.
3. The Iota sends a `message_other_iota` to the chat partner's Iota.
   - **If it times out:**
     - The initial Iota sends a `message_state` to the client with the state `"sending"`.
   - **If successful:**
     - The other Iota receives the `message_other_iota` and handles it.
     - The other Iota informs its client with a `message_live`.
     - **If the client doesn't answer:**
       1. The other Iota will send a `message_state` to the initial Iota with the state `"sent"`.
       2. The initial Iota will store the state and forward the `message_state` to its client.

### Message mutations

`Iota` stores each mutation on the sender and recipient replicas. `Content` remains encrypted chat content. The sender is taken from the authenticated MTP connection and must own the original message for edits and deletion.

#### `MessageEdit`

Changes an existing message. `ChatPartnerId` and `SendTime` identify the message.

##### `REQ (C2S):`

```json
{
  "type": "MessageEdit",
  "sender_id": "<authenticated-user-id>",
  "data": {
    "ChatPartnerId": "<chat-partner-id>",
    "SendTime": "<message-unix-milliseconds>",
    "Content": "<encrypted-base64>"
  }
}
```

##### `RES (S2C):`

```json
{
  "type": "Success"
}
```

##### `UPDATE:`

```json
{
  "type": "MessageEditLive",
  "sender_id": "<editing-user-id>",
  "receiver_id": "<chat-partner-id>",
  "data": {
    "ChatPartnerId": "<editing-user-id>",
    "SendTime": "<message-unix-milliseconds>",
    "Content": "<encrypted-base64>"
  }
}
```

#### `MessageReactionAdd`

Adds one reaction for the authenticated user. Repeating the same request does not create a duplicate row.

##### `REQ (C2S):`

```json
{
  "type": "MessageReactionAdd",
  "sender_id": "<authenticated-user-id>",
  "data": {
    "ChatPartnerId": "<chat-partner-id>",
    "SendTime": "<message-unix-milliseconds>",
    "Reaction": "<emoji-or-reaction-text>"
  }
}
```

##### `RES (S2C):`

```json
{
  "type": "Success"
}
```

#### `MessageReactionRemove`

Removes the authenticated user's matching reaction.

##### `REQ (C2S):`

```json
{
  "type": "MessageReactionRemove",
  "sender_id": "<authenticated-user-id>",
  "data": {
    "ChatPartnerId": "<chat-partner-id>",
    "SendTime": "<message-unix-milliseconds>",
    "Reaction": "<emoji-or-reaction-text>"
  }
}
```

##### `RES (S2C):`

```json
{
  "type": "Success"
}
```

##### `UPDATE:`

```json
{
  "type": "MessageReactionLive",
  "sender_id": "<reacting-user-id>",
  "receiver_id": "<chat-partner-id>",
  "data": {
    "ChatPartnerId": "<reacting-user-id>",
    "SendTime": "<message-unix-milliseconds>",
    "Reaction": "<emoji-or-reaction-text>",
    "SenderId": "<reacting-user-id>",
    "Accepted": true
  }
}
```

`Accepted` is `true` for an add and `false` for a removal.

#### `MessageDeleteLive`

Deletes a message from both replicas. The existing `MessageDeleteLive` MTP type is used for both the authenticated delete request and the recipient update because no separate delete request type exists in the client type map.

##### `REQ (C2S):`

```json
{
  "type": "MessageDeleteLive",
  "sender_id": "<authenticated-user-id>",
  "data": {
    "ChatPartnerId": "<chat-partner-id>",
    "SendTime": "<message-unix-milliseconds>"
  }
}
```

##### `RES (S2C):`

```json
{
  "type": "Success"
}
```

##### `UPDATE:`

```json
{
  "type": "MessageDeleteLive",
  "sender_id": "<deleting-user-id>",
  "receiver_id": "<chat-partner-id>",
  "data": {
    "ChatPartnerId": "<deleting-user-id>",
    "SendTime": "<message-unix-milliseconds>"
  }
}
```
     - **If the client answers with `message_state`:**
       1. The other Iota will store the state (either `"received"` or `"read"`) and forward the `message_state` to the initial Iota.
       2. The initial Iota will store the state and forward the `message_state` to its client.

### Client adds someone to their contacts
When adding via name, the omikron will intercept and fill the chat_partner_id.
The iota will never read, or handle the chat_partner_name.

##### `REQ:`

```json
{
  "sender_id": "<user-id>",
  "receiver_id": "<user-id>",

  "type": "add_conversation",
  "id": "<uuid>",
  
  "data": {
    "chat_partner_id": id,
    "chat_partner_name": "name"
  }
}
```

##### `RES:`

```json
{
  "sender_id": "<user-id>",
  "receiver_id": "<user-id>",

  "type": "add_conversation",
  "id": "<uuid>",
  "data": {}
}
```

### Client messages someone

##### `REQ:`

```json
{
  "sender_id": "<user-id>",
  "receiver_id": "<user-id>",

  "type": "message_send",
  "id": "<uuid>",
  "data": {
    "receiver_id": "<uuid>",
    "content": "<markdown (encrypted)>",
    "files": [
      {
        "name": "<cool name>",
        "id": "<uuid>",
        "type": "[ image | image_top_right | file ]"
      }
    ]
  }
}
```

##### `RES:`

```json
{
  "sender_id": "<user-id>",
  "receiver_id": "<user-id>",

  "type": "message_send",
  "id": "<uuid>",
  "data": {}
}
```

### Client loads messages

##### `REQ:`

```json
{
	"sender_id": "<user-id>",

	"type":"messages_get",
	"id": "<uuid>",
	"data": {
		"user_id": "<user-id>",
		"amount": int,
		"offset": int
	}
}
```

##### `RES:`

```json
{
  "sender_id": "<iota-id>",

  "type": "messages_get",
  "id": "<uuid>",
  "data": {
    "messages": [
      {
        "sent_by_self": true,
        "timestamp": 0, // UNIX Timestamp for time sent
        "content": "<markdown (encrypted)>",
        "Edited": true,
        "Reactions": [
          {
            "Reaction": "<emoji-or-reaction-text>",
            "SenderId": "<user-id>"
          }
        ],
        "files": [
          {
            "name": "<cool name>",
            "id": "<uuid>",
            "type": "[ image | image_top_right | file ]"
          }
        ],
        "tint": "<hex color>",
        "avatar": false, // unless false key is removed
        "display": false // unless false key is removed
      }
    ]
  }
}
```

`ClientConnected` and `MessagesGet` include `Edited: true` for messages with at least one edit and a `Reactions` array. Each reaction contains `Reaction` and `SenderId` fields. Clients that do not consume these fields continue to receive the existing message fields.

### Send a message to other Iota

##### `REQ:`

```json
{
  "type": "message_send",
  "id": "<message_id>",
  "data": {
    "receiver_id": "99999999-8888-7777-6666-555555555555",
    "content": "Hello, how are you?"
  }
}
```

##### `RES:`

```json
{
  "type": "message",
  "id": "<message_id>",
  "receiver": "<user_id>"
}
```

### Receive live message (`message_other_iota`)

##### `UPDATE:`

```json
{
	"type": "message_live",
	"id": "<message_id>",
	"receiver": "<user_id>",

	"data": {
		"send_time": unixstamp,
		"message": "<content>",
		"sender_id": "99999999-8888-7777-6666-555555555555"
	}
}
```

## Communities

### Client storing a community on their Iota

##### `REQ:`

```json
{
  "type": "add_community",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {
    "community_address": "community_address",
    "community_title": "community_title",
    "position": "x.y.z"
  }
}
```

##### `RES:`

```json
{
  "type": "add_community",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {}
}
```

### Client loading communities from their Iota

##### `REQ:`

```json
{
  "type": "get_communities",
  "id": "<message_id>",

  "data": {}
}
```

##### `RES:`

```json
{
  "type": "get_community",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {
    "communities": [
      {
        "community_address": "enc_community_address",
        "community_title": "enc_community_title",
        "position": "x.y.z" // Frontend defines folders etc
      },
      {
        "community_address": "enc_community_address",
        "community_title": "enc_community_title",
        "position": "x.y.z"
      }
    ]
  }
}
```

### Remove a community

##### `REQ:`

```json
{
  "type": "remove_community",
  "id": "<message_id>",

  "data": {
    "community_address": "community-uuid-or-address"
  }
}
```

##### `RES`:

```json
{
  "type": "remove_community",
  "id": "<message_id>",
  "receiver": "<user_id>"
}
```

## User Settings

Settings are scoped to the authenticated device session. The `SessionId` must match the session assigned by the Omikron. Setting names may contain alphanumeric characters, `_`, `-`, and `.`, but may not contain `..`.

### Save user Settings on Iota

##### `REQ:`

```json
{
  "type": "SettingsSave",
  "id": "<message_id>",

  "data": {
    "SessionId": 12345,
    "SettingsName": "<name of category>",
    "Payload": "<serialized or encrypted settings>"
  }
}
```

##### `RES:`

```json
{
  "type": "SettingsSave",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {
    "SessionId": 12345,
    "SettingsName": "<name of category>"
  }
}
```

### Load user Settings

##### `REQ:`

```json
{
  "type": "SettingsLoad",
  "id": "<message_id>",

  "data": {
    "SessionId": 12345,
    "SettingsName": "<name of category>"
  }
}
```

##### `RES:`

```json
{
  "type": "SettingsLoad",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {
    "SessionId": 12345,
    "SettingsName": "<name of category>",
    "Payload": "<serialized or encrypted settings>"
  }
}
```

Loading a setting that does not exist returns `ErrorNotFound` with the requested `SessionId` and `SettingsName`.
