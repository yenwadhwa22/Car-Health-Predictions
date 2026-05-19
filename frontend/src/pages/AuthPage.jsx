import React, { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { AppLink, useNavigation } from '../context/NavigationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { formatAuthError } from '../lib/supabaseAuthErrors.js';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import useAuthCarScene from '../hooks/useAuthCarScene';
import styles from './AuthPage.module.css';

/** Google “G” — many `lucide-react` versions (including older lockfiles) omit `Chrome`. */
function GoogleMark({ className, size = 18 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/** GitHub mark — `Github` / `GitHub` export names differ across `lucide-react` versions. */
function GitHubMark({ className, size = 18 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 2.5-.96-.23-1.96-.35-3-.35s-2.04.12-3 .35c-2-2.5-3-2.5-3-2.5-.28 1.15-.28 2.35 0 3.5a5.36 5.36 0 0 0-1 3.5c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function validateLogin(values) {
  const e = {};
  if (!values.email.trim()) e.email = '✗ Email is required';
  else if (!emailOk(values.email)) e.email = '✗ Enter a valid email address';
  if (!values.password) e.password = '✗ Password is required';
  else if (values.password.length < 8) e.password = '✗ Password must be at least 8 characters';
  return e;
}

function validateSignup(values) {
  const er = {};
  if (!values.fullName.trim()) er.fullName = '✗ Full name is required';
  else if (values.fullName.trim().length < 2) er.fullName = '✗ Name must be at least 2 characters';
  if (!values.email.trim()) er.email = '✗ Email is required';
  else if (!emailOk(values.email)) er.email = '✗ Enter a valid email address';
  if (!values.password) er.password = '✗ Password is required';
  else if (values.password.length < 8) er.password = '✗ Password must be at least 8 characters';
  if (!values.confirmPassword) er.confirmPassword = '✗ Confirm your password';
  else if (values.confirmPassword !== values.password) er.confirmPassword = '✗ Passwords do not match';
  if (!values.terms) er.terms = '✗ You must accept the terms to continue';
  return er;
}

const fieldMotion = {
  initial: { opacity: 0, y: 28 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: (typeof i === 'number' ? i : 0) * 0.06,
      type: 'spring',
      stiffness: 420,
      damping: 32,
    },
  }),
  exit: (i) => ({
    opacity: 0,
    y: -18,
    transition: {
      delay: (typeof i === 'number' ? i : 0) * 0.03,
      duration: 0.22,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

function AuthPage() {
  const canvasRef = useRef(null);
  const tabBarRef = useRef(null);
  const loginTabRef = useRef(null);
  const signupTabRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useAuthCarScene(canvasRef);

  const [mode, setMode] = useState('login');
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const [loginValues, setLoginValues] = useState({ email: '', password: '' });
  const [signupValues, setSignupValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focus, setFocus] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { navigate } = useNavigation();
  const { user, loading: authLoading } = useAuth();

  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [shake, setShake] = useState(0);

  const updateUnderline = useCallback(() => {
    const bar = tabBarRef.current;
    const tab = mode === 'login' ? loginTabRef.current : signupTabRef.current;
    if (!bar || !tab) return;
    const br = bar.getBoundingClientRect();
    const tr = tab.getBoundingClientRect();
    setUnderline({ left: tr.left - br.left, width: tr.width });
  }, [mode]);

  useLayoutEffect(() => {
    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [updateUnderline]);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  const runShake = () => {
    setShake((k) => k + 1);
  };

  const handleLoginSubmit = async (ev) => {
    ev.preventDefault();
    setAuthError('');
    setAuthInfo('');
    const e = validateLogin(loginValues);
    setErrors(e);
    if (Object.keys(e).length) {
      runShake();
      return;
    }
    if (!configured) {
      setAuthError('✗ Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env');
      runShake();
      return;
    }
    const sb = getSupabase();
    setIsSubmitting(true);
    const { error } = await sb.auth.signInWithPassword({
      email: loginValues.email.trim(),
      password: loginValues.password,
    });
    setIsSubmitting(false);
    if (error) {
      setAuthError(formatAuthError(error));
      runShake();
      return;
    }
    navigate('/');
  };

  const handleSignupSubmit = async (ev) => {
    ev.preventDefault();
    setAuthError('');
    setAuthInfo('');
    const e = validateSignup(signupValues);
    setErrors(e);
    if (Object.keys(e).length) {
      runShake();
      return;
    }
    if (!configured) {
      setAuthError('✗ Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env');
      runShake();
      return;
    }
    const sb = getSupabase();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    const { data, error } = await sb.auth.signUp({
      email: signupValues.email.trim(),
      password: signupValues.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: signupValues.fullName.trim() },
      },
    });
    setIsSubmitting(false);
    if (error) {
      setAuthError(formatAuthError(error));
      runShake();
      return;
    }
    if (data.session) {
      navigate('/');
      return;
    }
    setSubmitSuccess(true);
    setAuthInfo('✓ We sent a confirmation link to your email.');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');
    const email = loginValues.email.trim();
    if (!emailOk(email)) {
      setAuthError('✗ Enter a valid email in the Email field first.');
      runShake();
      return;
    }
    if (!configured) {
      setAuthError('✗ Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env');
      return;
    }
    const sb = getSupabase();
    setIsSubmitting(true);
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setIsSubmitting(false);
    if (error) {
      setAuthError(formatAuthError(error));
      runShake();
      return;
    }
    setAuthInfo('✓ Password reset email sent. Check your inbox.');
  };

  const handleOAuth = async (provider) => {
    setAuthError('');
    setAuthInfo('');
    if (!configured) {
      setAuthError('✗ Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env');
      return;
    }
    const sb = getSupabase();
    setIsSubmitting(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    setIsSubmitting(false);
    if (error) {
      setAuthError(formatAuthError(error));
    }
  };

  const showFieldSuccess = (field, valueCheck) =>
    touched[field] && !errors[field] && valueCheck;

  const leftEnter = reduceMotion
    ? { opacity: 1, x: 0 }
    : { opacity: 0, x: -72 };
  const leftAnimate = { opacity: 1, x: 0 };
  const rightEnter = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 48 };
  const rightAnimate = { opacity: 1, y: 0 };

  return (
    <div className={styles.page}>
      <motion.aside
        className={styles.leftPanel}
        initial={leftEnter}
        animate={leftAnimate}
        transition={{ type: 'spring', stiffness: 260, damping: 28, duration: 0.8 }}
      >
        <div className={styles.cornerBracket + ' ' + styles.cornerBracketTL} aria-hidden />
        <div className={styles.cornerBracket + ' ' + styles.cornerBracketTR} aria-hidden />
        <div className={styles.cornerBracket + ' ' + styles.cornerBracketBL} aria-hidden />
        <div className={styles.cornerBracket + ' ' + styles.cornerBracketBR} aria-hidden />

        <div className={styles.scanStatus}>
          <span className={styles.pulseDot} aria-hidden />
          <span>SCANNING ACTIVE</span>
        </div>

        <div className={styles.canvasWrap}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>

        <div className={styles.leftFade} aria-hidden />

        <div className={styles.panelLabel}>DIAGNOSTIC INTERFACE — AUTH MODULE</div>
      </motion.aside>

      <motion.section
        className={styles.rightPanel}
        initial={rightEnter}
        animate={rightAnimate}
        transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.08 }}
      >
        <AppLink to="/" className={styles.logo}>
          <span className={styles.logoDrive}>DriveSense</span>
          <span className={styles.logoAi}>AI</span>
        </AppLink>

        <div className={styles.formCard}>
          <p className={styles.eyebrow}>NEURAL ACCESS PORTAL</p>
          <h1 className={styles.title}>
            {mode === 'login' ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
          </h1>

          <div className={styles.tabBar} ref={tabBarRef}>
            <button
              type="button"
              ref={loginTabRef}
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('login');
                setErrors({});
                setTouched({});
                setSubmitSuccess(false);
                setAuthError('');
                setAuthInfo('');
              }}
            >
              LOGIN
            </button>
            <button
              type="button"
              ref={signupTabRef}
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('signup');
                setErrors({});
                setTouched({});
                setSubmitSuccess(false);
                setAuthError('');
                setAuthInfo('');
              }}
            >
              SIGN UP
            </button>
            <motion.div
              className={styles.tabIndicator}
              layout={false}
              initial={false}
              animate={{ left: underline.left, width: underline.width }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          </div>

          {!configured && (
            <p className={styles.configWarning}>
              Supabase env missing: copy frontend/.env.example to .env and set VITE_SUPABASE_URL and
              VITE_SUPABASE_ANON_KEY.
            </p>
          )}

          {authError ? (
            <p className={`${styles.authNotice} ${styles.authNoticeError}`} role="alert">
              {authError}
            </p>
          ) : null}
          {authInfo ? (
            <p className={`${styles.authNotice} ${styles.authNoticeInfo}`}>{authInfo}</p>
          ) : null}

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                className={styles.form}
                onSubmit={handleLoginSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  key={`shake-login-${shake}`}
                  animate={
                    shake
                      ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.45 }}
                >
                  <motion.div
                    className={styles.fieldGroup}
                    custom={0}
                    variants={fieldMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className={styles.label} htmlFor="login-email">
                      EMAIL
                    </label>
                    <motion.input
                      id="login-email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''} ${
                        showFieldSuccess('email', emailOk(loginValues.email)) ? styles.inputSuccess : ''
                      }`}
                      type="email"
                      autoComplete="email"
                      value={loginValues.email}
                      onChange={(e) =>
                        setLoginValues((v) => ({ ...v, email: e.target.value }))
                      }
                      onFocus={() => setFocus((f) => ({ ...f, le: true }))}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, email: true }));
                        setFocus((f) => ({ ...f, le: false }));
                      }}
                      animate={{
                        boxShadow: focus.le
                          ? '0 0 0 2px rgba(0, 245, 255, 0.2)'
                          : '0 0 0 0px rgba(0, 245, 255, 0)',
                        borderColor: focus.le
                          ? 'rgba(0, 245, 255, 0.45)'
                          : 'rgba(0, 245, 255, 0.15)',
                      }}
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    />
                    {errors.email && (
                      <p className={styles.fieldError}>{errors.email}</p>
                    )}
                    {showFieldSuccess('email', emailOk(loginValues.email)) && (
                      <p className={styles.fieldSuccess}>✓ Valid email</p>
                    )}
                  </motion.div>

                  <motion.div
                    className={styles.fieldGroup}
                    custom={1}
                    variants={fieldMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className={styles.label} htmlFor="login-password">
                      PASSWORD
                    </label>
                    <div className={styles.inputWrap}>
                      <motion.input
                        id="login-password"
                        className={`${styles.input} ${errors.password ? styles.inputError : ''} ${
                          showFieldSuccess('password', loginValues.password.length >= 8)
                            ? styles.inputSuccess
                            : ''
                        }`}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginValues.password}
                        onChange={(e) =>
                          setLoginValues((v) => ({ ...v, password: e.target.value }))
                        }
                        onFocus={() => setFocus((f) => ({ ...f, lp: true }))}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, password: true }));
                          setFocus((f) => ({ ...f, lp: false }));
                        }}
                        animate={{
                          boxShadow: focus.lp
                            ? '0 0 0 2px rgba(0, 245, 255, 0.2)'
                            : '0 0 0 0px rgba(0, 245, 255, 0)',
                          borderColor: focus.lp
                            ? 'rgba(0, 245, 255, 0.45)'
                            : 'rgba(0, 245, 255, 0.15)',
                        }}
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      />
                      <button
                        type="button"
                        className={styles.toggleVisibility}
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className={styles.fieldError}>{errors.password}</p>
                    )}
                    {showFieldSuccess('password', loginValues.password.length >= 8) && (
                      <p className={styles.fieldSuccess}>✓ Strong length</p>
                    )}
                  </motion.div>

                  <div className={styles.rowBetween}>
                    <div
                      className={styles.rememberRow}
                      onClick={() => setRemember((r) => !r)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setRemember((r) => !r);
                        }
                      }}
                      role="switch"
                      aria-checked={remember}
                      tabIndex={0}
                    >
                      <div className={`${styles.toggle} ${remember ? styles.toggleOn : ''}`}>
                        <span className={styles.toggleKnob} />
                      </div>
                      <span className={styles.rememberLabel}>Remember me</span>
                    </div>
                    <button
                      type="button"
                      className={`${styles.forgotLink} ${styles.forgotButton}`}
                      onClick={handleForgotPassword}
                      disabled={isSubmitting}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.button
                      key="submit"
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmitting || !configured}
                      whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                      whileHover={
                        !isSubmitting
                          ? { boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)' }
                          : {}
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <span className={styles.spinner} aria-hidden />
                          AUTHENTICATING...
                        </>
                      ) : (
                        'ENTER SYSTEM'
                      )}
                    </motion.button>
                  </AnimatePresence>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                className={styles.form}
                onSubmit={handleSignupSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  key={`shake-signup-${shake}`}
                  animate={
                    shake
                      ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.45 }}
                >
                  <motion.div
                    className={styles.fieldGroup}
                    custom={0}
                    variants={fieldMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className={styles.label} htmlFor="su-name">
                      FULL NAME
                    </label>
                    <motion.input
                      id="su-name"
                      className={`${styles.input} ${errors.fullName ? styles.inputError : ''} ${
                        showFieldSuccess('fullName', signupValues.fullName.trim().length >= 2)
                          ? styles.inputSuccess
                          : ''
                      }`}
                      type="text"
                      autoComplete="name"
                      value={signupValues.fullName}
                      onChange={(e) =>
                        setSignupValues((v) => ({ ...v, fullName: e.target.value }))
                      }
                      onFocus={() => setFocus((f) => ({ ...f, n: true }))}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, fullName: true }));
                        setFocus((f) => ({ ...f, n: false }));
                      }}
                      animate={{
                        boxShadow: focus.n
                          ? '0 0 0 2px rgba(0, 245, 255, 0.2)'
                          : '0 0 0 0px rgba(0, 245, 255, 0)',
                        borderColor: focus.n
                          ? 'rgba(0, 245, 255, 0.45)'
                          : 'rgba(0, 245, 255, 0.15)',
                      }}
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    />
                    {errors.fullName && (
                      <p className={styles.fieldError}>{errors.fullName}</p>
                    )}
                    {showFieldSuccess('fullName', signupValues.fullName.trim().length >= 2) && (
                      <p className={styles.fieldSuccess}>✓ Looks good</p>
                    )}
                  </motion.div>

                  <motion.div
                    className={styles.fieldGroup}
                    custom={1}
                    variants={fieldMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className={styles.label} htmlFor="su-email">
                      EMAIL
                    </label>
                    <motion.input
                      id="su-email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''} ${
                        showFieldSuccess('email', emailOk(signupValues.email))
                          ? styles.inputSuccess
                          : ''
                      }`}
                      type="email"
                      autoComplete="email"
                      value={signupValues.email}
                      onChange={(e) =>
                        setSignupValues((v) => ({ ...v, email: e.target.value }))
                      }
                      onFocus={() => setFocus((f) => ({ ...f, se: true }))}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, email: true }));
                        setFocus((f) => ({ ...f, se: false }));
                      }}
                      animate={{
                        boxShadow: focus.se
                          ? '0 0 0 2px rgba(0, 245, 255, 0.2)'
                          : '0 0 0 0px rgba(0, 245, 255, 0)',
                        borderColor: focus.se
                          ? 'rgba(0, 245, 255, 0.45)'
                          : 'rgba(0, 245, 255, 0.15)',
                      }}
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    />
                    {errors.email && (
                      <p className={styles.fieldError}>{errors.email}</p>
                    )}
                    {showFieldSuccess('email', emailOk(signupValues.email)) && (
                      <p className={styles.fieldSuccess}>✓ Valid email</p>
                    )}
                  </motion.div>

                  <motion.div
                    className={styles.fieldGroup}
                    custom={2}
                    variants={fieldMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className={styles.label} htmlFor="su-password">
                      PASSWORD
                    </label>
                    <div className={styles.inputWrap}>
                      <motion.input
                        id="su-password"
                        className={`${styles.input} ${errors.password ? styles.inputError : ''} ${
                          showFieldSuccess('password', signupValues.password.length >= 8)
                            ? styles.inputSuccess
                            : ''
                        }`}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={signupValues.password}
                        onChange={(e) =>
                          setSignupValues((v) => ({ ...v, password: e.target.value }))
                        }
                        onFocus={() => setFocus((f) => ({ ...f, sp: true }))}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, password: true }));
                          setFocus((f) => ({ ...f, sp: false }));
                        }}
                        animate={{
                          boxShadow: focus.sp
                            ? '0 0 0 2px rgba(0, 245, 255, 0.2)'
                            : '0 0 0 0px rgba(0, 245, 255, 0)',
                          borderColor: focus.sp
                            ? 'rgba(0, 245, 255, 0.45)'
                            : 'rgba(0, 245, 255, 0.15)',
                        }}
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      />
                      <button
                        type="button"
                        className={styles.toggleVisibility}
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className={styles.fieldError}>{errors.password}</p>
                    )}
                    {showFieldSuccess('password', signupValues.password.length >= 8) && (
                      <p className={styles.fieldSuccess}>✓ Strong length</p>
                    )}
                  </motion.div>

                  <motion.div
                    className={styles.fieldGroup}
                    custom={3}
                    variants={fieldMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className={styles.label} htmlFor="su-confirm">
                      CONFIRM PASSWORD
                    </label>
                    <div className={styles.inputWrap}>
                      <motion.input
                        id="su-confirm"
                        className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''} ${
                          showFieldSuccess(
                            'confirmPassword',
                            signupValues.confirmPassword.length > 0 &&
                              signupValues.confirmPassword === signupValues.password
                          )
                            ? styles.inputSuccess
                            : ''
                        }`}
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={signupValues.confirmPassword}
                        onChange={(e) =>
                          setSignupValues((v) => ({
                            ...v,
                            confirmPassword: e.target.value,
                          }))
                        }
                        onFocus={() => setFocus((f) => ({ ...f, sc: true }))}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, confirmPassword: true }));
                          setFocus((f) => ({ ...f, sc: false }));
                        }}
                        animate={{
                          boxShadow: focus.sc
                            ? '0 0 0 2px rgba(0, 245, 255, 0.2)'
                            : '0 0 0 0px rgba(0, 245, 255, 0)',
                          borderColor: focus.sc
                            ? 'rgba(0, 245, 255, 0.45)'
                            : 'rgba(0, 245, 255, 0.15)',
                        }}
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      />
                      <button
                        type="button"
                        className={styles.toggleVisibility}
                        onClick={() => setShowConfirm((s) => !s)}
                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className={styles.fieldError}>{errors.confirmPassword}</p>
                    )}
                    {showFieldSuccess(
                      'confirmPassword',
                      signupValues.confirmPassword.length > 0 &&
                        signupValues.confirmPassword === signupValues.password
                    ) && <p className={styles.fieldSuccess}>✓ Passwords match</p>}
                  </motion.div>

                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={signupValues.terms}
                      onChange={(e) =>
                        setSignupValues((v) => ({ ...v, terms: e.target.checked }))
                      }
                    />
                    <span className={styles.checkboxText}>
                      I accept the{' '}
                      <a href="#terms" onClick={(e) => e.preventDefault()}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#privacy" onClick={(e) => e.preventDefault()}>
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className={styles.fieldError} style={{ marginTop: '-0.75rem' }}>
                      {errors.terms}
                    </p>
                  )}

                  <AnimatePresence mode="wait">
                    {submitSuccess ? (
                      <motion.div
                        key="success-su"
                        className={styles.successBtn}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                      >
                        <span className={styles.successIcon}>✓</span>
                        CHECK YOUR EMAIL
                      </motion.div>
                    ) : (
                      <motion.button
                        key="submit-su"
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !configured}
                        whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                        whileHover={
                          !isSubmitting
                            ? { boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)' }
                            : {}
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <span className={styles.spinner} aria-hidden />
                            AUTHENTICATING...
                          </>
                        ) : (
                          'REGISTER'
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OR CONTINUE WITH</span>
            <span className={styles.dividerLine} />
          </div>

          <div className={styles.socialRow}>
            <button
              type="button"
              className={styles.socialBtn}
              disabled={isSubmitting || !configured}
              onClick={() => handleOAuth('google')}
            >
              <GoogleMark className={styles.socialIcon} size={18} />
              Google
            </button>
            <button
              type="button"
              className={styles.socialBtn}
              disabled={isSubmitting || !configured}
              onClick={() => handleOAuth('github')}
            >
              <GitHubMark className={styles.socialIcon} size={18} />
              GitHub
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default AuthPage;
