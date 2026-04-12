# Environment Variables Reference

Binnacle leverages environment variables natively via Docker or Next.js to provide you with infinite flexibility over the UI, telemetry, and aesthetic appearance of your dashboard.

To configure your deployment, place these variables inside your `.env` file (if building from source) or supply them under the `environment:` sector of your completely unmanaged `docker-compose.yml`.

---

## Backend Configuration

| Environment Variable | Description | Default |
| --- | --- | --- |
| `TRAEFIK_API_URLS` | A comma-separated list of your Traefik API endpoints. Essential for service discovery. **Note:** If your endpoint is secured with Basic Auth, simply embed the credentials in the URL: `http://admin:password@traefik:8080`. | `http://localhost:8080` |
| `DEMO_MODE` | Setting this to `true` completely cuts the Docker pipeline and natively displays a robust mockup layout. Excellent for taking screenshots! | `false` |

## Page Structure
| Environment Variable | Description |
| --- | --- |
| `HEADER_LINE_1` | The dominant Hero text in the Binnacle header. |
| `HEADER_LINE_2` | The sub-header text sitting directly beneath the Hero title. |
| `HEADER_DESCRIPTION` | Further descriptive body text you can add to the page banner. |

## Container Control and Telemetry
| Environment Variable | Options | Description |
| --- | --- | --- |
| `EXPAND_DETAILS` | `true`, `false` | When true, cards default to displaying verbose container details. |
| `CARD_TELEMETRY` | `true`, `expand`, `false`| Selects how Docker CPU/RAM streaming is rendered. Set to `expand` means telemetry is only shown when the card drops down. |
| `CONTAINER_CONTROL` | `true`, `false` | A critical security toggle. Setting this to `false` entirely strips the Start, Stop, and Restart functionality from the user interface. |

## Cards & Aesthetics
| Environment Variable | Options | Description |
| --- | --- | --- |
| `CARDS_PER_ROW` | Any Integer | Dynamically shifts the layout grid to limit or expand your container density. *(Default: 2)* |
| `PAGE_BACKGROUND_STYLE`| `mesh`, `grid`, `beams`, `blob`, `none` | Transitions the global backdrop of the entire page to pure aesthetic layouts. |
| `CARDS_BACKGROUND_STYLE` | `wave`, `colors`, `circle`, `photos`, `none` | Bakes high-quality artistic background renders inside the bounds of the actual cards themselves! |
| `UNSPLASH_ACCESS_KEY` | Your Unsplash Key | A required access token if you intend to use the `photos` background style. |
| `CARDS_BACKGROUND_PHOTOS_TAGS` | Comma-separated strings | Used specifically alongside Unsplash styles to guide the algorithm. *(Example: `servers,technology`)* |

## Metadata Toggles
These two powerful variables allow you to completely intercept generic container naming via native Docker tags! Pick any label namespace you want.
| Environment Variable | Example Values | Description |
| --- | --- | --- |
| `APP_NAME_DOCKER_LABEL` | `binnacle.title` | Will naturally pull custom, clean names from your container configurations. |
| `APP_NAME_DOCKER_GROUP` | `binnacle.group` | Sorts your dashboard beautifully based on whatever organizational parameters you want! |
