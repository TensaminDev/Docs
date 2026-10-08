---
title: Introduction
description: Use Tensamin, host an Iota, or integrate an app with TAuth.
---

Tensamin is a messaging application with a self-hosted account service called
Iota. The client connects to your account to send messages, manage contacts,
and make calls.

- [Install the app](/installation/).
- [Set up an Iota](/iota/).
- [Integrate your application with TAuth](/developers/tauth/).

## How the components fit together

The client is the application you use on your desktop, phone, or browser.
Iota stores account data and handles authenticated account operations.
Omikron connects clients and Iotas and routes traffic between them.
Omega provides account and connection discovery.

Message operations travel through authenticated MTP connections. Protected
message content is encrypted for its recipients; routing services do not need
to read it to forward it. Encryption does not hide every kind of metadata, and
hosting an Iota does not by itself guarantee that all account data is invisible
to its operator.

Calls use LiveKit for media transport, with Omikron handling admission to calls.
TAuth lets third-party applications request specific account permissions without
receiving the user's password.

Community extensions and custom channel protocols are development work. The
public docs do not describe them as a supported integration API.
