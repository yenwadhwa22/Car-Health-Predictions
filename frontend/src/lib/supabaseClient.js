/**
 * Minimal Supabase Auth client (REST only) — no @supabase/supabase-js dependency.
 * Covers: password sign-in/up, refresh, sign-out, password recovery, OAuth (PKCE).
 */

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_KEY = 'carmind.supabase.auth';
const PKCE_VERIFIER_KEY = 'carmind.supabase.pkce';

function authUrl(path) {
  return `${url}/auth/v1${path}`;
}

function headers(accessToken) {
  const h = {
    apikey: anonKey,
    'Content-Type': 'application/json',
  };
  // GoTrue expects the anon key only in `apikey` for password/signup/refresh.
  // Sending `Authorization: Bearer <anon_jwt>` on those calls can return 400.
  if (accessToken) {
    h.Authorization = `Bearer ${accessToken}`;
  }
  return h;
}

function parseHashParams() {
  const h = window.location.hash;
  if (!h || h === '#') return null;
  return new URLSearchParams(h.startsWith('#') ? h.slice(1) : h);
}

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return {};
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const json = atob(b64 + pad);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function normalizeUserFromToken(accessToken, existingUser) {
  if (existingUser && typeof existingUser === 'object') return existingUser;
  const p = decodeJwtPayload(accessToken);
  if (!p.sub) return null;
  return {
    id: p.sub,
    aud: p.aud,
    role: p.role,
    email: p.email,
    email_confirmed_at: p.email_confirmed_at,
    phone: p.phone,
    confirmed_at: p.confirmed_at,
    last_sign_in_at: p.last_sign_in_at,
    app_metadata: p.app_metadata || {},
    user_metadata: p.user_metadata || {},
    identities: p.identities,
    created_at: p.created_at,
    updated_at: p.updated_at,
    is_anonymous: p.is_anonymous,
  };
}

function parseQueryParams() {
  return new URLSearchParams(window.location.search);
}

/** @typedef {{ access_token: string, refresh_token: string, expires_in: number, expires_at: number, token_type: string, user: object }} Session */

function normalizeSession(json) {
  if (!json?.access_token) return null;
  const expiresIn = Number(json.expires_in) || 3600;
  const expiresAt =
    json.expires_at != null
      ? Number(json.expires_at)
      : Math.floor(Date.now() / 1000) + expiresIn;

  let user = json.user;
  if (typeof user === 'string') {
    try {
      user = JSON.parse(decodeURIComponent(user));
    } catch {
      try {
        user = JSON.parse(user);
      } catch {
        user = null;
      }
    }
  }
  user = normalizeUserFromToken(json.access_token, user);
  if (!user) return null;

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token || '',
    expires_in: expiresIn,
    expires_at: expiresAt,
    token_type: json.token_type || 'bearer',
    user,
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.access_token || !s?.user) return null;
    return s;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function emit(listeners, event, session) {
  listeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      /* ignore */
    }
  });
}

async function parseUrlAndPersist(listeners) {
  const hashParams = parseHashParams();
  const query = parseQueryParams();
  const code = query.get('code');

  if (hashParams?.get('access_token')) {
    let parsedUser = null;
    const rawUser = hashParams.get('user');
    if (rawUser) {
      try {
        parsedUser = JSON.parse(decodeURIComponent(rawUser));
      } catch {
        try {
          parsedUser = JSON.parse(rawUser);
        } catch {
          parsedUser = null;
        }
      }
    }
    const session = normalizeSession({
      access_token: hashParams.get('access_token'),
      refresh_token: hashParams.get('refresh_token') || '',
      expires_in: Number(hashParams.get('expires_in')) || 3600,
      expires_at: hashParams.get('expires_at')
        ? Number(hashParams.get('expires_at'))
        : undefined,
      token_type: hashParams.get('token_type') || 'bearer',
      user: parsedUser,
    });
    if (session?.access_token) {
      saveSession(session);
      const path = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', path);
      emit(listeners, 'SIGNED_IN', session);
    }
    return;
  }

  if (code && url && anonKey) {
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    if (!verifier) return;
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    const res = await fetch(authUrl('/token?grant_type=pkce'), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ auth_code: code, code, code_verifier: verifier }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      const session = normalizeSession(json);
      if (session) {
        saveSession(session);
        window.history.replaceState(null, '', window.location.pathname);
        emit(listeners, 'SIGNED_IN', session);
      }
    }
  }
}

async function refreshSession(refreshToken, listeners) {
  const res = await fetch(authUrl('/token?grant_type=refresh_token'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    saveSession(null);
    emit(listeners, 'SIGNED_OUT', null);
    return { error: { message: json.error_description || json.msg || json.message || 'Session expired' } };
  }
  const session = normalizeSession(json);
  if (!session) {
    saveSession(null);
    emit(listeners, 'SIGNED_OUT', null);
    return { error: { message: 'Invalid refresh response' } };
  }
  saveSession(session);
  emit(listeners, 'TOKEN_REFRESHED', session);
  return { error: null, session };
}

function createAuthApi() {
  /** @type {Set<(event: string, session: Session | null) => void>} */
  const listeners = new Set();

  const auth = {
    async getSession() {
      await parseUrlAndPersist(listeners);
      let session = loadSession();
      if (!session) return { data: { session: null }, error: null };

      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now + 120) {
        if (!session.refresh_token) {
          saveSession(null);
          return { data: { session: null }, error: null };
        }
        const { error } = await refreshSession(session.refresh_token, listeners);
        if (error) return { data: { session: null }, error: null };
        session = loadSession();
      }
      return { data: { session }, error: null };
    },

    async signInWithPassword({ email, password }) {
      const res = await fetch(authUrl('/token?grant_type=password'), {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          email,
          password,
          gotrue_meta_security: {},
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json.error_description ||
          json.msg ||
          json.message ||
          json.error ||
          (typeof json === 'string' ? json : null) ||
          `Sign in failed (${res.status})`;
        return {
          data: { user: null, session: null },
          error: { message: msg },
        };
      }
      const session = normalizeSession(json);
      if (!session) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid session response' },
        };
      }
      saveSession(session);
      emit(listeners, 'SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    },

    async signUp({ email, password, options = {} }) {
      const body = {
        email,
        password,
        data: options.data || {},
        gotrue_meta_security: {},
        code_challenge: null,
        code_challenge_method: null,
      };
      if (options.emailRedirectTo) {
        body.email_redirect_to = options.emailRedirectTo;
      }
      const res = await fetch(authUrl('/signup'), {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          data: { user: null, session: null },
          error: { message: json.error_description || json.msg || json.message || 'Sign up failed' },
        };
      }
      const session = json.access_token ? normalizeSession(json) : null;
      if (session) {
        saveSession(session);
        emit(listeners, 'SIGNED_IN', session);
      }
      return {
        data: { user: json.user || null, session },
        error: null,
      };
    },

    async signOut() {
      const session = loadSession();
      if (session?.access_token) {
        await fetch(authUrl('/logout'), {
          method: 'POST',
          headers: headers(session.access_token),
        }).catch(() => {});
      }
      saveSession(null);
      emit(listeners, 'SIGNED_OUT', null);
    },

    onAuthStateChange(callback) {
      listeners.add(callback);
      queueMicrotask(async () => {
        await parseUrlAndPersist(listeners);
        const { data } = await auth.getSession();
        callback('INITIAL_SESSION', data.session);
      });
      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(callback);
            },
          },
        },
      };
    },

    async resetPasswordForEmail(email, opts = {}) {
      const res = await fetch(authUrl('/recover'), {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          email,
          redirect_to: opts.redirectTo || `${window.location.origin}/login`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { error: { message: json.error_description || json.msg || json.message || 'Request failed' } };
      }
      return { error: null };
    },

    async signInWithOAuth({ provider, options = {} }) {
      const redirectTo = options.redirectTo || `${window.location.origin}/`;
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      const bytes = crypto.getRandomValues(new Uint8Array(64));
      let verifier = '';
      for (let i = 0; i < bytes.length; i += 1) {
        verifier += chars[bytes[i] % chars.length];
      }
      sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
      const encoder = new TextEncoder();
      const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
      const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const u = new URL(authUrl('/authorize'));
      u.searchParams.set('provider', provider);
      u.searchParams.set('redirect_to', redirectTo);
      u.searchParams.set('apikey', anonKey);
      u.searchParams.set('code_challenge', challenge);
      u.searchParams.set('code_challenge_method', 'S256');
      window.location.assign(u.toString());
      return { error: null };
    },
  };

  return auth;
}

/** @type {{ auth: ReturnType<typeof createAuthApi> } | null} */
let client = null;

if (url && anonKey) {
  client = { auth: createAuthApi() };
}

export function isSupabaseConfigured() {
  return client !== null;
}

export function getSupabase() {
  return client;
}
