import { SERVICE_PORTS } from '@athlete-ally/shared/config/ports';

export const config = {
  PORT: process.env.PORT || SERVICE_PORTS.FATIGUE.toString(),
  FATIGUE_DATABASE_URL: process.env.FATIGUE_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/athlete_ally_fatigue',
  JAEGER_ENDPOINT: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

