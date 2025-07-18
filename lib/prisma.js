import { PrismaClient } from '@prisma/client'

// Cache de instâncias do Prisma por tenant
const prismaInstances = new Map()

export function getPrismaClient(tenant) {
  if (!prismaInstances.has(tenant)) {
    const databaseUrl = `mysql://usuario:senha@localhost:3306/${tenant}_db`
    
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