import { getPrismaClient } from '../../../../lib/prisma'

export async function GET(request) {
  const tenant = request.headers.get('x-tenant')
  const prisma = getPrismaClient(tenant)
  try {
    const posts = await prisma.post.findMany({
      include: { author: true }
    })
    return Response.json(posts)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request) {
  const tenant = request.headers.get('x-tenant')
  const prisma = getPrismaClient(tenant)
  try {
    const body = await request.json()
    const { title, content, authorId } = body
    const newPost = await prisma.post.create({
      data: { title, content, authorId }
    })
    return Response.json(newPost)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
}