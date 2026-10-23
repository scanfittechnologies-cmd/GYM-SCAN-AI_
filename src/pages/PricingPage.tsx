import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  ArrowRight,
  Check,
  Lock,
  Sparkles,
  Shield,
  CreditCard,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useGym } from '../context/GymContext';

interface PricingPageProps {
  onNavigate: (tab: string) => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: 'free' | 'plus' | 'pro';
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyBillingNote: string;
  yearlyBillingNote: string;
  description: string;
  color: string;
  glowColor: string;
  bg: string;
  border: string;
  badge?: string;
  buttonMonthlyLabel: string;
  buttonYearlyLabel: string;
  buttonDisabled?: boolean;
  stripeMonthlyUrl?: string;
  stripeYearlyUrl?: string;
  features: PlanFeature[];
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { addToast } = useGym();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      addToast({
        type: 'success',
        title: 'Payment Successful!',
        message: 'Welcome to ScanFit Premium!',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast]);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free Starter',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      monthlyBillingNote: 'Free forever · No credit card required',
      yearlyBillingNote: 'Free forever · No credit card required',
      description: 'Essential equipment identification and core operating guides for beginners.',
      color: '#94A3B8',
      glowColor: 'rgba(148, 163, 184, 0.2)',
      bg: 'rgba(148, 163, 184, 0.05)',
      border: 'rgba(148, 163, 184, 0.2)',
      buttonMonthlyLabel: 'Get Started Free',
      buttonYearlyLabel: 'Get Started Free',
      features: [
        { text: '15 AI Machine Scans per month (pool)', included: true },
        { text: 'Basic Equipment Identification (Name & Target Muscle)', included: true },
        { text: 'Basic Step-by-Step Operating Guide', included: true },
        { text: 'Machine Library Catalog Browsing', included: true },
        { text: 'Soft-gated scan history and favoriting', included: true },
        { text: 'Full Machine Adjustments Guide (seat, pin, lever)', included: false },
        { text: 'Exercise Variations List (grip & handle options)', included: false },
        { text: 'AI Workout Routine Generator', included: false },
        { text: 'Form Injury Prevention & Priority AI Speed', included: false },
      ],
    },
    {
      id: 'plus',
      name: 'Plus Tier',
      monthlyPrice: '$1.99',
      yearlyPrice: '$19.99',
      monthlyBillingNote: '$1.99 billed monthly · Cancel anytime',
      yearlyBillingNote: '$19.99 billed annually (~$1.66/mo)',
      description: 'Unlock complete machine adjustments, grip variations, and accelerated XP boosts.',
      color: '#00F59B',
      glowColor: 'rgba(0, 245, 155, 0.25)',
      bg: 'linear-gradient(180deg, rgba(0, 245, 155, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
      border: 'rgba(0, 245, 155, 0.45)',
      badge: 'Most Popular',
      buttonMonthlyLabel: 'Upgrade to Plus ($1.99)',
      buttonYearlyLabel: 'Upgrade to Plus ($19.99/yr)',
      stripeMonthlyUrl: 'https://buy.stripe.com/test_14AeV74FveCJ6VSeyb9R600',
      features: [
        { text: '75 AI Machine Scans per month', included: true },
        { text: 'Unlocks Machine Adjustments Guide (seat height, pin alignment, lever range)', included: true },
        { text: 'Unlocks Exercise Variations List (grip options, handle options)', included: true },
        { text: 'Unlimited Save History & Bookmarks', included: true },
        { text: 'Interactive Tutorials & 1.5x XP Boost', included: true },
        { text: 'Basic Equipment Identification & Library Access', included: true },
        { text: 'Common Mistakes & Form Injury Prevention', included: false },
        { text: 'AI Workout Routine Generator', included: false },
        { text: 'Priority Processing Speed', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      monthlyPrice: '$4.99',
      yearlyPrice: '$39.99',
      monthlyBillingNote: '$4.99 billed monthly · Cancel anytime',
      yearlyBillingNote: '$39.99 billed annually (~$3.33/mo)',
      description: 'The complete AI fitness companion with unlimited scans, injury prevention, and routines.',
      color: '#A855F7',
      glowColor: 'rgba(168, 85, 247, 0.25)',
      bg: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
      border: 'rgba(168, 85, 247, 0.4)',
      badge: 'Best Value',
      buttonMonthlyLabel: 'Get Pro Access ($4.99)',
      buttonYearlyLabel: 'Get Pro Access ($39.99/yr)',
      stripeMonthlyUrl: 'https://buy.stripe.com/test_5kQaERc7X66ddkggGj9R601',
      features: [
        { text: 'Unlimited AI Machine Scans (Fair Use ~300/mo)', included: true },
        { text: 'Unlocks Common Mistakes & Form Injury Prevention', included: true },
        { text: 'Unlocks AI Workout Routine Generator (builds routines from scans)', included: true },
        { text: 'Priority Processing Speed with Sub-Second Inference', included: true },
        { text: '2.0x XP Boost & Exclusive Premium Badges', included: true },
        { text: 'Full Machine Adjustments & Variation Guides', included: true },
        { text: 'Unlimited Save History & Bookmarks', included: true },
        { text: 'Machine Library Catalog & Search', included: true },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1180px', margin: '0 auto', padding: '1rem 0 3rem' }}>

      {/* Page Header */}
      <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <span
          className="badge"
          style={{
            marginBottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(0, 245, 155, 0.1)',
            border: '1px solid rgba(0, 245, 155, 0.25)',
            color: '#00F59B',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          <CreditCard size={14} /> Transparent Gym Intelligence Pricing
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            color: '#F1F5F9',
            letterSpacing: '-0.03em',
            marginBottom: '0.85rem',
            lineHeight: 1.15,
          }}
        >
          Elevate Your Gym Experience
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
          Explore equipment with our generous Free Starter tier, or upgrade to Plus & Pro for comprehensive adjustments, injury prevention, and AI-built workout routines.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '5px',
              gap: '6px',
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                border: 'none',
                background: billingCycle === 'monthly' ? '#1E2638' : 'transparent',
                color: billingCycle === 'monthly' ? '#F8FAFC' : '#94A3B8',
                padding: '0.55rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                border: 'none',
                background: billingCycle === 'yearly' ? 'linear-gradient(135deg, rgba(0,245,155,0.22), rgba(0,210,255,0.22))' : 'transparent',
                color: billingCycle === 'yearly' ? '#00F59B' : '#94A3B8',
                padding: '0.55rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              Annual Billing
              <span
                style={{
                  background: 'rgba(0, 245, 155, 0.2)',
                  color: '#00F59B',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(0, 245, 155, 0.4)',
                }}
              >
                Save ~16%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        {plans.map((plan) => {
          const isPlus = plan.id === 'plus';
          const isPro = plan.id === 'pro';
          const isFree = plan.id === 'free';
          const currentPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const currentPeriod = isFree ? '/mo' : billingCycle === 'monthly' ? '/mo' : '/yr';
          const currentBillingNote = billingCycle === 'monthly' ? plan.monthlyBillingNote : plan.yearlyBillingNote;
          const currentBtnLabel = billingCycle === 'monthly' ? plan.buttonMonthlyLabel : plan.buttonYearlyLabel;

          return (
            <div
              key={plan.id}
              className="glass-card"
              style={{
                padding: '2rem 1.75rem',
                border: `1.5px solid ${plan.border}`,
                background: plan.bg,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem',
                position: 'relative',
                borderRadius: '24px',
                boxShadow: isPlus
                  ? '0 16px 40px -10px rgba(0, 245, 155, 0.18)'
                  : isPro
                  ? '0 16px 40px -10px rgba(168, 85, 247, 0.18)'
                  : 'none',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isPlus
                      ? 'linear-gradient(135deg, #00F59B, #00D2FF)'
                      : 'linear-gradient(135deg, #A855F7, #6366F1)',
                    color: '#05140F',
                    padding: '4px 16px',
                    borderRadius: '999px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: plan.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {plan.name}
                  </div>
                  {isPlus && <Sparkles size={18} color="#00F59B" />}
                  {isPro && <Zap size={18} color="#A855F7" fill="#A855F7" />}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: '#F1F5F9',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {currentPrice}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
                    {currentPeriod}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.85rem', minHeight: '1.2rem' }}>
                  {currentBillingNote}
                </div>

                <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5, margin: 0, minHeight: '2.6rem' }}>
                  {plan.description}
                </p>
              </div>

              {/* CTA Button */}
              <div>
                <button
                  id={`pricing-${plan.id}-btn`}
                  onClick={() => {
                    if (plan.stripeMonthlyUrl) {
                      window.open(plan.stripeMonthlyUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      onNavigate('scan');
                    }
                  }}
                  style={{
                    width: '100%',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '0.85rem 1.25rem',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isFree ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                    background: isPlus
                      ? 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)'
                      : isPro
                      ? 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: isPlus || isPro ? '#041018' : '#F1F5F9',
                  }}
                >
                  {(isPlus || isPro) && <Zap size={16} fill="currentColor" />}
                  {currentBtnLabel}
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Features List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.07)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.1rem' }}>
                  What's Included
                </div>
                {plan.features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      opacity: feature.included ? 1 : 0.32,
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: feature.included
                          ? isPlus
                            ? 'rgba(0, 245, 155, 0.15)'
                            : isPro
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(148, 163, 184, 0.15)'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: feature.included
                          ? `1px solid ${plan.color}50`
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1px',
                      }}
                    >
                      {feature.included ? (
                        <Check size={11} color={plan.color} strokeWidth={3} />
                      ) : (
                        <Lock size={10} color="#64748B" />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.84rem',
                        color: feature.included ? '#CBD5E1' : '#64748B',
                        lineHeight: 1.45,
                        textDecoration: feature.included ? 'none' : 'none',
                      }}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Highlights */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(17, 20, 28, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Sparkles size={18} color="#00F59B" />
          <h3 style={{ fontSize: '1.1rem', color: '#F1F5F9', fontWeight: 800 }}>
            Frequently Asked Questions
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={15} color="#00F59B" /> How do monthly scan allowances reset?
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Scan pools automatically refresh on the first day of each billing cycle (or calendar month for Free Starter tier).
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={15} color="#00F59B" /> Can I change or cancel my plan anytime?
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Yes. You can switch between Monthly and Annual billing or cancel anytime with immediate retention until cycle end.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={15} color="#00F59B" /> What is the AI Workout Routine Generator?
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Available in Pro, it compiles scanned gym equipment into optimized full-body, push-pull-legs, or split routines with exact sets & reps.
            </p>
          </div>
        </div>
      </div>

      {/* Security and Trust Banner */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={20} color="#00F59B" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0' }}>
              Bank-grade 256-bit encrypted checkout
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Powered by secure merchant processing. Instant activation on all devices.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', color: '#94A3B8', fontSize: '0.78rem' }}>
          <span>✓ Instant Access</span>
          <span>•</span>
          <span>✓ No Lock-in</span>
          <span>•</span>
          <span>✓ Fair Use Safeguard</span>
        </div>
      </div>

      {/* Back to App */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '1.5rem' }}>
        <button
          id="pricing-back-to-app-btn"
          onClick={() => onNavigate('home')}
          className="btn-secondary"
          style={{ fontSize: '0.9rem', padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Dumbbell size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
export default PricingPage;
