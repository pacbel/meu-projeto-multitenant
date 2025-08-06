import { NextRequest, NextResponse } from 'next/server'
import { TenantService } from './lib/tenantService'

// Configuração para o middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
    
    //Importa tipos específicos do Next.js
    //NextRequest: tipo do objeto request (com tipagem)
    //NextResponse: tipo do objeto response (com tipagem)
    //A função recebe um request tipado e retorna um NextResponse

    //Obtem o hostname da requisição
    const hostname = request.headers.get('host') || '';
    let subdomain = hostname.split('.')[0];

    // Para desenvolvimento local (localhost:3000)
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        // Extrair o subdomínio do formato cliente1_db.localhost:3000
        const parts = hostname.split('.');
        if (parts.length > 1) {
            // Se tiver subdomínio (cliente1_db.localhost)
            subdomain = parts[0];
        } else {
            // Se for apenas localhost sem subdomínio
            subdomain = 'default';
        }
    }

    // Busca a lista de tenants permitidos do Redis com cache local
    const allowedTenants = await TenantService.getAllowedTenants();

    // Verifica se o tenant está na lista de permitidos
    if (!allowedTenants.includes(subdomain)) {
        subdomain = 'default';
    }
    
    // Adiciona o tenant nos headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant', subdomain);
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Configuração já definida no topo do arquivo
