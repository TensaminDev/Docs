---
title: Endpoints
lastUpdated: 2025-10-28
---

# The Auth Server is getting merged with the Omega

---

## User Endpoints
If any errors occur a `logMessage` key in the data container will contain the error message

##### GET `/api/get/id/<username>`

```json
{
  "type": "success",
  "data": {
    "user_id": "<id>"
  }
}
```

##### GET `/api/get/<id>`

```json
{
	"type": "success",
	"data": {
		"username": "<username>",
		"display": "<display name>",
		"avatar": "<base64 avatar>",
		"about": "<base64 about>",
		"status": "<status>",
		"public_key": "<base64 public key>",
		"sub_level": int,
		"sub_end": int
	}
}
```

##### POST `/api/change/<id>`

`REQ`

```json
{
	[ "username" | "display" | "avatar" | "about" | "status" ]: [ "<username>" | "<display>" |  "<avatar>" | "<about>" | "<status>" ],
	"private_key_hash": "<sha256 private key hash>"
}
```

`RES`

```json
{
  "type": "success"
}
```

##### POST `/api/change/iota-id/<id>`

`REQ`

```json
{
  "iota_id": "<id>",
  "reset_token": "<base64 random bytes>",
  "new_token": "<base64 random bytes>"
}
```

`RES`

```json
{
  "type": "success"
}
```

##### POST `/api/change/keys/<id>`

`REQ`

```json
{
  "private_key_hash": "<sha256 private key hash>",
  "public_key": "<base64 public key>",
  "reset_token": "<base64 random bytes>",
  "new_token": "<base64 random bytes>"
}
```

`RES`

```json
{
  "type": "success"
}
```

## Iota Endpoints

##### GET `/api/register/init`

The user creation process timeouts after 1 hour.

```json
{
  "type": "success",
  "data": {
    "user_id": "<id>"
  }
}
```

##### POST `/api/register/complete`

`REQ`

```json
{
  "id": int,
  "username": "",
  "public_key": "",
  "private_key_hash": "",
  "iota_id": "",
  "reset_token": ""
}
```

`RES`

```json
{
  "type": "success"
}
```

##### POST `/api/delete/<id>`

`REQ`

```json
{
  "reset_token": ""
}
```

`RES`

```json
{
  "type": "success"
}
```

## Omikron Endpoints

##### GET `/api/get/private-key-hash/<id>`

**Header:** `Authorization <omikron id>`
**Header:** `PrivateKeyHash <sha256 private key hash>`

```json
{
	"type": "success",
	"data": {
		"matches": boolean
	}
}
```

##### GET `/api/get/iota-id/<id>`

**Header:** `Authorization <omikron id>`

```json
{
  "type": "success",
  "data": {
    "iota_id": "<id>"
  }
}
```
