---
title: Iota Frontend
---

# API

#### `/api/appstate/`

##### Header:

**size**, default is 50

##### `RES:`

```json
{
  "cpu": [0],
  "ram": [0],
  "ping": [0],
  "net_down": [0],
  "net_up": [0]
}
```

#### `/api/users/add/`

##### Header:

**username**, no default, may not be taken on Auth prior

##### `RES:`

```json
{
  "uuid": "",
  "username": "",
  "public_key": "",
  "private_key_hash": "",
  "displayname": ""
}
```

**displayname**, is only send if different from username
or

```json
{ "type": "error" }
```

#### `/api/users/get/`

##### `RES:`

```json
[
  {
    "uuid": "",
    "username": "",
    "public_key": "",
    "private_key_hash": "",
    "displayname": ""
  }
]
```

#### `/api/users/remove/`

##### Header:

**username**, no default

##### `RES:`

```json
{}
```

#### `/api/communities/add/`

##### Header:

**name**, no default

##### `RES:`

```json
{ "type": "success" }
```

or

```json
{ "type": "error" }
```

#### `/api/communities/remove/`

##### Header:

**name**, no default

##### `RES:`

```json
{ "type": "success" }
```

or

```json
{ "type": "error" }
```

#### `/api/communities/get/`

##### Header:

**name**, no default

##### `RES:`

```json
[
  {
    "name": "",
    "owner_id": "",
    "members": "",
    "public_key": "",
    "connections": 0
  }
]
```
