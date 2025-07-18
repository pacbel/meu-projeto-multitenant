import { headers } from 'next/headers'

export function getTenant() {
  const headersList = headers()
  return headersList.get('x-tenant') || 'default'
}