---
title: Endpoints
lastUpdated: 2026-08-14
---

Omikron exposes an MTP WebTransport endpoint through its HTTPS listener. It
does not expose the previous JSON-over-WebSocket challenge protocol. Native
and browser clients use the MTP client APIs described in the repository's
`mtp-docs` guides.

Omikron and its peers use the MTP `0.3.0` implementation and the wire protocol
version `3.0`. The MTP opening exchange negotiates the version and completes
transport authentication before Omikron dispatches application frames.

## Connection identities

The MTP connection description selects the Omikron connection class:

| Description | Authentication | Connection | Relay access |
| --- | --- | --- | --- |
| `client` | Registered MTP authentication | User client | Yes |
| `iota` | Registered MTP authentication | Iota node | Yes |
| `anonymous` | Unauthenticated | Temporary anonymous client | No |

The `client` ID is the authenticated user ID. The `iota` ID is the
authenticated Iota ID. A connection with an unknown description is rejected by
the application dispatcher. MTP challenge and proof frames are transport
messages, not application endpoints.

## MTP frame shape

MTP sends binary `CommunicationValue` frames. The following is a logical shape
for documentation; it is not a JSON wire format.

```text
CommunicationValue {
    id: optional u32,
    type: CommunicationType,
    sender: optional u64,
    receiver: optional u64,
    payload: DataValue,
}
```

`Relay` is the reserved opaque communication type. A Relay has no outer
`sender`, its outer `receiver` is the next-hop ID, and its payload contains
protected relay metadata and content. Omikron reads only the clear routing
fields. It never opens relay metadata or content, resolves the original
signer, or changes the sealed payload.

Tensamin user IDs and Iota IDs currently share the same numeric range. An
Iota-origin Relay whose receiver matches both a local Client identity and a
local Iota identity is rejected as ambiguous; Omikron never chooses a route
from a colliding numeric ID.

## Relay

### Client to Iota

A registered Client may send a Relay only to the Iota currently associated
with that Client.

```text
Relay {
    id: request or correlation ID,
    sender: absent,
    receiver: associated Iota ID,
    payload: opaque sealed relay,
}
```

Omikron validates the Relay layout with MTP's `forward_relay_frame` and sends
the unchanged frame to the local Iota connection. A Client cannot address an
arbitrary Iota or Omikron through this path.

### Iota routing

An Iota may send a Relay to a locally connected Client, another locally
connected Iota, or Omega. Omikron chooses the destination from the clear outer
receiver and the authenticated connection that supplied the frame.

| Source connection | Destination | Omikron action |
| --- | --- | --- |
| Client | Its associated Iota | Send to that local Iota |
| Iota | Local Client | Send to matching client sessions |
| Iota | Local Iota | Send to that Iota |
| Iota | Remote Iota | Send to Omega |
| Omega | Local Iota | Send to that Iota |
| Anonymous client | Any destination | Reject |

Omega sends a Relay to one destination Omikron. Omikron accepts it only when
the destination Iota is connected locally. It never sends an unavailable
Omega Relay back to Omega or broadcasts it to other Omikrons.

### Validation and errors

Omikron rejects a Relay when:

- the communication type is not the reserved `Relay` type;
- an outer sender is present;
- the next-hop receiver is missing;
- a Client addresses an Iota other than its associated Iota;
- an Iota routes to itself;
- the destination Iota or Client is unavailable; or
- the frame cannot be sent on the selected connection.

Routing failures are ordinary service error frames sent to the authenticated
source connection. The failure frame is not a Relay and does not claim to be
from the original user. Unknown non-Relay application messages are rejected;
Omikron does not use generic fallthrough forwarding.

## Application messages

Direct control messages remain available after MTP authentication. Examples
include `GetUserData`, `GetIotaData`, `ChangeUserData`, `ClientChanged`, and
registration control messages. These messages use the negotiated MTP type map
and may use the existing control-plane sender semantics.

`MessageGet`, `MessagesGet`, and `GetChatSecret` are authenticated peer-control
messages. A Client sends them to its associated Iota through Omikron. Omikron
adds the authenticated client ID as the outer sender for the Iota request,
waits for the correlated response, and returns that response to the Client.
It does not read or store message contents.

Those semantics do not apply to `Relay`. Omikron never adds a user or Iota ID
to a Relay and never uses the outer sender as the original message identity.

Message delivery, edits, reactions, deletion, chat secrets, and other
application operations travel inside the sealed Relay. The recipient Iota
opens and verifies the Relay, checks the original signer against its trusted
public-key history, applies the operation, and persists or forwards the sealed
Relay when required.

## Keepalive

MTP handles protocol Ping and Pong frames through the connection dispatcher.
Application handlers must not treat keepalive frames as Relay traffic. See the
repository's `mtp-docs/CONNECTIONS.md` and `mtp-docs/PROTOCOL-REFERENCE.md`
files.

## Related API documentation

- [Calling](./calling)
- [User management](./user-management)
- `mtp-docs/CONNECTOR.md`
- `mtp-docs/NATIVE-CLIENT.md`
- `mtp-docs/NATIVE-HOST-WEB-SERVER.md`
