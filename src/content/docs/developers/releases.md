---
title: Builds and releases
---

## Central packages

Prod-pins combines the client, Iota, Omikron, Omega, MTP, and type-map inputs
into one build graph for `x86_64-linux` and `aarch64-linux`.

| Output | Contents |
| --- | --- |
| `default`, `client` | Linux Electron client |
| `client-web` | Static site at the output root |
| `iota` | `iota`, `iota-daemon`, `iota-updater`, `iota-installer` |
| `iota-daemon` | Daemon only |
| `iota-ui` | Terminal CLI exposed as `bin/iota-ui` |
| `iota-bundle` | Iota binaries plus upstream scripts, systemd files, and artifact contracts under `share/iota` |
| `omikron`, `omega` | Server binaries |
| `omikron-container`, `omega-container` | Docker-loadable images |
| `mtp-sdk` | SDK built from the shared MTP source |
| `update-all` | Central lock and dependency-hash refresh command |

`iota-bundle` is a Nix output, not a ready-made signed installer ZIP. Release
automation must supply manifests, trust inputs, and deployment-specific URLs.
The Rust `iota-release` signer and `iota-bundle` ZIP validator are additional
release tools required by upstream scripts; the current central `iota` output
does not include those executables.

```sh
nix build .#client .#client-web .#iota .#omikron .#omega
nix build .#iota --override-input iota path:../iota
nix develop .#client
```

Central shells are `client`, `iota`, `omikron`, `omega`, and `mtp`; the default
shell supplies `update-all`. Android/Tauri central shells are pending.

MTP Git dependencies become local paths to the shared input. Omega's identity
crate uses the same Iota source as the Iota binaries. Rust and YAML type maps,
SDK, and WASM all use the shared inputs. Client manifests cannot select a
separately released SDK. Dependency-changing overrides need new transformed
locks and vendor hashes, as described in [updates](/updates/).

## Client channel builds

`TENSAMIN_CHANNEL` defaults to `stable`. `canary` selects the yellow branding
and `net.tensamin.client.canary`; local `dev` selects blue outline branding and
`net.tensamin.client.dev`. Local `dev`, `dev:desktop`, and `dev:mobile` scripts
select dev automatically. No client dev releases are published.

The outline artwork comes from the branding repository and is vendored under
client `utils/icons`, so standalone builds do not require that repository.
Channel icons regenerate from source on each build without timestamps or
Git-dependent inputs. Hosted web builds use `/`; Electron's web build uses `./`.

`pnpm run channel <command> [args...]` passes the identity and Tauri config to
the child command. Mobile scripts already use it. Supply
`TENSAMIN_ANDROID_VERSION_CODE` as an integer from 1 to 2100000000, greater
than every previously published code for that application ID. The verification
workflow uses the Forgejo run number, but publication must coordinate a durable
monotonic sequence rather than assume independent workflows share one counter.

Client `.forgejo/workflows/ci.yml` verifies stable, canary, and dev on every
push and manual dispatch, including Android builds and native Rust checks.
It does not deploy or publish releases.

## Combined publication

Publishing belongs to
[prod-pins](https://git.methanium.net/tensamin/prod-pins/releases).
The combined release should identify all pinned component revisions and build
client and server artifacts from that same graph. Keep immutable versioned
artifacts alongside moving `stable` and `canary` channel releases. Registry
publication uses only the Forgejo user registry, with `latest` following stable.

Iota's [release contract](https://git.methanium.net/tensamin/iota/src/branch/main/scripts/releases.md)
requires per-channel increasing sequences, expiry timestamps, serialized
publication, and immutable binary URLs. Moving manifests are named
`iota-update-linux-ARCH.json` with `.sig` signatures. Product versions have
the form `BASE_VERSION-CHANNEL-FULL_SOURCE_SHA`.

Sign manifests with the Rust `iota-release` tool. It signs the typed manifest's
serialized field order, not the pretty-printed JSON bytes. The signing secret
is a 32-byte Ed25519 seed encoded as 64 hex characters. Confirm the derived
public key against the expected installer trust key, and set the full Iota
source SHA explicitly when building outside its checkout.

Final central workflows are pending. Coordinate release titles, APK names and
signing/version codes, registry user/image names, Iota trust configuration,
sequence allocation, and infrastructure deployment before enabling publication.
Then sync the [Obtainium JSON](/obtainium.json) and download instructions with
the actual assets and run an end-to-end update check.
