---
title: Installation
---

## Linux client

The default desktop client is Electron. Use the combined
[prod-pins releases](https://git.methanium.net/tensamin/prod-pins/releases)
for published downloads. Release publication is being consolidated there;
check the attached assets for the available formats and architectures.

The central flake supports `x86_64-linux` and `aarch64-linux`:

```sh
nix run git+https://git.methanium.net/tensamin/prod-pins#client
nix build git+https://git.methanium.net/tensamin/prod-pins
```

Both `default` and `client` select Electron. `client-web` is a static web
application, not a desktop executable. For NixOS, add the central input:

```nix
inputs.tensamin.url = "git+https://git.methanium.net/tensamin/prod-pins?ref=main";
```

Pass `inputs` through your configuration's `specialArgs`, then install:

```nix
{ inputs, pkgs, ... }: {
  environment.systemPackages = [
    inputs.tensamin.packages.${pkgs.stdenv.hostPlatform.system}.client
  ];
}
```

The pinned sources currently use SSH URLs. Fetching them requires read access
to `git@methanium.net`, even when the central input uses HTTPS.

## Android channels

| Channel | Application ID | Branding |
| --- | --- | --- |
| Stable | `net.tensamin.client` | Regular Tensamin icon |
| Canary | `net.tensamin.client.canary` | Yellow icon |
| Local dev | `net.tensamin.client.dev` | Blue background with outline artwork |

Stable and canary can be installed side by side. Each ID needs a consistent
Android signing key and increasing version codes for in-place updates.
Dev is for local development; client CI verifies it but publishes no dev releases.

Download the channel's signed APK from prod-pins, or use
[Obtainium](/obtainium/) to track Android updates. Final APK filenames and
publication workflows are still pending. These docs do not imply that every
listed artifact is already published.

## Iota

For NixOS, use the [central modules](/deployment/). For an unmanaged Linux
system with systemd, obtain a trusted Iota CLI and the matching signed ZIP
bundle from prod-pins, then bootstrap explicitly:

```sh
sudo ./iota daemon bootstrap --bundle ./iota-release.zip --operator "$USER"
sudo iota terms accept --system
sudo iota update channel stable
sudo iota update check
sudo iota update apply
```

`iota-release.zip` is a local filename for your downloaded bundle, not a
promised release asset name. Verify the initial CLI and bundle provenance
before running them as root. The bundle provisions the pinned update public
key and key ID. Later updates verify signed manifests against that trust.
See [updates and security](/updates/) for channel selection and NixOS updates.

The unmanaged installer uses the `iota-operators` group and
`iota-daemon.service`/`iota-daemon.socket`. Start a new login session after
group membership changes. The NixOS module instead uses the `iota` group and
`iota.service`/`iota.socket`.
