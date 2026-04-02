---
title: Communities
---

There are two types of communities, but one is not yet in planning so it will be ignored for now.

## Direct communities

Direct communities do not communicate to the user through an `Omikron`, this make direct communities cheaper to run (for us). As no bandwidth is used.

With direct communities the community owner can read all messages as they are stored on the community server.
On the Iota of other users everything about a community is encrypted. This could be used to keep users private from their Iota host.

### Sharing a direct community

A community stores it's joined users UUID's and a shared secret for each of them.
When joining a community an invite has to be created.
This invite can be send to any user. It contains the communities IP & a shared secret.
By removing a user from a community you are removing the shared secret.

## Connecting

Connect to a community on a websocket or websocket-secure on `ws[s]://[ip]:[port]/ws/community/[community name]`.
Standard port of a community is 1984.

##### `REQ (C2S):`

```json
{
  "type": "identification",
  "data": {
    "user_id": "<uuid>"
  }
}
```

###### `RES/REQ (S2C):`

```json
{
  "type": "challenge",
  "data": {
    "challenge": "<Encrypted Base64 string>",
    "public_key": "<Base64 publicKey>"
  }
}
```

The Client should solve the challenge.

###### `RES/REQ (C2S):`

```json
{
  "type": "challenge_response",
  "data": {
    "challenge": "<Solved Challenge | Decrypted Base64 string>"
  }
}
```

Upon solving the challenge the client will be provided with comunity information.

###### `RES (S2C):

```json
{
  "type": "identification_response",
  "data": {
  	"accepted": boolean,
  	"interactables": {
  	  "<interactable_name>":{
  	  	"codec": "<decoder_type>",
  	  	"data": {
  	  	  // Standart are Category, Textchat & VoiceChat
  	  	}
  	  },

  	  // Examples
  	  "Rules":{
  	  	"codec": "text",
  	  	"data": {
		  // Useless I guess
  	  	}
  	  },
  	  "General":{
  	  	"codec": "category",
  	  	"data": {
  	  	  "General":{
  	  	  	"codec": "text",
  	  	  	"data": {}
  	  	  },
  	  	  "VC-1":{
  	  	  	"codec": "voice",
  	  	  	"data": {
  	  	  	  "active_users": {
  	  	  	  	"user_id": {
  	  	  	  	  "state": "<call_status>",
  	  	  	  	  "streaming": boolean
  	  	  	  	},
  	  	  	  	"user_id": {
  	  	  	  	  "state": "<call_status>",
  	  	  	  	  "streaming": boolean
  	  	  	  	 },
  	  	  	  	 "user_id": {
  	  	  	  	  "state": "<call_status>",
  	  	  	  	  "streaming": boolean
  	  	  	  	 }
  	  	  	  }
  	  	  	}
  	  	  },
  	  	  "VC-2":{
  	  	  	"codec": "voice",
  	  	  	"data": {
  	  	  		"active_users": {}
  	  	  	}
  	  	  }
  	  	}
  	  }
  	}
  }
}
```

## Using Channels

As mods can create their own channel codecs browser-extensions could implement their own codec handling.

### Send something to a channel

Send on the communities websocket.

##### `REQ:`

```json
{
	"type": "function",
	"id": "<uuid>",
	"data": {
		"codec": "<channel_codec>", // optional
		"name": "<channel_name>",
		"path": "<overlord_category_name>/<overlord_category_name>...",
		"function": "<function_to_execute>",
		"payload": {
			"<ARG_1>": "<VAL_1>",
			...
		}
	}
}
```

##### `RES:`

```json
{
	"type": "function",
	"id": "<uuid>",
	"data": {
		"codec": "<channel_codec>", // optional
		"name": "<channel_name>",
		"path": "<overlord_category_name>/<overlord_category_name>...",
		"result": "<a_function_result>",
		"payload": {
			"<ARG_1>": "<VAL_1>",
			...
		}
	}
}
```

#### Receiving Updates

##### `RES:`

```json
{
  "type": "update",
  "id": "<uuid>",
  "data": {
    "codec": "<channel_codec>", // optional
    "name": "<channel_name>",
    "path": "<overlord_category_name>/<overlord_category_name>...",
    "result": "<a_function_result>",
    "payload": {
      "<ARG_1>": "<VAL_1>"
    }
  }
}
```

### Text channels

#### Sending

An example for using the `General` text Channel in the `General` category from the example login.

##### `REQ:`

```json
{
  "type": "function",
  "id": "<uuid>",
  "data": {
    "codec": "text",
    "name": "General",
    "path": "General",
    "function": "send_message",
    "payload": {
      "message": "<message>"
    }
  }
}
```

##### `RES:`

```json
{
  "type": "function",
  "id": "<uuid>",
  "data": {
    "codec": "text", // optional
    "name": "General",
    "path": "General",
    "result": "message_received",
    "payload": {}
  }
}
```

#### Loading

An example for using the `General` text Channel in the `General` category from the example login.

##### `REQ:`

```json
{
	"type": "function",
	"id": "<uuid>",
	"data": {
		"codec": "text",
		"name": "General",
		"path": "General",
		"function": "get_messages",
		"payload": {
			"loaded_messages": int,
			"amount": int
		}
	}
}
```

##### `RES:`

```json
{
	"type": "function",
	"id": "<uuid>",
	"data": {
		"codec": "text", // optional
		"name": "General",
		"path": "General",
		"result": "message_chunk",
		"payload": {
			"messages": [
				{
					"message": "message",
					"send_time": unix,
					"sender_id": "<uuid>"
				}
			]
		}
	}
}
```

#### Live messages

##### `RES:`

```json
{
  "type": "update",
  "id": "<uuid>",
  "data": {
    "codec": "text", // optional
    "name": "General",
    "path": "General",
    "result": "message_live",
    "payload": {
      "sender_id": "<uuid>",
      "message": "<uuid>",
      "send_time": "<uuid>"
    }
  }
}
```

### Voice channels

#### Updates

An example for VC-1 in the General category.

##### `RES:`

```json
{
	"type": "update",
	"id": "<uuid>",
	"data": {
		"codec": "voice", // optional
		"name": "VC-1",
		"path": "General",
		"result": "user_changed",
		"payload": {
			"user_id": "<uuid>",
			"state": "<user_state>",
			"streaming": boolean
		}
	}
}
```

###### User States can be

```json
active,
muted,
deafed,
inactive
```

#### Connecting

Connect to the STUN.
Connect to the community again on: `ws[s]://<ip>:<port>/ws/calls/`
Log in on works by providing the `Call websocket` with the `path/name` & the `secret` of the call.

##### Getting the secret & name from the call

An example for VC-1 in the General category.

###### `REQ:`

```json
{
  "type": "function",
  "id": "<uuid>",
  "data": {
    "codec": "voice", // optional
    "name": "VC-1",
    "path": "General",
    "function": "",
    "payload": {
      "sender_id": "<uuid>",
      "message": "<uuid>",
      "send_time": "<uuid>"
    }
  }
}
```

###### `RES:`

```json
{
  "type": "function",
  "id": "<uuid>",
  "data": {
    "codec": "voice", // optional
    "name": "VC-1",
    "path": "General",
    "function": "",
    "payload": {
      "sender_id": "<uuid>",
      "message": "<uuid>",
      "send_time": "<uuid>"
    }
  }
}
```
