# Docker Deployment Guide

The easiest way to run **Binnacle** is to deploy it natively alongside your existing Traefik routing stack.

## 1. Prepare your Environment

Copy the provided example files to the root of your deployment directory:

```bash
cp docker-compose.yml.example docker-compose.yml
cp docs-public/.env.example .env
```

## 2. Configuration Options

### Traefik API Integration
You must tell Binnacle where your Traefik API endpoints live. 
In your newly created `.env` file, edit the `TRAEFIK_API_URLS` value.

- **Standard HTTP:** `TRAEFIK_API_URLS=http://traefik:8080`
- **With Basic Auth:** `TRAEFIK_API_URLS=http://admin:my-password@traefik:8080`
*(Binnacle natively strips the credentials from the URL and injects them safely as HTTP Authorization headers)*

### Docker Socket Mapping
By default, the `docker-compose.yml.example` maps `/var/run/docker.sock` as read-only. Binnacle uses this socket connection directly to parse your container lists and intercept live CPU/RAM telemetry. 

## 3. Customize Binnacle

You can customize the entire interface from your `.env` file without rebuilding the container:
- `CONTAINER_CONTROL=false` completely strips the UI of the Start/Stop/Restart action buttons for maximum security.
- `HEADER_LINE_1` and `HEADER_LINE_2` allow you to change the Hero text at the top of the interface.
- Enable `CARDS_BACKGROUND_STYLE=photos` and supply an `UNSPLASH_ACCESS_KEY` to natively power your application cards with live, dynamic photography!

## 4. Run the Stack

Once your `docker-compose.yml` routing domain is set and your environment is configured, spin it up:

```bash
docker compose up -d
```
Head to your configured Traefik domain and you're good to go!
