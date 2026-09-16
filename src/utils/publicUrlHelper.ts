/**
 * Helper utility to construct public URLs for sharing forms and features externally.
 * 
 * In Google AI Studio:
 * - `ais-dev-*.run.app` is the private development URL (only the project owner can access; others get 403 Forbidden).
 * - `ais-pre-*.run.app` is the shared public preview URL accessible to anyone without login.
 */

export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  let origin = window.location.origin;
  
  // Convert internal development preview domain to public shared preview domain
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  
  return origin;
}

export function getPublicIndicatorsFormUrl(unitId?: string): string {
  const base = getPublicBaseUrl();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const paramUnit = unitId ? `&unitId=${encodeURIComponent(unitId)}` : '';
  return `${base}${cleanPath || ''}/?view=coleta-indicadores${paramUnit}`;
}
