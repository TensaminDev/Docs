---
title: HTTPS Endpoints
---
#### GET `/api/get/omikron/`
Get an Omikron to connect to.
#### GET `/api/get/omikron/<omikron-id>`
Get an Omikron to connect to, when needing a certain omikron.

#### GET `/api/get/omikron/<user-id>`
Get an Omikron to connect to, when needing the Omikron a certain User / a certains user's Iota is connected to.
#### GET `/api/get/omikron/<iota-id>`
Get an Omikron to connect to, when needing the Omikron a certain Iota is connected to.

```json
{
	"type": "omikron",
	"data": {
		"omikron_id": id,
		"domain": "omikron.tensamin.net"
	}
}
```