---
title: User Management
---
# THESE MESSAGES ARE FORWARDED FROM THE OMEGA
There are additional security checks when Changing data, Changing the Iota, Deleting a User, Deleting an Iota. These messages can only be run when the affected User / Iota is identified. 
### Getting a user 
Either username or user_id is required when getting a user profile, user_id is preferred.
##### `REQ:` 

```json
{
	"type": "get_user_data",
	"id": "<uuid>",
	
	"data": {
	    "username": "<username>",
	    "user_id": "<user id>"
	}
}
```

##### `RES:` 

```json
{
	"type": "get_user",
	"id": "<uuid>",
	
	"data": {
    "user_id": user id,
    "iota_id": iota id,
		"created_at": int, // UNIX Timestamp
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

### Change Data about user
##### `REQ:`

```json
{
	"type": "change_user_data",
	"id": "<uuid>",
	
	"data": {
	  "user_id": "",
	
		"public_key": "",
		"username": "",
		"display": "",
		"avatar": "", 
		"about": "",
		"status": ""
	}
}
```

##### `RES:`

```json
{
	"type": "success",
	"id": "<uuid>"
}
```

### Changing the iota

Provide the users current and new Reset-Token.

##### `REQ:`

```json
{
	"type": "change_user_data",
	"id": "<uuid>",
	
	"data": {
		"iota_id": "<uuid>",
		"reset_token": "<base64 random bytes>",
		"new_token": "<base64 random bytes>"
	}
}
```

##### `RES:`

```json
{
	"type": "success",
	"id": "<uuid>"
}
```

### Get a Register-ID
You can use this to register a User or Iota. The User-creation process timeouts after 1 hour.
##### `REQ:`

```json
{
  "type": "get_register",
  "id": "<uuid>"
}
```
##### `RES:`

```json
{
  "type": "get_register",
  "id": "<uuid>",
  "data": {
    "user_id": id (unix timestamp)
  }
}
```

### Complete a Registration
Complete a registration, both for Iota's and User's.

#### User:
##### `REQ:`

```json
{
	"type": "complete_register_user",
	"id": "<uuid>",
	
	"data": {
		"user_id": id (must be provided by get_register),
		"username": "",
		"public_key": "",
		"username": "",
		"iota_id": id,
		"reset_token": ""
	}
}
```
##### `RES:`

```json
{
  "type": "success"
}
```

#### Iota:
##### `REQ:`

```json
{
	"type": "complete_register_iota",
	"id": "<uuid>",
	
	"data": {
		"iota_id": id,
		"public_key": "<base64 public key>"
	}
}
```
##### `RES:`

```json
{
  "type": "success"
}
```

### Delete a User

##### `REQ:`

```json
{
	"type": "delete_profile",
	"id": "<uuid>",
	
	"data": {
		"user_id": id
	}
}
```

##### `RES:`

```json
{
  "type": "success"
}
```

### Delete an Iota

##### `REQ:`

```json
{
	"type": "delet_profile",
	"id": "<uuid>",
	
	"data": {
		"iota_id": id
	}
}
```

##### `RES:`

```json
{
  "type": "success"
}
```
