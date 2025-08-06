import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/lib/tenantService';

// Sem configuração de runtime específica para usar o padrão do Next.js

// Endpoint para listar todos os tenants permitidos
export async function GET() {
  try {
    const tenants = await TenantService.getAllowedTenants();
    return NextResponse.json({ tenants }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar tenants:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tenants' },
      { status: 500 }
    );
  }
}

// Endpoint para adicionar um novo tenant
export async function POST(request: NextRequest) {
  try {
    const { tenant } = await request.json();

    if (!tenant || typeof tenant !== 'string') {
      return NextResponse.json(
        { error: 'Nome do tenant é obrigatório' },
        { status: 400 }
      );
    }

    // Validação básica do nome do tenant (apenas letras, números e underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(tenant)) {
      return NextResponse.json(
        { error: 'Nome do tenant contém caracteres inválidos' },
        { status: 400 }
      );
    }

    const success = await TenantService.addTenant(tenant);

    if (success) {
      return NextResponse.json(
        { message: `Tenant ${tenant} adicionado com sucesso` },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: 'Erro ao adicionar tenant' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
