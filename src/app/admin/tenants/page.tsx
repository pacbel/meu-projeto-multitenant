'use client';

import { useState, useEffect } from 'react';

export default function TenantsAdminPage() {
  const [tenants, setTenants] = useState<string[]>([]);
  const [newTenant, setNewTenant] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carregar a lista de tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tenants');
        
        if (!response.ok) {
          throw new Error('Falha ao carregar tenants');
        }
        
        const data = await response.json();
        setTenants(data.tenants || []);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar a lista de tenants');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Adicionar um novo tenant
  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTenant.trim()) {
      setError('Nome do tenant não pode estar vazio');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenant: newTenant }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar tenant');
      }

      // Atualiza a lista de tenants
      const updatedTenantsResponse = await fetch('/api/tenants');
      const updatedTenantsData = await updatedTenantsResponse.json();
      setTenants(updatedTenantsData.tenants || []);
      
      setNewTenant('');
      setSuccess(`Tenant ${newTenant} adicionado com sucesso`);
      setError(null);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar tenant';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remover um tenant
  const handleRemoveTenant = async (tenant: string) => {
    if (tenant === 'default') {
      setError('Não é permitido remover o tenant default');
      return;
    }

    if (!confirm(`Tem certeza que deseja remover o tenant ${tenant}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tenants/${tenant}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover tenant');
      }

      // Atualiza a lista de tenants
      setTenants(tenants.filter(t => t !== tenant));
      setSuccess(`Tenant ${tenant} removido com sucesso`);
      setError(null);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover tenant';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Tenants</h1>
      
      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Formulário para adicionar tenant */}
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Tenant</h2>
        <form onSubmit={handleAddTenant} className="flex gap-2">
          <input
            type="text"
            value={newTenant}
            onChange={(e) => setNewTenant(e.target.value)}
            placeholder="Nome do tenant"
            className="flex-1 border rounded px-3 py-2"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
      </div>
      
      {/* Lista de tenants */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Tenants Permitidos</h2>
        
        {loading && <p>Carregando...</p>}
        
        {!loading && tenants.length === 0 && (
          <p className="text-gray-500">Nenhum tenant encontrado.</p>
        )}
        
        {!loading && tenants.length > 0 && (
          <ul className="divide-y">
            {tenants.map((tenant) => (
              <li key={tenant} className="py-3 flex justify-between items-center">
                <span>{tenant}</span>
                <button
                  onClick={() => handleRemoveTenant(tenant)}
                  className={`px-3 py-1 rounded text-white ${
                    tenant === 'default'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                  disabled={tenant === 'default' || loading}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
