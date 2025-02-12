// /app/api/auth/current/route.ts or pages/api/auth/current.ts
import authService from '@/app/services/authService';

export async function GET(req: Request) {
  const user = await authService.getCurrentUserFromRequest(req);
  console.log('Current user:', user);
  if (!user) {
    return new Response(null, { status: 401 }); // or JSON { error: 'Not logged in' }
  }
  return new Response(JSON.stringify(user), { status: 200 });
}
