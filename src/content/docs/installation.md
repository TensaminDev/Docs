---
title: Install the app
---

Download the client from the
[Tensamin releases](https://github.com/TensaminDev/Production-Pins/releases).
Choose a release and use the assets attached to it for your platform and architecture.
Numbered `stable-` releases are Stable builds. Numbered `canary-` prereleases
are Canary builds. Each is published only after its builds and server deployment
succeed. The metadata-only releases named `stable` and `canary` contain Iota
update pointers, not app installers.

## Linux

The desktop client uses Electron. Published Linux builds can include AppImage,
deb, and rpm files. Use your distribution's package installer for deb or rpm.
For an AppImage, make the downloaded file executable and launch it:

```sh
chmod +x ./Tensamin-*.AppImage
./Tensamin-*.AppImage
```

Run these commands in a directory containing only the AppImage you intend to use.
The client does not download or install its own updates. Install a newer release
manually, or update through the package manager that installed it.

## Android

Install the signed APK attached to your chosen release. Android may ask you to
allow installations from the browser or file manager you use to open it.

| Build | Application ID | Icon |
| --- | --- | --- |
| Stable | `net.tensamin.client` | Normal Tensamin icon |
| Canary | `net.tensamin.client.canary` | Yellow Tensamin icon |
| Local development | `net.tensamin.client.dev` | Blue outline icon |

Stable and canary install separately and can coexist. A canary APK updates the
canary application; it does not switch the stable application to canary.
Development builds are for local development.

For updates, download a newer APK for the same application, or configure
[Obtainium](/obtainium/). The client has no built-in automatic updater or
release-channel switch.

## Browser

Use the [web client](https://app.tensamin.net). It loads the version currently
served by that site. Reload the page to load a newer deployed version.

To host your account service, follow [Iota setup](/iota/).
