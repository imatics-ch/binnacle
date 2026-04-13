import { NextResponse } from 'next/server';
import Docker from 'dockerode';
import { TraefikRouter, ContainerInfo, ApplicationInfo } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (process.env.DEMO_MODE === 'true') {
      const demoApps: ApplicationInfo[] = [
        { id: '1', name: 'Grafana', url: 'https://grafana.example.com', domains: ['grafana.example.com'], hasHttps: true, status: 'running', containerIds: ['c1'], category: 'Observability', telemetry: { cpu: '2.4%', memory: '245 MB' } },
        { id: '2', name: 'Home Assistant', url: 'https://home.example.com', domains: ['home.example.com'], hasHttps: true, status: 'running', containerIds: ['c2'], category: 'Smart Home', telemetry: { cpu: '1.2%', memory: '512 MB' } },
        { id: '3', name: 'Plex Media Server', url: 'https://plex.example.com', domains: ['plex.example.com'], hasHttps: true, status: 'running', containerIds: ['c3'], category: 'Media', telemetry: { cpu: '12.5%', memory: '1.2 GB' } },
        { id: '4', name: 'Pi-hole', url: 'https://pihole.example.com', domains: ['pihole.example.com'], hasHttps: true, status: 'running', containerIds: ['c4'], category: 'Network', telemetry: { cpu: '0.1%', memory: '128 MB' } },
        { id: '5', name: 'Portainer', url: 'https://portainer.example.com', domains: ['portainer.example.com'], hasHttps: true, status: 'running', containerIds: ['c5'], category: 'Infrastructure', telemetry: { cpu: '0.3%', memory: '64 MB' } },
        { id: '6', name: 'Nextcloud', url: 'https://cloud.example.com', domains: ['cloud.example.com'], hasHttps: true, status: 'running', containerIds: ['c6'], category: 'Storage', telemetry: { cpu: '0.8%', memory: '320 MB' } },
        { id: '7', name: 'Sonarr', url: 'https://sonarr.example.com', domains: ['sonarr.example.com'], hasHttps: true, status: 'running', containerIds: ['c7'], category: 'Media', telemetry: { cpu: '0.4%', memory: '180 MB' } },
        { id: '8', name: 'Bitwarden', url: 'https://vault.example.com', domains: ['vault.example.com'], hasHttps: true, status: 'running', containerIds: ['c8'], category: 'Security', telemetry: { cpu: '0.1%', memory: '85 MB' } },
        { id: '9', name: 'Traefik', url: 'https://traefik.example.com', domains: ['traefik.example.com'], hasHttps: true, status: 'running', containerIds: ['c9'], category: 'Infrastructure', telemetry: { cpu: '0.5%', memory: '32 MB' } },
        { id: '10', name: 'Gitea', url: 'https://git.example.com', domains: ['git.example.com'], hasHttps: true, status: 'running', containerIds: ['c10'], category: 'Development', telemetry: { cpu: '0.2%', memory: '150 MB' } },
        { id: '11', name: 'Jellyfin', url: 'https://jellyfin.example.com', domains: ['jellyfin.example.com'], hasHttps: true, status: 'stopped', containerIds: ['c11'], category: 'Media', telemetry: { cpu: '0%', memory: '0 MB' } }
      ];
      return NextResponse.json(demoApps);
    }
    
    // 1. Fetch Docker Containers
    let docker;
    let containers: ContainerInfo[] = [];

    try {
      const dockerOptions = process.env.DOCKER_SOCKET_PATH ? { socketPath: process.env.DOCKER_SOCKET_PATH } : {};
      docker = new Docker(dockerOptions);
      containers = (await docker.listContainers({ all: true })) as any;
    } catch (err: any) {
      console.warn(`Could not connect to Docker Daemon: ${err.message}`);
    }

    // 2. Fetch Traefik Routers
    const traefikUrlsEnv = process.env.TRAEFIK_API_URLS || 'http://localhost:8080';
    const traefikUrls = traefikUrlsEnv.split(',').map(url => url.trim());

    let routers: TraefikRouter[] = [];
    for (const baseUrl of traefikUrls) {
      if (!baseUrl) continue;
      try {
        const urlObj = new URL(baseUrl);
        const headers: HeadersInit = {};

        // If basic auth is embedded in the URL (e.g. http://user:pass@host:8080)
        if (urlObj.username || urlObj.password) {
          const authString = Buffer.from(`${urlObj.username}:${urlObj.password}`).toString('base64');
          headers['Authorization'] = `Basic ${authString}`;
          // Strip credentials from the URL so fetch doesn't get confused
          urlObj.username = '';
          urlObj.password = '';
        }

        const fetchUrl = `${urlObj.toString().replace(/\/$/, '')}/api/http/routers`;

        const resp = await fetch(fetchUrl, {
          headers,
          cache: 'no-store'
        });

        if (resp.ok) {
          const data = await resp.json();
          routers = routers.concat(data);
        } else {
          console.warn(`Traefik instance at ${fetchUrl} returned status: ${resp.status} ${resp.statusText}`);
        }
      } catch (err: any) {
        const sanitizedUrl = baseUrl.replace(/\/\/[^@]+@/, '//***:***@');
        console.warn(`Could not connect to Traefik at ${sanitizedUrl}: ${err.message}`);
      }
    }

    // 3. Process and Group Applications
    const appMap = new Map<string, ApplicationInfo>();

    routers.forEach((router) => {
      // Ignore internal dashboard routers if desired, or skip routers without rules
      if (!router.rule || router.rule === 'internal') return;
      if (router.name.includes('traefik@')) return; // Option to skip internal traefik router

      // Extract domains from rule exactly: Host(`example.com`, `test.com`)
      const hostRegex = /Host\(([^)]+)\)/i;
      const match = router.rule.match(hostRegex);
      const domains: string[] = [];
      if (match && match[1]) {
        const rawDomains = match[1].split(',');
        rawDomains.forEach(d => {
          let cleanD = d.trim().replace(/`/g, '').replace(/'/g, '').replace(/"/g, '');
          if (cleanD) domains.push(cleanD);
        });
      }

      if (domains.length === 0) return;

      // Group primarily by the first domain extracted
      const primaryDomain = domains[0];
      const hasHttps = !!router.tls;

      let existing = appMap.get(primaryDomain);
      if (!existing) {
        // Try to match docker containers
        let status: 'running' | 'stopped' | 'unknown' = 'unknown';
        let foundContainers: string[] = [];
        let explicitGroupFromLabel: string | null = null;
        let explicitNameFromLabel: string | null = null;

        const nameLabelKey = process.env.APP_NAME_DOCKER_LABEL;
        const groupLabelKey = process.env.APP_NAME_DOCKER_GROUP;

        containers.forEach(c => {
          let matches = false;
          if (c.Labels) {
            for (const key of Object.keys(c.Labels)) {
              if (c.Labels[key].includes(primaryDomain) || c.Labels[key].includes(router.service)) {
                matches = true;
                break;
              }
            }
          }
          if (matches) {
            foundContainers.push(c.Id);
            if (c.State === 'running') status = 'running';
            else if (status !== 'running') status = 'stopped';

            // Allow overriding the card name via a specific Docker label
            if (nameLabelKey && c.Labels && c.Labels[nameLabelKey]) {
              explicitNameFromLabel = c.Labels[nameLabelKey];
            }
            // Allow overriding the category group
            if (groupLabelKey && c.Labels && c.Labels[groupLabelKey]) {
              explicitGroupFromLabel = c.Labels[groupLabelKey];
            }
          }
        });

        // Deduce a friendly name and category ("my-app@docker" -> "My App")
        let rawName = router.name.split('@')[0];

        let words = rawName.split('-').map(w => w.replace(/\b\w/g, l => l.toUpperCase()));

        // Use the explicit group if set, else fallback to first word if multiple words, else 'Uncategorized'
        let category = explicitGroupFromLabel || (words.length > 1 ? words[0] : 'Uncategorized');

        // Deduplicate words case-insensitively to prevent "App App" -> "App"
        let uniqueWords = words.filter((item, pos, self) => self.findIndex(v => v.toLowerCase() === item.toLowerCase()) === pos);
        let friendlyName = explicitNameFromLabel || uniqueWords.join(' ');

        existing = {
          id: primaryDomain,
          name: friendlyName,
          url: (hasHttps ? 'https://' : 'http://') + primaryDomain,
          domains,
          hasHttps,
          status: foundContainers.length > 0 ? status : 'unknown',
          containerIds: foundContainers,
          category,
          traefikDetails: {
            rule: router.rule,
            service: router.service,
            tls: hasHttps,
            routerName: router.name
          }
        };
        appMap.set(primaryDomain, existing as ApplicationInfo);
      } else {
        // Update HTTPS and URL if HTTPS router variation found
        if (hasHttps) {
          existing.hasHttps = true;
          existing.url = 'https://' + primaryDomain;
        }
      }
    });

    const applications = Array.from(appMap.values());

    // Perform a fast health check and favicon fetch
    await Promise.all(
      applications.map(async (app) => {
        try {
          // Provide a quick 3-second timeout so the API doesn't hang
          const res = await fetch(app.url, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });

          if (app.status === 'unknown') {
            if (res.status >= 500 && res.status <= 504) {
              app.status = 'stopped';
            } else {
              app.status = 'running';
            }
          }

          if (res.ok) {
            // Limit body read to 64KB — favicon links are always in <head>
            const reader = res.body?.getReader();
            let htmlChunks: Uint8Array[] = [];
            let totalSize = 0;
            const MAX_SIZE = 65536; // 64KB
            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done || totalSize >= MAX_SIZE) break;
                htmlChunks.push(value);
                totalSize += value.length;
              }
              reader.cancel();
            }
            const html = new TextDecoder().decode(Buffer.concat(htmlChunks).slice(0, MAX_SIZE));
            // Look for <link rel="icon" href="..."> or <link rel="shortcut icon" href="..."> or <link rel="apple-touch-icon" href="...">
            const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?(?:apple-touch-)?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i);
            if (faviconMatch && faviconMatch[1]) {
              let iconUrl = faviconMatch[1];
              if (!iconUrl.startsWith('http')) {
                if (iconUrl.startsWith('//')) iconUrl = (app.hasHttps ? 'https:' : 'http:') + iconUrl;
                else iconUrl = app.url + (iconUrl.startsWith('/') ? '' : '/') + iconUrl;
              }
              app.favicon = iconUrl;
            } else {
              app.favicon = app.url + '/favicon.ico';
            }
          } else {
            app.favicon = app.url + '/favicon.ico';
          }
        } catch (err) {
          if (app.status === 'unknown') {
            app.status = 'stopped';
          }
          app.favicon = app.url + '/favicon.ico';
        }
      })
    );

    // Fetch telemetry for applications with running containers
    if (docker) {
      await Promise.all(
        applications.map(async (app) => {
          if (app.status === 'running' && app.containerIds.length > 0) {
            try {
              let totalMem = 0;
              let totalCpu = 0;
              for (const cId of app.containerIds) {
                const stats = await docker!.getContainer(cId).stats({ stream: false }) as any;
                const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
                const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
                if (systemDelta > 0 && cpuDelta > 0) {
                  totalCpu += (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
                }
                totalMem += stats.memory_stats?.usage || 0;
              }
              app.telemetry = {
                cpu: totalCpu.toFixed(1) + '%',
                memory: (totalMem / 1024 / 1024).toFixed(0) + ' MB'
              };
            } catch (e) {
              // Ignore telemetry errors safely
            }
          }
        })
      );
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
