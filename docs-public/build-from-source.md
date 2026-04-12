# Build Binnacle From Source

If you want to contribute to the UI or build the application from the raw Next.js 16 source code rather than using a pre-packaged Docker image, follow these instructions.

## Prerequisites
- **Node.js**: v18+ 
- **Docker**: For testing the telemetry integration socket locally.

## Local Environment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/imatics-ch/binnacle.git
   cd binnacle
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Set up your connection to Traefik and Docker. Copy the example file:
   ```bash
   cp docs-public/.env.example .env.local
   ```
   Open `.env.local` and define `TRAEFIK_API_URLS` properly. If running Træfik locally, ensure you have connectivity.

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser. Next.js Turbopack will hot-reload any changes you make to the UI.

## Building the Custom Docker Image

If you've made modifications and want to run it in production:

1. **Build the container using the native Dockerfile:**
   ```bash
   docker build -t binnacle-custom:latest .
   ```
2. **Deploy it using docker-compose:**
   Update your `docker-compose.yml` to point the `image:` to `binnacle-custom:latest` instead of pulling from an upstream registry.
