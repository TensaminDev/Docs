---
title: Installation
---

# Client

You can download the client from our [Git](https://git.methanium.net/tensamin/client/releases) or directly from the [Homepage](https://tensamin.net).
We provide a `.deb`, `.rpm` and `.AppImage`

### Nix Flake

**flake.nix**

1. Add it to the inputs

```nix
{
  # ...
  inputs = {
    tensamin.url = "git+https://git.methanium.net/tensamin/client";
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

We provide a docker container and binary download on our [Git](https://git.methanium.net/tensamin/iota/releases).

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
