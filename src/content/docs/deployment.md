---
title: Deployment
---

## Central NixOS modules

Add the prod-pins input shown in [installation](/installation/), then import
`inputs.tensamin.nixosModules.default` in your NixOS configuration. Individual
imports are `nixosModules.iota`, `.omikron`, `.omega`, and `.client`.
All components are disabled by default. Options use `tensamin.*` directly.

```nix
{ inputs, ... }: {
  imports = [ inputs.tensamin.nixosModules.default ];

  tensamin.iota = {
    enable = true;
    certFile = "/run/secrets/iota-cert.pem";
    keyFile = "/run/secrets/iota-key.pem";
  };

  tensamin.client = {
    enable = true;
    hostName = "app.internal.example";
    bindAddress = "127.0.0.1";
    port = 8080;
  };
}
```

Provision the runtime certificate files before starting Iota. Enabled Iota
network and loopback listeners both require TLS. Setting `webMode = "loopback"`
does not change `bindAddress`; set the address explicitly. `disabled` turns off
the web listener. The default asset directory is Iota's shipped `static/web`,
currently a 404 page, not the client application.

| Option prefix | Default package | Default listener | Firewall |
| --- | --- | --- | --- |
| `tensamin.iota` | `iota-daemon` | `0.0.0.0:1984` | TCP and UDP |
| `tensamin.omikron` | `omikron` | `0.0.0.0:443` | TCP and UDP |
| `tensamin.omega` | `omega` | `0.0.0.0:443` | TCP and UDP |
| `tensamin.client` | `client-web` | `127.0.0.1:8080` | Closed |

Each component supports `package`, `bindAddress`, `port`, and `openFirewall`.
Set `openFirewall = false` when the infrastructure manages routing separately.
Omikron and Omega both default to port 443, so assign separate addresses or
ports when colocating them.

Omikron and Omega require either `acmeCertDir`, containing `fullchain.pem` and
`key.pem`, or both `certFile` and `keyFile`. Omikron also requires a positive
`id` and `omegaTrustFile`, the trusted Omega public key bundle. Set `omegaHost`
and `omegaPort` to the deployed listener; `omegaPort` defaults to 9187 even
though the Omega module's listener defaults to 443. Omega requires `DB_URL`
in a runtime `environmentFiles` entry. Its identities are files, not
`PRIVATE_KEY` or `PUBLIC_KEY` environment variables.

Keep secret paths as strings so secret contents stay out of the Nix store.
Services retain identities in their state directories. Supplying
`identityFile` and `publicIdentityFile` together reapplies them on every start.
Restart Omikron or Omega after certificate renewal so startup recopies the
certificate and converts the key to PKCS8.

Iota's `settings` generates YAML on startup. Module listener and asset settings
take precedence. Omitted `iota_id`, `omikron_host`, `omikron_port`, and
`omikron_id` retain discovered values; other edits to the mutable config are
replaced. `settingsFile` replaces generated settings and must agree with the
module's TLS, listener, and firewall options. Relative paths resolve against
`stateDir`.

The module's IPC socket is `/run/iota/iota.sock`, owned by `iota:iota` with
mode `0660`. Add authorized operators to the `iota` group, and install the
central `iota` package if they need the CLI. The daemon-only package does not
include it. Accept deployment terms with `sudo iota terms accept --system`.

The [module README](https://git.methanium.net/tensamin/prod-pins/src/branch/main/modules/README.md)
describes the full runtime interface.

## Hosted web client

`tensamin.client` enables nginx, serves `client-web` from its output root,
and uses `/index.html` as the SPA fallback. It creates an explicit HTTP
listener; public TLS, proxy routing, and Anubis belong to the infrastructure.

The production topology is:

```text
app.tensamin.net
  -> host nginx with TLS
  -> host Anubis
  -> host loopback origin, app-raw.tensamin.net
  -> internal production VM nginx, 10.201.0.10:8080
  -> pinned client-web
```

Here "guest" means the VM, not a guest user account. The public host proxies
the production application instead of serving a separate production web
directory. Keep the guest HTTP listener internal. Verify public Anubis routing
separately from the guest's direct HTML health check.

## Containers

`omikron-container` and `omega-container` are Docker-loadable Nix outputs.
Their working directories are `/var/lib/omikron` and `/var/lib/omega`; mount
persistent state, identities, configuration, and certificates there.
The central flake currently has no `iota-container` output.

Published images belong only in the Forgejo user registry. The intended path
is `git.methanium.net/<publishing-user>/<image>:<tag>`, not Docker Hub or an
organization namespace. The publishing user and final image names still need
confirmation from the central workflow. `latest` follows stable; `stable`
and `canary` are moving channel tags. Prefer immutable version tags or digests
for reproducible deployments. Locally built images currently carry source
revision tags; that does not establish the registry publication names.
