import { NextResponse } from 'next/server'

export function middleware(request) {
    const hostname = request.headers.get('host')
    let subdomain = hostname.split('.')[0]

    // Para desenvolvimento local (localhost:3000)
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        // Você pode usar um query parameter ou header para simular
        subdomain = request.nextUrl.searchParams.get('tenant') || 'default'
    }

    // Lista de subdomínios permitidos (validação de segurança)
    const allowedTenants = ['cliente1', 'cliente2', 'cliente3', 'default']

    if (!allowedTenants.includes(subdomain)) {
        subdomain = 'default'
    }

    // Adiciona o tenant nos headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant', subdomain)

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}