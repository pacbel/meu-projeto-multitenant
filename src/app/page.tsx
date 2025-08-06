"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [tenant, setTenant] = useState("default");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Detecta o tenant do hostname quando o componente montar
  useEffect(() => {
    // Pega o hostname completo: cliente1_db.localhost:3000
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Se tem subdomínio (cliente1_db.localhost)
    if (parts.length > 1) {
      const subdomain = parts[0]; // cliente1_db
      setTenant(subdomain);
    }

    // Verifica se o usuário está autenticado
    const storedUser = localStorage.getItem('user');
    setIsAuthenticated(!!storedUser);
  }, []);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        width: '100%', 
        padding: '40px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        borderRadius: '8px',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px' }}>Sistema Multitenant</h1>
        <h2 style={{ marginBottom: '30px', color: '#666' }}>Cliente: {tenant}</h2>
        
        <p style={{ marginBottom: '30px', fontSize: '18px' }}>
          Bem-vindo ao sistema de demonstração multitenant. Para acessar os posts e usuários, faça login com seu e-mail.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button style={{ 
                padding: '12px 24px', 
                backgroundColor: '#4caf50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Ir para o Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button style={{ 
                padding: '12px 24px', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Fazer Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}