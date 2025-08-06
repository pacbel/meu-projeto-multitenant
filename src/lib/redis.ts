import { Redis } from '@upstash/redis';

// Configuração do cliente Redis usando Upstash
// Usando valores diretos para evitar problemas com variáveis de ambiente durante o build
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || 'https://seu-redis-url.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN || 'seu_token_aqui',
});

export default redis;
