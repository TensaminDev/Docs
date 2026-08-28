---
title: Endpoints
---

All application messages arrive at the `Iota` through an authenticated MTP
connection. A sealed application operation uses the reserved `Relay`
communication type. Its outer sender is absent, and its outer receiver is
only the next-hop Iota or local client ID.

The Iota opens and verifies Relay metadata and content. It resolves the
claimed signer ID through trusted user key history; it never treats a public
key carried by the message as authoritative. The `sender_id` fields in the
examples below describe authenticated application data inside the protected
Relay, not an outer MTP sender added by Omikron.

The Iota ID is used by the MTP routing layer and is not an application signer
identity. Omikron does not rewrite a Relay's sender, emit `MessageOtherIota`,
or inspect the protected operation to choose a route.

## MTP Relay API

The Relay API uses the MTP `0.3.0` implementation and protocol version `3.0`.
MTP sends the frame as binary data; the shapes below describe its logical
fields for application integration.

### `Relay` frame

```text
CommunicationValue {
    id: optional u32,
    type: Relay,
    sender: absent,
    receiver: next-hop u64,
    payload: encrypted relay metadata,
}
```

The clear `receiver` is the only routing identity. The payload is sealed from
Omikron and Omega. The `id` is an MTP correlation value and is not the
authenticated application message identity.

After the metadata recipient opens the payload, the authenticated metadata
contains:

```text
RelayVersion: unsigned integer
MessageId: string
FinalRecipientId: unsigned integer
CreatedAt: Unix epoch milliseconds
Content: encrypted signed application content
Metadata: optional application metadata
```

The signed content contains `MessageType` and the application `Content` value.
The content recipient set is separate from the metadata recipient set. Include
the destination Iota in the content recipient set when that Iota must apply
the operation; metadata-only participants forward the sealed content.

### Relay verification

The receiving Iota performs these checks before dispatching application data:

1. The outer receiver is the local Iota ID.
2. The outer sender is absent.
3. The claimed signer ID is read from decrypted metadata but remains untrusted.
4. Trusted signing-key history is resolved from local user state or the
   authenticated Omega control plane.
5. The metadata signature and final recipient are verified with those keys.
6. `(signer_id, MessageId)` is inserted into durable replay storage before an
   application side effect.
7. The content signature is checked against the same trusted signer keys.

An application `SenderId` field is checked against the authenticated signer;
it is not a substitute for Relay signature verification. `CreatedAt` can be
used for retention, but it is not part of the replay identity.

### Relay routing

The outer receiver changes when the Relay crosses a routing boundary. The
sealed payload and absent outer sender remain unchanged.

| Stage | Outer receiver | Operation |
| --- | --- | --- |
| Client to origin Iota | Origin Iota ID | Verify the local user's Relay and resolve the final recipient's hosting Iota. |
| Origin Iota to remote Iota | Destination Iota ID | Call `forward_relay_frame()` and send the unchanged sealed Relay through Omikron. |
| Destination Iota to client | Final user ID | Verify and apply content, then forward the original Relay to the local client. |

The Iota never creates `MessageOtherIota`, reconstructs `SetChatSecret`, or
adds the authenticated signer as an outer MTP sender. Failed delivery stores
the encoded sealed Relay for retry.

## Messages

### Messaging Lifecycle

The messaging system persists and verifies each protected operation before it
is delivered or forwarded:

1. The client sends a sealed `Relay` containing the application operation to
   its associated Iota.
2. The Iota verifies the protected signer, final recipient, message ID, and
   application content before applying the operation.
3. When another Iota must receive the operation, the Iota persists any
   required delivery state and forwards the same sealed `Relay` through
   Omikron. The outer receiver changes only when the next hop changes.
4. The recipient Iota verifies the Relay again, stores the operation, and
   sends the resulting application update to its local client.

### Message mutations

`Iota` stores each mutation on the sender and recipient replicas. `Content`
remains encrypted chat content. The sender is the authenticated signer from
the protected Relay and must own the original message for edits and deletion.
The request and update examples in this section show protected application
content, not the outer MTP `CommunicationValue`.

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

Iota stores at most ten distinct reaction strings per message. A user may use
an existing reaction string after the limit is reached. A new string at the
limit returns `ErrorInvalidData` and produces no live update.

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

#### `MessageGet`

Fetches one visible message by `SendTime`. Include `ChatPartnerId` when the
request is a reply lookup. The successful response then includes `Offset`,
the message's absolute position in the same descending history order used by
`MessagesGet`.

```json
{
  "type": "MessageGet",
  "data": {
    "ChatPartnerId": "<chat-partner-id>",
    "SendTime": "<message-unix-milliseconds>"
  }
}
```

Use the returned `Offset` as the starting position for a page that contains
the target. Requests without `ChatPartnerId` remain accepted for compatibility
but do not include an offset.

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

Resolve a contact name through the control plane before creating the protected
`AddConversation` operation. Omikron does not inspect or mutate this
operation. The JSON below represents the protected application content.

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

The following object is the protected application content passed to the MTP
Relay builder. It is not the outer frame and its `SenderId`, when present, is
checked against the authenticated Relay signer.

##### `CONTENT:`

```json
{
  "MessageType": "MessageSend",
  "Content": {
    "ReceiverId": "<user-id>",
    "Content": "<markdown (encrypted)>",
    "Files": [
      {
        "Name": "<file-name>",
        "Id": "<uuid>",
        "Type": "[ image | image_top_right | file ]"
      }
    ]
  }
}
```

The Relay metadata carries the authenticated `MessageId` and
`FinalRecipientId`. It also carries `CreatedAt` as Unix epoch milliseconds.
The application does not put the signer identity in the outer MTP sender
field.

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

### Route a message to another Iota

The client sends the same `Relay` frame to its origin Iota regardless of the
final recipient's hosting Iota.

```text
Relay {
    id: <optional-mtp-frame-id>,
    sender: absent,
    receiver: <origin-iota-id>,
    payload: <sealed MessageSend operation>,
}
```

The origin Iota resolves the final recipient through the authenticated control
plane and forwards the original sealed frame with `receiver` set to the
destination Iota. It does not create a second application message.

```text
Relay {
    id: <same-mtp-frame-id>,
    sender: absent,
    receiver: <destination-iota-id>,
    payload: <same sealed MessageSend operation>,
}
```

### Receive a live message from a sealed Relay

##### `UPDATE:`

```text
Relay {
    id: <same-mtp-frame-id>,
    sender: absent,
    receiver: <final-user-id>,
    payload: <same sealed MessageSend operation>,
}
```

The destination Iota applies the authenticated operation before forwarding
the frame to the local client. The client receives the application update
through its authenticated MTP connection.

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

### Save user Settings on Iota

##### `REQ:`

```json
{
  "type": "settings_save",
  "id": "<message_id>",

  "data": {
    "setting_name": "<name of category>",
    "payload": {
      "this": "will",
      "be": "saved",
      "on": "the",
      "iota": "!"
    }
  }
}
```

##### `RES:`

```json
{
  "type": "settings_save",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {}
}
```

### Load user Settings

##### `REQ:`

```json
{
  "type": "settings_load",
  "id": "<message_id>",

  "data": {
    "setting_name": "<name of category>"
  }
}
```

##### `RES:`

```json
{
  "type": "settings_load",
  "id": "<message_id>",
  "receiver": "<user_id>",

  "data": {
    "setting_name": "<name of category>",
    "payload": {
      "this": "will",
      "be": "saved",
      "on": "the",
      "iota": "!"
    }
  }
}
```
