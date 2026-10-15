import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  EyeOff,
  Dumbbell
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    signIn, 
    signUp, 
    requestPasswordReset, 
    isLoading, 
    authError, 
    clearAuthError 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [isUnder18, setIsUnder18] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    clearAuthError();
    setResetSuccessMessage(null);
  }, [authModalMode, clearAuthError]);

  if (!isAuthModalOpen) return null;

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { label: 'None', percent: 0, color: '#64748B' };
    if (password.length < 6) return { label: 'Weak (min 6 chars)', percent: 30, color: '#FF4757' };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z\d]/.test(password);

    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { label: 'Strong Security', percent: 100, color: '#00F59B' };
    }
    if (password.length >= 6 && hasLetters && hasNumbers) {
      return { label: 'Good', percent: 70, color: '#FFB800' };
    }
    return { label: 'Moderate', percent: 50, color: '#38BDF8' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccessMessage(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName, experienceLevel, isUnder18);
      } else if (mode === 'reset') {
        const res = await requestPasswordReset(email);
        setResetSuccessMessage(res.message);
      }
    } catch {
      // Error handled in AuthContext
    }
  };

  // Quick Demo Account autofill
  const handleQuickLogin = (demoType: 'admin' | 'athlete') => {
    if (demoType === 'admin') {
      setEmail('admin@gymscan.ai');
      setPassword('admin123');
      signIn('admin@gymscan.ai', 'admin123');
    } else {
      setEmail('athlete@gymscan.ai');
      setPassword('athlete123');
      signIn('athlete@gymscan.ai', 'athlete123');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="glass-panel"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '1.75rem',
          borderRadius: '24px',
          border: '1px solid rgba(0, 245, 155, 0.3)',
          background: 'linear-gradient(135deg, rgba(16, 24, 38, 0.98) 0%, rgba(9, 13, 22, 0.99) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 155, 0.1)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#05140F',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 0 16px rgba(0, 245, 155, 0.4)'
          }}>
            <Dumbbell size={24} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '1.35rem', color: '#F1F5F9', margin: '0 0 4px 0', fontWeight: 800 }}>
            {mode === 'signin' && 'Welcome to Gym Scan AI'}
            {mode === 'signup' && 'Create Your Athlete Account'}
            {mode === 'reset' && 'Reset Your Password'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
            {mode === 'signin' && 'Sign in to access your saved equipment and scan progress.'}
            {mode === 'signup' && 'Join now to track machine discovery XP and earn badges.'}
            {mode === 'reset' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'reset' && (
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: '12px',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); clearAuthError(); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'signin' ? 'rgba(0, 245, 155, 0.18)' : 'transparent',
                color: mode === 'signin' ? '#00F59B' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); clearAuthError(); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'signup' ? 'rgba(0, 245, 155, 0.18)' : 'transparent',
                color: mode === 'signup' ? '#00F59B' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.15)',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            borderRadius: '12px',
            padding: '0.75rem 0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#FF6B81',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authError}</span>
          </div>
        )}

        {/* Reset Success Alert */}
        {resetSuccessMessage && (
          <div style={{
            background: 'rgba(0, 245, 155, 0.15)',
            border: '1px solid rgba(0, 245, 155, 0.4)',
            borderRadius: '12px',
            padding: '0.75rem 0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#00F59B',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Display Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-modern"
                  style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="athlete@gymscan.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Password (Sign In & Sign Up) */}
          {mode !== 'reset' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 600 }}>
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); clearAuthError(); }}
                    style={{ background: 'transparent', border: 'none', color: '#00F59B', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern"
                  style={{ width: '100%', paddingLeft: '36px', paddingRight: '36px', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Indicator on Sign Up */}
              {mode === 'signup' && password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: strength.color, marginBottom: '3px' }}>
                    <span>Password Strength:</span>
                    <strong>{strength.label}</strong>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${strength.percent}%`, height: '100%', background: strength.color, transition: 'all 0.3s' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fitness Experience Level (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                Gym Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="input-modern"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="Beginner">Beginner (New to gym equipment)</option>
                <option value="Intermediate">Intermediate (1-2 years training)</option>
                <option value="Advanced">Advanced (Experienced athlete)</option>
              </select>
            </div>
          )}

          {/* Under 18 Age & Privacy Disclosure (Sign Up only) */}
          {mode === 'signup' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '0.65rem 0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                id="under18Check"
                checked={isUnder18}
                onChange={(e) => setIsUnder18(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#00F59B' }}
              />
              <label htmlFor="under18Check" style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.35, cursor: 'pointer' }}>
                I agree to the Gym Scan AI Terms. If under 18, I confirm parental guidance for gym machine safety.
              </label>
            </div>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.4rem', justifyContent: 'center' }}
          >
            {isLoading ? 'Processing...' : (
              <>
                {mode === 'signin' && 'Sign In to Account'}
                {mode === 'signup' && 'Complete Registration'}
                {mode === 'reset' && 'Send Reset Link'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Back to sign in link for reset mode */}
        {mode === 'reset' && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={() => { setMode('signin'); clearAuthError(); }}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* One-Click Quick Demo Accounts (Prompt Testing Sandbox) */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center', marginBottom: '0.65rem', letterSpacing: '0.05em' }}>
            ⚡ Instant Demo Login
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('athlete')}
              style={{
                background: 'rgba(0, 245, 155, 0.08)',
                border: '1px solid rgba(0, 245, 155, 0.25)',
                color: '#00F59B',
                borderRadius: '10px',
                padding: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <User size={13} /> Demo Athlete
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              style={{
                background: 'rgba(255, 184, 0, 0.08)',
                border: '1px solid rgba(255, 184, 0, 0.25)',
                color: '#FFB800',
                borderRadius: '10px',
                padding: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <ShieldCheck size={13} /> Admin Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
