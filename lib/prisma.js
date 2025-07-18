import { PrismaClient } from '@prisma/client'

// Cache de instâncias do Prisma por tenant
const prismaInstances = new Map()

export function getPrismaClient(tenant) {
  if (!tenant) {
    console.error('Tenant não fornecido para getPrismaClient');
    tenant = 'default';
  }
  
  if (!prismaInstances.has(tenant)) {
    // Se o tenant já termina com _db, não adiciona novamente
    const dbName = tenant.endsWith('_db') ? tenant : `${tenant}_db`;
    const databaseUrl = `mysql://usuario:senha@localhost:3306/${dbName}`
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })
    
    prismaInstances.set(tenant, prisma)
  }
  
  return prismaInstances.get(tenant)
}

// Função para fechar todas as conexões (útil para cleanup)
export async function disconnectAll() {
  const promises = Array.from(prismaInstances.values()).map(prisma => prisma.$disconnect())
  await Promise.all(promises)
  prismaInstances.clear()
}