import { NextRequest } from 'next/server';
import { getPrismaClient } from '../../../../lib/prisma';

export async function GET(request: NextRequest): Promise<Response> {
  const tenant = request.headers.get('x-tenant') || '';
  const prisma = getPrismaClient(tenant);
  try {
    const posts = await prisma.post.findMany({
      include: { author: true }
    });
    return Response.json(posts);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const tenant = request.headers.get('x-tenant') || '';
  const prisma = getPrismaClient(tenant);
  try {
    const body = await request.json();
    const { title, content, authorId } = body as { 
      title: string; 
      content: string; 
      authorId: number 
    };
    const newPost = await prisma.post.create({
      data: { title, content, authorId }
    });
    return Response.json(newPost);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}
