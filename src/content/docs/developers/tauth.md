---
title: TAuth
description: Register an app and request scoped Tensamin access.
---

TAuth lets an app ask a Tensamin user for specific access without sharing account credentials. App identity is decentralized. Iota creates the key, DNS binds it to a domain, and an HTTPS manifest holds mutable app details.

## Create an app

Use Iota operator CLI:

```sh
iota apps create \
  --owner-user-id 7 \
  --domain example.com \
  --name Example \
  --redirect https://example.com/tauth/callback \
  --output ./example.ta \
  --manifest-output ./tauth.json \
  hosted --omega-url https://omega.example
```

Forced Omikron replaces final line with:

```sh
forced-omikron \
  --omikron-url https://omikron.example \
  --omikron-public-key '<base64 MTP public bundle>'
```

Creation writes internal credential with owner-only permissions and refuses to overwrite exports. Keep `.ta` out of source control and backups you do not control. No rotation or recovery exists in v1. Losing it means creating new app ID.

Other commands:

```sh
iota apps list
iota apps show <app-id>
iota apps export <app-id> --output ./app.ta
iota apps delete <app-id> --yes
```

Deletion destroys internal key and registration. Remove DNS record and manifest yourself.

## Publish DNS and manifest

Creation prints TXT value for `_tauth.example.com`:

```text
v=TAUTH1;app=<sha256-app-id>;manifest=<sha256-manifest-body>
```

Publish generated file exactly at:

```text
https://example.com/.well-known/tauth.json
```

Manifest contains public key, name, domain, exact redirect list, immutable owner certificate, and app-key signature. Name and redirects may change, but every manifest edit needs new app-key signature and new TXT manifest hash. App ID remains SHA-256 fingerprint of canonical MTP public bundle.

Redirect matching is exact. Scheme, host, port, path, and registered query parameters must match. HTTPS is required, except HTTP loopback during local development. Fragments, user information, and reserved TAuth query parameters are rejected.

## Authorization flow

1. SDK loads `.ta`, creates state and PKCE verifier, then signs app ID, domain, exact redirect, scopes, PKCE challenge, and expiry.
2. App opens generated Tensamin `/authorize` URL in popup.
3. Page tries `tensamin://authorize` for desktop client, then stays as web fallback.
4. Iota checks TXT, manifest hash, owner certificate, app key, request signature, redirect, scopes, and expiry.
5. User sees app name, verified domain, redirect, and scopes.
6. Allow creates persistent grant and one-time code valid for 60 seconds. Deny returns `error=access_denied` with original state.
7. Redirect carries only `code`, `state`, and signed user gateway locator. Popup also sends same values with origin-checked `postMessage`.
8. SDK exchanges code with matching pending state and PKCE verifier.

Existing secure grant skips prompt for unchanged or narrower scopes. Added scopes prompt again.

Scopes:

- `identity.read` reads current identity and public profiles.
- `contacts.read` returns canonical contact IDs.
- `metadata.read` reads app-owned JSON.
- `metadata.write` writes or deletes app-owned JSON.

Iota checks scope for every command. Raw MTP access cannot bypass grant.

## Rust SDK

```rust
use tauth_sdk::{AppCredentials, Scope, TAuthClient, TAuthConfig};
use url::Url;

let client = TAuthClient::new(
    AppCredentials::load("app.ta")?,
    TAuthConfig::new(
        Url::parse("https://app.tensamin.net/authorize")?,
        "example.com",
        Url::parse("https://example.com/tauth/callback")?,
    )?,
);

let (url, pending) = client.authorization_url([
    Scope::IdentityRead,
    Scope::ContactsRead,
    Scope::MetadataRead,
    Scope::MetadataWrite,
])?;
```

Store opaque serialized `PendingAuthorization` server-side. Never accept pending state supplied by browser. Callback exchange:

```rust
let session = client.exchange_callback(pending, &callback_url).await?;
let user = session.user().await?;
let contacts = session.contacts().await?;
let profile = session.get_user_data(&contacts[0]).await?;

let current = session.metadata().get_json().await?;
session.metadata().set(&serde_json::json!({ "theme": "warm" })).await?;
session.metadata().delete().await?;

let raw = session.raw();
session.disconnect_and_delete().await?;
```

Typed `metadata().get<T>()` returns `None` when value is absent. `metadata().set<T>()` serializes any Serde value. `codec` exposes low-level TAuth frame helpers.

Minimal runnable server lives in SDK `example` directory.

## Metadata ownership and revocation

Each user owns one JSON text value per app ID. Iota validates JSON, caps it at 16 MiB, and uses last write wins. Client Security page shows grants in Developer-style table with raw JSON editor.

User can revoke any grant in Client regardless of granted scopes. App may revoke only its own session through `disconnect_and_delete()`. Revoke atomically deletes grant, pending codes, sessions, and JSON.

DNS or manifest failure marks grant `Insecure`. Existing sessions keep running, but Iota blocks new authorizations and SDK sessions until discovery verifies again.

## Routing

Hosted credentials use Omega only to discover connection route. Omega does not grant TAuth authority. Forced Omikron pins owner routing configuration in `.ta`. Callback's authorized user locator remains separate from owner locator.

Direct Iota mode is planned. It must use same TAuth MTP protocol and server-side checks as Omikron.

Protocol details:

- [Iota endpoints](/components/iota/endpoints/)
- [Omikron endpoints](/components/omikron/endpoints/)
- [Omega endpoints](/components/omega/endpoints/)

## Errors and troubleshooting

- `access_denied`: user denied request.
- State mismatch: callback does not belong to stored pending authorization.
- Redirect mismatch: callback URL differs from registered exact redirect.
- Invalid or expired code: code exceeded 60 seconds or was already used.
- Scope denied: session lacks command scope.
- Insecure grant: TXT or manifest validation failed.
- Invalid JSON or too large: metadata is malformed or exceeds 16 MiB.

When DNS changes, check public resolver output, exact manifest bytes, TXT hash, HTTPS certificate, domain casing, and redirect string. Recreate app only when `.ta` is lost or compromised.
