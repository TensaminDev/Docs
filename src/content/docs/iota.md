---
title: Set up an Iota
description: Install and operate your own Tensamin account service.
---

Iota is the account service you host for Tensamin. Keep its persistent data and
identity files backed up. An Iota identity is separate from a user's account keys.

## Linux with systemd

Obtain an Iota CLI and the matching system-wide installer ZIP from the same
[release](https://github.com/TensaminDev/Production-Pins/releases). Choose the
architecture matching your host, `x86_64` or `aarch64`.

Verify the initial download's provenance and trusted signing key before running
the CLI as root. The installer checks bundle contents, but a key downloaded
alongside an untrusted binary cannot establish initial trust.

The current release signing key has ID `primary` and this Ed25519 public key:

```text
3b9da4515a254a0082e5c0ee55164a54958258763f7a0d5e45879512aa6e91a9
```

The release's `IOTA_RELEASE_PUBLIC_KEY` file and the installer's update
configuration must match this public key.

Use the actual filenames of your downloaded files:

```sh
chmod +x ./iota-linux-x86_64
sudo ./iota-linux-x86_64 daemon bootstrap \
  --bundle ./iota-installer-linux-x86_64.zip --operator "$USER"
sudo iota terms accept --system
```

The installer configures `iota-daemon.service` and `iota-daemon.socket`.
The `iota-operators` group grants access to its IPC socket. Start a new login
session after the installer adds your user to that group.

Bootstrap installs an update timer. For manual-only updates, disable it:

```sh
sudo systemctl disable --now iota-update.timer
```

See [Iota updates](/updates/) for trust and release-channel behavior.

## Network and TLS

Enabled network and loopback web listeners require a TLS certificate and key.
The daemon's service user must be able to read both files and traverse their
parent directories. Restart Iota after renewing its certificate.

The default network listener uses port `1984`. Allow both TCP and UDP when
exposing that listener. A loopback listener also needs an explicit loopback bind
address; selecting loopback mode alone does not change the address.

Iota's shipped static web assets are not the Tensamin client application.
Hosting an Iota does not automatically host the web client.

## NixOS

Add the module flake to your system's inputs and pass `inputs` through `specialArgs`:

```nix
inputs.tensamin.url = "git+https://github.com/TensaminDev/Production-Pins?ref=main";
```

Import the Iota module, install its CLI, and provide runtime TLS paths:

```nix
{ inputs, pkgs, ... }: {
  imports = [ inputs.tensamin.nixosModules.iota ];
  environment.systemPackages = [
    inputs.tensamin.packages.${pkgs.stdenv.hostPlatform.system}.iota
  ];
  tensamin.iota = {
    enable = true;
    certFile = "/run/secrets/iota-cert.pem";
    keyFile = "/run/secrets/iota-key.pem";
  };
}
```

Keep secrets as runtime path strings, not Nix path values containing secrets.
Production-Pins fetches its pinned application sources from public GitHub
repositories. Updating a NixOS installation still requires updating its flake
lock and rebuilding the system.

The NixOS module names its service and socket `iota`. Its IPC socket is
`/run/iota/iota.sock`, owned by `iota:iota`. Add operators to the `iota` group.
Accept terms with `sudo iota terms accept --system`.

Module settings generate `stateDir/config.yaml` on startup. Listener options
take precedence, and omitted identity and discovery fields retain daemon values.
Use the module's `settings` or `settingsFile` option for configuration rather
than editing the generated file. Identities remain under `stateDir/identity`.

NixOS installations update through the system configuration, not the unmanaged
Iota updater.
