import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
    console.log('MIDDLEWARE ATIVADO!');
    
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

    // Lista de subdomínios permitidos (validação de segurança)
    const allowedTenants: string[] = ['cliente1_db', 'cliente2_db', 'cliente3_db', 'default'];

    if (!allowedTenants.includes(subdomain)) {
        subdomain = 'default';
    }
    
    // Adiciona o tenant nos headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant', subdomain);
    
    console.log('--- MIDDLEWARE LOG ---');
    console.log('Hostname:', hostname);
    console.log('Subdomínio detectado:', subdomain);
    console.log('Tenant resolvido:', subdomain);
    console.log('Headers finais:', Array.from(requestHeaders.entries()));
    console.log('----------------------');
    
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
