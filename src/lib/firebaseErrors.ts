const ADMIN_EMAILS = new Set([
  'admin@cimamaradlo.com',
  'admin@surveysync.com',
]);

export function isMissingFirestoreDatabase(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  const message = error instanceof Error ? error.message : String(error);

  return (
    code === 'not-found' ||
    /database .*not found/i.test(message) ||
    /database.*default.*not found/i.test(message)
  );
}

export function fallbackRoleForEmail(email?: string | null) {
  return email && ADMIN_EMAILS.has(email.toLowerCase()) ? 'admin' : 'client';
}
