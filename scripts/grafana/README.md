# Grafana Dashboard Deployment

## Setup

1) Have a running Grafana instance (self-hosted or cloud).
2) Create an API Key in Grafana:
   - Admin → API Keys → New API Key → choose "Editor" role → save.
3) Note the URL (e.g., `https://grafana.example.com`) and API key.

## Deploy dashboard

```bash
GRAFANA_URL='https://grafana.example.com' GRAFANA_API_KEY='glc_...' npm run push:grafana
```

Or verbose:

```bash
VERBOSE=1 GRAFANA_URL='https://grafana.example.com' GRAFANA_API_KEY='glc_...' npm run push:grafana
```

## Customize dashboard

Edit `grafana/dashboard-template.json` to add:
- Panels with Prometheus queries (e.g., `up`, `http_requests_total`)
- Annotations for campaign events
- Alerts thresholds

Then re-deploy.

## Integrate with monitoring agent

Run the monitoring agent and send metrics to Prometheus via a simple exporter. See `POST-LAUNCH-README.md` for more details.
