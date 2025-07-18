import { getPrismaClient } from '../../../../lib/prisma'

export async function GET(request) {
  const tenant = request.headers.get('x-tenant')
  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 400 })
  }
  const prisma = getPrismaClient(tenant)
  try {
    const users = await prisma.user.findMany({
      include: { posts: true }
    })
    return Response.json(users)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request) {
  const tenant = request.headers.get('x-tenant')
  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 400 })
  }
  const prisma = getPrismaClient(tenant)
  try {
    const body = await request.json()
    const { email, name } = body
    const newUser = await prisma.user.create({
      data: { email, name }
    })
    return Response.json(newUser)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
}