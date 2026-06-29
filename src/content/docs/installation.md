---
title: Installation
---

# Client

You can download the latest client from our [Git](https://git.methanium.net/tensamin/client/releases). It is available as a `.deb`, `.rpm`, `.AppImage` and a Nix Flake

### Nix Flake

**flake.nix**

1. Add Tensamin to your inputs

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

2. And add the package

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

You can download the Iota from our [Git](https://git.methanium.net/tensamin/iota/releases) or run the docker image:

### Docker

Using `docker run`

```bash
docker run tensamin/iota:latest
```

Using Docker-Compose

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
