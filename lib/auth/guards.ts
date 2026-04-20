// Auth stubbed — Clerk removed. Single shared space until proper auth is wired.
export async function requireUser(): Promise<string> {
  return 'guest'
}

export function requireCronSecret(req: Request): void {
  const secret = req.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw new Response('Forbidden', { status: 403 })
  }
}
