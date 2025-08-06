import redis from './redis';
import { config } from './config';

const TENANT_KEY = config.redis.tenantKey;
const CACHE_TTL = config.redis.cacheTTL; // TTL do cache no Redis

/**
 * Serviço para gerenciar tenants no Redis
 */
export class TenantService {
  /**
   * Obtém a lista de tenants permitidos do Redis
   * Com cache local para reduzir chamadas ao Redis
   */
  private static localCache: {
    data: string[];
    timestamp: number;
  } | null = null;

  private static LOCAL_CACHE_TTL = config.redis.localCacheTTL; // TTL do cache local

  /**
   * Obtém a lista de tenants permitidos
   * Usa cache local primeiro, depois Redis, e por último fallback para lista padrão
   */
  static async getAllowedTenants(): Promise<string[]> {
    // Verifica o cache local primeiro
    if (
      this.localCache &&
      Date.now() - this.localCache.timestamp < this.LOCAL_CACHE_TTL
    ) {
      return this.localCache.data;
    }

    try {
      // Tenta buscar do Redis
      const tenants = await redis.get<string[]>(TENANT_KEY);
      
      if (tenants && Array.isArray(tenants)) {
        // Atualiza o cache local
        this.localCache = {
          data: tenants,
          timestamp: Date.now(),
        };
        return tenants;
      }

      // Se não encontrar no Redis, retorna lista padrão e salva no Redis
      const defaultTenants = config.defaultTenants;
      await this.setAllowedTenants(defaultTenants);
      
      // Atualiza o cache local
      this.localCache = {
        data: defaultTenants,
        timestamp: Date.now(),
      };
      
      return defaultTenants;
    } catch (error) {
      console.error('Erro ao buscar tenants do Redis:', error);
      
      // Em caso de erro, retorna lista padrão
      const fallbackTenants = config.defaultTenants;
      
      // Atualiza o cache local mesmo em caso de erro
      this.localCache = {
        data: fallbackTenants,
        timestamp: Date.now(),
      };
      
      return fallbackTenants;
    }
  }

  /**
   * Adiciona um novo tenant à lista de permitidos
   */
  static async addTenant(tenant: string): Promise<boolean> {
    try {
      const tenants = await this.getAllowedTenants();
      
      if (!tenants.includes(tenant)) {
        tenants.push(tenant);
        await this.setAllowedTenants(tenants);
        
        // Atualiza o cache local
        this.localCache = {
          data: tenants,
          timestamp: Date.now(),
        };
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar tenant:', error);
      return false;
    }
  }

  /**
   * Remove um tenant da lista de permitidos
   */
  static async removeTenant(tenant: string): Promise<boolean> {
    try {
      const tenants = await this.getAllowedTenants();
      const updatedTenants = tenants.filter(t => t !== tenant);
      
      await this.setAllowedTenants(updatedTenants);
      
      // Atualiza o cache local
      this.localCache = {
        data: updatedTenants,
        timestamp: Date.now(),
      };
      
      return true;
    } catch (error) {
      console.error('Erro ao remover tenant:', error);
      return false;
    }
  }

  /**
   * Define a lista completa de tenants permitidos
   */
  static async setAllowedTenants(tenants: string[]): Promise<boolean> {
    try {
      await redis.set(TENANT_KEY, tenants, {
        ex: CACHE_TTL, // Expira após o TTL definido
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao definir tenants no Redis:', error);
      return false;
    }
  }

  /**
   * Verifica se um tenant específico está na lista de permitidos
   */
  static async isTenantAllowed(tenant: string): Promise<boolean> {
    const tenants = await this.getAllowedTenants();
    return tenants.includes(tenant);
  }
}
