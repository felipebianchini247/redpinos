import { getSupabaseAdmin } from './supabase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

export async function isLockedOut(identifier: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('login_attempts')
    .select('bloqueado_hasta')
    .eq('identifier', identifier)
    .maybeSingle();
  if (!data?.bloqueado_hasta) return false;
  return new Date(data.bloqueado_hasta).getTime() > Date.now();
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('login_attempts')
    .select('intentos')
    .eq('identifier', identifier)
    .maybeSingle();
  const intentos = (data?.intentos ?? 0) + 1;
  const bloqueado_hasta =
    intentos >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
      : null;
  await supabase.from('login_attempts').upsert({
    identifier,
    intentos,
    bloqueado_hasta,
    ultimo_intento: new Date().toISOString(),
  });
}

export async function resetAttempts(identifier: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('login_attempts').delete().eq('identifier', identifier);
}
