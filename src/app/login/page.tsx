"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const [tenant, setTenant] = useState("default");

  // Detecta o tenant do hostname quando o componente montar
  useState(() => {
    if (typeof window !== 'undefined') {
      // Pega o hostname completo: cliente1_db.localhost:3000
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // Se tem subdomínio (cliente1_db.localhost)
      if (parts.length > 1) {
        const subdomain = parts[0]; // cliente1_db
        setTenant(subdomain);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, informe seu e-mail');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Aqui você pode adicionar uma validação com a API se necessário
      // Por enquanto, apenas fazemos o login diretamente
      login(email);
      
      // Redireciona para o dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro ao fazer login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: '20px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        borderRadius: '8px',
        backgroundColor: 'white'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login - {tenant}</h1>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ddd' 
              }}
              placeholder="Digite seu e-mail"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#1976d2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
