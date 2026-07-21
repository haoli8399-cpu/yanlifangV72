export type QuoteViewerRole = 'client' | 'agent' | 'performer' | 'admin';

export interface QuoteViewer {
  sub: string;
  role: QuoteViewerRole;
  adminRole?: string | null;
}

export type QuoteRecord = Record<string, unknown> & {
  _client_id?: string;
};

const INTERNAL_PRICE_ADMIN_ROLES = new Set([
  'super_admin',
  'operator',
  'finance',
]);

const INTERNAL_PRICE_FIELDS = [
  'channel_price',
  'cost_price',
  'margin',
] as const;

const CUSTOMER_INTERNAL_FIELDS = [
  'rejection_reason',
  'operator_modified',
  'created_by',
] as const;

export function canListQuotes(viewer: QuoteViewer): boolean {
  return viewer.role !== 'performer';
}

export function canAccessQuote(
  viewer: QuoteViewer,
  demandOwnerId: string | undefined
): boolean {
  if (viewer.role === 'admin') return true;
  if (viewer.role === 'performer') return false;
  return demandOwnerId !== undefined && demandOwnerId === viewer.sub;
}

export function canViewInternalPrices(viewer: QuoteViewer): boolean {
  return (
    viewer.role === 'admin' &&
    typeof viewer.adminRole === 'string' &&
    INTERNAL_PRICE_ADMIN_ROLES.has(viewer.adminRole)
  );
}

export function projectQuoteForViewer(
  quote: QuoteRecord,
  viewer: QuoteViewer
): Record<string, unknown> {
  const projected = { ...quote };
  delete projected._client_id;

  if (!canViewInternalPrices(viewer)) {
    for (const field of INTERNAL_PRICE_FIELDS) delete projected[field];
  }

  if (viewer.role === 'client') {
    for (const field of CUSTOMER_INTERNAL_FIELDS) delete projected[field];
  }

  return projected;
}
