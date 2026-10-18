---
title: Iota updates
---

## Installed release channel

A system-wide Iota installation records its stable or canary channel in
`/etc/iota/update.env`. Show it with:

```sh
sudo iota update channel
```

The channel is fixed for that installation. The CLI does not switch stable to
canary or canary to stable. To use a different channel, install its matching
bundle separately and plan how you will preserve account data and identities.

## Check and apply

```sh
sudo iota update check
sudo iota update apply
```

These commands apply to unmanaged system-wide Linux installations. They use
the installed trust configuration, including the public key and signing key ID.
Process environment variables cannot replace that trust.

Update manifests include binary hashes and sizes, an increasing sequence, and an
expiry time. The updater verifies signatures and rejects replayed or conflicting
updates. Expired metadata requires a refreshed manifest from the publisher.

Bootstrap enables `iota-update.timer`, which checks hourly with up to 15 minutes
of jitter. Signed metadata is valid for 90 days and points to binaries in an
immutable GitHub release. Stable follows normal `stable-` releases; Canary follows
`canary-` prereleases. Disable the timer to require explicit update commands:

```sh
sudo systemctl disable --now iota-update.timer
```

Back up persistent state before updates that may change its format. A software
rollback does not undo changes to account data.

## Other installations

NixOS-managed Iota updates through your NixOS configuration. Portable per-user
installations update by replacing their extracted release files.

The Tensamin client has no built-in updater. See [app installation](/installation/)
for desktop and Android update methods.
