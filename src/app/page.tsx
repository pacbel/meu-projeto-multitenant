"use client";
import { useEffect, useState } from 'react'


interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  posts: Post[];
}

export default function Home() {
  const tenant = "default"; // TODO: Substitua pela lógica correta para obter o tenant, se necessário.
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, postsRes] = await Promise.all([
          fetch('/api/users', { headers: { 'x-tenant': tenant } }),
          fetch('/api/posts', { headers: { 'x-tenant': tenant } })
        ])

        const usersData = await usersRes.json()
        const postsData = await postsRes.json()

        setUsers(Array.isArray(usersData) ? usersData : [])
        setPosts(Array.isArray(postsData) ? postsData : [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) return <div>Carregando...</div>
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Cliente: {tenant}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>Usuários</h2>
          {Array.isArray(users) && users.map(user => (
            <div key={user.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <small>Posts: {user.posts.length}</small>
            </div>
          ))}
        </div>
        
        <div>
          <h2>Posts</h2>
          {Array.isArray(posts) && posts.map(post => (
            <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>Por: {post.author.name}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}