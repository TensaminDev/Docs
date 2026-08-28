---
title: HTTPS Endpoints
lastUpdated: 2026-08-14
---

`Omega` exposes discovery and profile data over HTTPS. All identifiers in the
routes below are positive decimal integers.

#### GET `/api/get/omikron`

Returns a randomly selected connected `Omikron`.

##### `RES:`

```json
{
  "status": "success",
  "id": "<omikron-id>",
  "public_key": "<base64>",
  "ip_address": "<ip-address>",
  "port": "<port>"
}
```

#### GET `/api/get/omikron/<id>`

Returns a connected `Omikron` by ID. If `<id>` identifies a connected `Iota`
or a user with an assigned `Iota`, the response identifies that account's
primary connected `Omikron`.

##### `RES:`

```json
{
  "status": "success",
  "id": "<omikron-id>",
  "public_key": "<base64>",
  "ip_address": "<ip-address>",
  "port": "<port>"
}
```

#### GET `/api/get/connections`

Returns the live in-memory map of `Omikron` IDs to their connected `Iota` IDs
and hosted user IDs. The map is empty after an Omega restart until connected
`Omikron` instances publish their state.

##### `RES:`

```json
{
  "status": "success",
  "<omikron-id>": {
    "<iota-id>": ["<user-id>", "..."]
  }
}
```

#### GET `/api/get/iota/<id>`

Returns the public identity data for an `Iota`.

##### `RES:`

```json
{
  "status": "success",
  "iota_id": "<iota-id>",
  "public_key": "<base64>"
}
```

#### GET `/api/get/user/<id>`

Returns a user's profile and assigned `Iota` ID.

##### `RES:`

```json
{
  "status": "success",
  "username": "<username>",
  "public_key": "<base64>",
  "user_id": "<user-id>",
  "iota_id": "<iota-id>?",
  "sub_level": "<integer>",
  "sub_end": "<unix-milliseconds>",
  "display": "<string>?",
  "status_message": "<string>?",
  "about": "<string>?",
  "avatar": "<base64>?"
}
```

#### GET `/api/get/id/<username>`

Resolves a username to its public profile and identity IDs. The username is
limited to 15 characters after URL decoding.

##### `RES:`

```json
{
  "status": "success",
  "username": "<username>",
  "public_key": "<base64>",
  "user_id": "<user-id>",
  "iota_id": "<iota-id>?",
  "sub_level": "<integer>",
  "sub_end": "<unix-milliseconds>"
}
```

#### GET `/api/get/public_key`

Returns Omega's public MTP key bundle in base64 form.

##### `RES:`

```json
{
  "status": "success",
  "public_key": "<base64>"
}
```
