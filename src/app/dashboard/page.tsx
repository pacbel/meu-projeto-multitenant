"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tenant, setTenant] = useState("default");
  const [databaseName, setDatabaseName] = useState("default_db");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detecta o tenant do hostname quando o componente montar
  useEffect(() => {
    // Pega o hostname completo: cliente1_db.localhost:3000
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Se tem subdomínio (cliente1_db.localhost)
    if (parts.length > 1) {
      const subdomain = parts[0]; // cliente1_db
      setTenant(subdomain);
      setDatabaseName(subdomain); // Já contém o sufixo _db
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [usersRes, postsRes] = await Promise.all([
          fetch('/api/users', { headers: { 'x-tenant': tenant } }),
          fetch('/api/posts', { headers: { 'x-tenant': tenant } })
        ]);

        const usersData = await usersRes.json();
        const postsData = await postsRes.json();

        setUsers(Array.isArray(usersData) ? usersData : []);
        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [tenant]);
  
  return (
    <ProtectedRoute>
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <div>
            <h1>Dashboard</h1>
            <p>Bem-vindo, {user?.email}</p>
            <p>Cliente: {tenant} | Banco de dados: {databaseName}</p>
          </div>
          <button 
            onClick={logout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Sair
          </button>
        </div>
        
        {loading ? (
          <div>Carregando...</div>
        ) : (
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
        )}
      </div>
    </ProtectedRoute>
  );
}
