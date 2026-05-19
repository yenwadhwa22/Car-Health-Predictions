/**
 * Turn Supabase Auth errors into short UI strings (prefix with ✗ in forms).
 */
export function formatAuthError(error) {
  if (!error) return '✗ Something went wrong. Try again.';
  const msg = (error.message || '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return '✗ Invalid email or password.';
  }
  if (msg.includes('email not confirmed')) {
    return '✗ Confirm your email before signing in.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return '✗ An account with this email already exists.';
  }
  if (msg.includes('password')) {
    return `✗ ${error.message}`;
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return '✗ Network error. Check your connection.';
  }

  return `✗ ${error.message || 'Request failed.'}`;
}
