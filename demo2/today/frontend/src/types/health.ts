// Types mirroring the frozen `GET /api/health` payload (see docs/architecture/0001).
export type HealthStatus = 'ok';

export interface HealthDto {
  status: HealthStatus;
  service: string;
  apiVersion: string;
}
