import type { HealthDto } from '../types/health';
import { apiGet } from './client';

export const fetchHealth = (): Promise<HealthDto> => apiGet<HealthDto>('/health');
