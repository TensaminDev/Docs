---
title: Installation
---

# Client

You can download the client from [GitHub](https://github.com/Tensamin/Client/releases) or directly from the [Homepage](https://tensamin.net).
For linux we have `.deb` and `.rpm` files on github, two AUR packages and a Nix Flake.

### Arch Linux

This includes [these distros](https://wiki.archlinux.org/title/Arch-based_distributions)

##### Easy Install

- `paru -S tensamin-bin`
- `paru -S tensamin-git`

##### Manual Install

```sh
git clone https://aur.archlinux.org/tensamin-bin
cd tensamin-bin
makepkg -si
```

```sh
git clone https://aur.archlinux.org/tensamin-git
cd tensamin-git
makepkg -si
```

### Nix Flake

**flake.nix**

1. Add it to the inputs

```nix
{
  # ...
  inputs = {
    tensamin.url = "github:Tensamin/Client";
    # ...
  };
  # ...
}
```

2. Add it to the system packages

**configuration.nix**

```nix
{
  inputs,
  pkgs,
  ...
}: {
  # ...
  environment.systemPackages = [
    inputs.tensamin.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];
  # ...
}
```

# Iota

We provide a docker container and binary download on [GitHub](https://github.com/Tensamin/Iota/releases).

### Docker

Using `docker run`

```bash
docker run tensamin/iota:latest
```

or using Docker-Compose

```yaml
services:
  app:
    container_name: iota
    image: tensamin/iota:latest
    ports:
      - "1984:1984" # Needed for communties and web ui
    volumes:
      - data:/app
      - ./users.json:/app/users.json
      - ./config.json:/app/config.json

volumes:
  data:
```

### Build from source

```bash
git clone https://github.com/Tensamin/Iota
cd Iota
cargo build --release
./target/release/iota
```
