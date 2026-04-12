# Binnacle: Docker & Traefik Operations Center

Binnacle is a premium, open-source homelab operations dashboard built atop Next.js 16 and Tailwind CSS v4. Rather than forcing you to statically map out your services, Binnacle fluidly integrates with your Docker daemon and Traefik routers to parse, collect, and render your applications in real-time.

![Binnacle Interface Cover](/docs-public/cover.png) *(Sample Cover)*

## Why Binnacle?
- **Zero Configuration Discovery**: Binnacle asks Traefik for your active routing rules, parsing subdomains and HTTP/HTTPS services instantly.
- **Real-Time Telemetry**: Directly pipes data from `docker.sock` to display live CPU and RAM usage alongside your apps with beautiful glowing sparklines. 
- **Premium Aesthetics**: High-end glassmorphism, dynamic fluid tracking algorithms, mesh gradients, and Unsplash-powered image backdrops bring your infrastructure to life.
- **Deep Control**: Integrates secure Start, Restart, and Stop actions for your containers natively. (Can be completely locked down via ENV).

## ⚠️ Security Warning
**Do not expose Binnacle to the public internet.** 
Binnacle is designed to be a unified control plane for your internal homelab and operates by mounting `/var/run/docker.sock` natively. Exposing this dashboard outside of a secured, private local area network (LAN) or virtual private network (VPN) is a severe security risk.

## Documentation

- **[Docker Deployment](/docs-public/docker-deployment.md)**: Jump right in using our pre-built Docker containers and `docker-compose` setups.
- **[Build from Source](/docs-public/build-from-source.md)**: Want to contribute or heavily modify the UI? Check out the developer instructions to clone and run the Next.js stack locally.
- **[Environment Variables](/docs-public/environment-variables.md)**: View all the flexible, dynamic UI toggles exposed natively via environment variables.

---
*Made with ❤️ for the Open Source Community.*

> **Author's Note**: This project was brought to life via **vibe-coding** — rapidly iterating designs, architectural choices, and full-stack integration using generative AI agents to craft a premium experience at lightspeed. Expect code that leans heavily into functional aesthetics!
