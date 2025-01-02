import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function validateToken(request: Request): Promise<boolean> {
  const headersList = headers();
  const authorization = headersList.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return false;
  }

  const token = authorization.split(' ')[1];
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return !error && !!user;
  } catch {
    return false;
  }
} 