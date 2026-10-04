---
title: Updates and security
---

## Unmanaged Iota

Updates are explicit operator actions on unmanaged Linux installations:

```sh
sudo iota update channel
sudo iota update channel stable
sudo iota update check
sudo iota update apply
```

Select `canary` instead of `stable` to use canary. Channel selection persists
`/etc/iota/update.env` without downloading or applying anything. Check and
apply read this file, including its pinned public key and key ID; process
environment cannot override that trust. `iota-updater` supports the same commands.

Manifests come from:

```text
https://git.methanium.net/tensamin/prod-pins/releases/download/CHANNEL/iota-update-linux-ARCH.json
```

`CHANNEL` is `stable` or `canary`; `ARCH` is `x86_64` or `aarch64`.
The detached signature URL appends `.sig`. Signed manifests include artifact
hashes and byte lengths and point to immutable binaries. The updater retains
per-channel anti-replay state across channel switches and rejects older
sequences, sequence/version reuse, and failed activation sequences.

The bootstrap bundle supplies the trusted key. Confirm that key through a
trusted operator channel before initial installation or deliberate key rotation.
A signature fetched beside a binary cannot establish initial trust by itself.

The installer preserves an existing `update.env` and removes an old unattended
update timer. `iota-update.service` is an explicit oneshot apply action with
no timer. NixOS-managed Iota follows the system flake instead of this updater.

## Updating central build pins

From the prod-pins checkout, with source-repository SSH access:

```sh
nix run .#update-all
nix run .#update-all -- --no-update
```

The first command refreshes the central `flake.lock`, then recalculates
transformed Cargo and pnpm locks under `packages/locks` and dependency hashes
in `packages/hashes.nix`. `--no-update` retains flake input revisions but still
resolves dependency locks and verifies dependency fetchers. This operation
does not build every application, publish releases, or deploy a host.

Review the generated diff and build affected outputs before publishing pins.
Use a disposable checkout for dependency-changing source overrides:

```sh
nix run .#update-all -- --no-update --override-input iota path:../iota
```

## Two nixpkgs pins

The infrastructure flake locks the nixpkgs used for NixOS and infrastructure
services. Prod-pins separately locks the nixpkgs used to build Tensamin
applications. Updating one does not refresh the other. A security fix may
require both lock updates, regenerated central dependencies, new application
builds, and a deployed NixOS generation. Lock updates alone do not change
running binaries.

Keep the application nixpkgs independent rather than adding an infrastructure
`follows` override that changes the release build inputs. Record the deployed
prod-pins revision in the infrastructure lock so later administrator updates
do not restore an older application version.

## Infrastructure updates with Lunitely

Run these against the infrastructure checkout configured by `FLAKE_PATH`,
`GIT_PATH`, and `HOSTNAME`:

| Command | Effect |
| --- | --- |
| `lunitely update` | Pulls configuration Git changes and switches when HEAD changes |
| `lunitely rebuild` | Builds and switches the existing checkout without pulling |
| `lunitely update --boot` | Pulls changes and stages the next boot generation when HEAD changes |
| `lunitely boot` | Stages the current checkout for next boot without pulling |

`update` is not `nix flake update`: it consumes lock changes already published
in the configuration repository. If a pull leaves HEAD unchanged, it skips the
build. Use `rebuild` or `boot` after local lock edits. Boot staging does not
activate security fixes in the running system until a planned reboot.

Automatic Lunitely updates are opt-in and run `update --boot`. They stage a
generation without automatically rebooting. Neither manual command reboots
unless the operator explicitly passes `--reboot-on-finish`.

## Production deployment

The infrastructure's `tensamin-prod-deploy` wrapper takes a full prod-pins
commit SHA. It pins that revision, checks assertions, builds the guest, and
uses `lunitely rebuild -- --no-update-lock-file` to activate it. It checks the
active store path, services, database, IPC socket, client HTML, Omega discovery,
and Omikron/Iota TLS. A failed deployment restores the prior lock and, after
activation begins, the previous system generation.

This rollback restores software and configuration, not database migrations or
mutable application data. Preserve backups before deployments that change
state. Publication and deployment workflow wiring is still pending; coordinate
the central release workflow with the infrastructure's restricted SSH entry
point and verify public routing before calling the pipeline complete.
