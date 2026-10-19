import React from 'react';
import {
  Dumbbell,
  ArrowRight,
  Check,
  Lock,
  Sparkles,
  Info,
  Shield,
  QrCode,
  BookOpen,
  History,
  Trophy,
  Building2,
  CreditCard,
} from 'lucide-react';

interface PricingPageProps {
  onNavigate: (tab: string) => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billingNote: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  badge?: string;
  buttonLabel: string;
  buttonDisabled: boolean;
  features: PlanFeature[];
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      billingNote: 'No credit card required',
      description: 'Get started exploring gym equipment with the core discovery tools.',
      color: '#94A3B8',
      bg: 'rgba(148, 163, 184, 0.06)',
      border: 'rgba(148, 163, 184, 0.2)',
      buttonLabel: 'Start for Free',
      buttonDisabled: false,
      features: [
        { text: 'QR machine scanning (sample badges)', included: true },
        { text: 'Photo-based machine identification (demo mode)', included: true },
        { text: 'Machine Library browsing', included: true },
        { text: 'Step-by-step machine tutorials', included: true },
        { text: 'Basic activity history', included: true },
        { text: 'XP and achievement badges', included: true },
        { text: 'Advanced activity analytics', included: false },
        { text: 'Gym-branded machine library', included: false },
        { text: 'Admin QR code management', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'Coming Soon',
      billingNote: 'Pricing not yet confirmed',
      description: 'Enhanced features for dedicated gym-goers who want deeper tracking and analysis.',
      color: '#00F59B',
      bg: 'rgba(0, 245, 155, 0.06)',
      border: 'rgba(0, 245, 155, 0.3)',
      badge: 'Coming Soon',
      buttonLabel: 'Notify Me When Available',
      buttonDisabled: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Live AI machine recognition (when available)', included: true },
        { text: 'Advanced activity analytics and trends', included: true },
        { text: 'Workout planning features', included: true },
        { text: 'Extended machine library access', included: true },
        { text: 'Offline mode support', included: true },
        { text: 'Gym-branded machine library', included: false },
        { text: 'Admin QR code management', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      id: 'gym',
      name: 'Gym Plan',
      price: 'Contact Us',
      billingNote: 'Custom pricing per location',
      description: 'For gym operators who want to deploy ScanFit across their facility with branded QR codes.',
      color: '#FFB800',
      bg: 'rgba(255, 184, 0, 0.06)',
      border: 'rgba(255, 184, 0, 0.25)',
      badge: 'For Gym Operators',
      buttonLabel: 'Contact for Pricing',
      buttonDisabled: true,
      features: [
        { text: 'Everything in Premium', included: true },
        { text: 'Custom gym-branded machine library', included: true },
        { text: 'QR code generation and management', included: true },
        { text: 'Admin dashboard for all machines', included: true },
        { text: 'Gym branding on tutorials', included: true },
        { text: 'Multi-location support', included: true },
        { text: 'Dedicated support and onboarding', included: true },
        { text: 'Custom machine data entry', included: true },
        { text: 'Usage analytics for gym operators', included: true },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
        <span className="badge badge-warning" style={{ marginBottom: '1rem' }}>
          <CreditCard size={12} /> Pricing Plans
        </span>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 900,
          fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F1F5F9',
          letterSpacing: '-0.03em', marginBottom: '0.75rem',
        }}>
          Plans for Every Gym Journey
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Start for free and explore gym equipment. Paid plans will be available when payment integration is complete.
        </p>
      </div>

      {/* Payment Not Yet Active Banner */}
      <div style={{
        background: 'rgba(255, 184, 0, 0.06)', border: '1px solid rgba(255, 184, 0, 0.25)',
        borderRadius: '16px', padding: '1.1rem 1.25rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
        maxWidth: '800px', margin: '0 auto', width: '100%',
      }}>
        <Info size={20} color="#FFB800" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.55 }}>
          <strong style={{ color: '#FFB800' }}>Payments Not Yet Connected:</strong>{' '}
          Premium and Gym Plan subscriptions are not currently available for purchase. This pricing page is a
          placeholder to illustrate planned feature tiers. No payment will be processed. The Free plan is fully
          functional in the current demo mode.
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-card"
            style={{
              padding: '1.75rem',
              border: `1px solid ${plan.border}`,
              background: plan.bg,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: plan.id === 'premium' ? 'linear-gradient(135deg, #00F59B, #00D2FF)' : 'rgba(255, 184, 0, 0.9)',
                color: plan.id === 'premium' ? '#05140F' : '#05140F',
                padding: '3px 14px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.04em', whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            {/* Plan header */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
                  {plan.price}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem' }}>
                {plan.billingNote}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                {plan.description}
              </p>
            </div>

            {/* CTA Button */}
            {plan.buttonDisabled ? (
              <button
                disabled
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px', padding: '0.75rem 1rem',
                  color: '#475569', cursor: 'not-allowed', fontSize: '0.87rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <Lock size={15} /> {plan.buttonLabel}
              </button>
            ) : (
              <button
                id={`pricing-${plan.id}-btn`}
                onClick={() => onNavigate('home')}
                className="btn-primary"
                style={{ fontSize: '0.87rem', padding: '0.75rem 1rem' }}
              >
                {plan.buttonLabel} <ArrowRight size={16} />
              </button>
            )}

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                Includes
              </div>
              {plan.features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', opacity: feature.included ? 1 : 0.35 }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                    background: feature.included ? `rgba(${plan.id === 'free' ? '148, 163, 184' : plan.id === 'premium' ? '0, 245, 155' : '255, 184, 0'}, 0.15)` : 'rgba(255,255,255,0.05)',
                    border: feature.included ? `1px solid ${plan.color}40` : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px',
                  }}>
                    {feature.included && <Check size={9} color={plan.color} strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: feature.included ? '#CBD5E1' : '#475569', lineHeight: 1.4 }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legal / Compliance Notice */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '16px', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Shield size={18} color="#64748B" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8' }}>
            Before Paid Plans Are Activated
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.65rem' }}>
          {[
            'Payment processing (Stripe or equivalent) must be configured',
            'Terms of service and refund policy must be drafted and reviewed',
            'Access control must be enforced server-side (not just frontend)',
            'Privacy policy must be updated to cover paid user data',
            'Age verification process must be defined',
            'Third-party API terms (AI vision, database) must be reviewed',
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.45 }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#475569', marginTop: '6px', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
          Do not activate paid subscriptions without completing the above items and consulting with a qualified legal professional if required.
        </p>
      </div>

      {/* Back to App */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
        <button
          id="pricing-back-to-app-btn"
          onClick={() => onNavigate('home')}
          className="btn-secondary"
          style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
        >
          <Dumbbell size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
