/**
 * Configurações centralizadas para o sistema
 */
export const config = {
  redis: {
    // TTL para cache no Redis (1 hora em segundos)
    cacheTTL: 60 * 60,
    
    // TTL para cache local (5 minutos em milissegundos)
    localCacheTTL: 5 * 60 * 1000,
    
    // Chave para armazenar a lista de tenants no Redis
    tenantKey: 'allowed_tenants',
  },
  
  // Lista padrão de tenants (usada como fallback)
  defaultTenants: ['cliente1_db', 'cliente2_db', 'cliente3_db', 'default'],
};
