export interface TraefikRouter {
  rule: string;
  name: string;
  status: string;
  service: string;
  tls?: Record<string, any>;
}

export interface ContainerInfo {
  Id: string;
  Names: string[];
  State: string;
  Status: string;
  Labels: Record<string, string>;
}

export interface ApplicationInfo {
  id: string;
  name: string;
  url: string; // Priority to https if both exist
  domains: string[];
  hasHttps: boolean;
  status: 'running' | 'stopped' | 'unknown';
  containerIds: string[];
  favicon?: string;
  category?: string;
  telemetry?: {
    cpu: string;
    memory: string;
  };
  traefikDetails?: {
    rule: string;
    service: string;
    tls: boolean;
    routerName: string;
  };
}
