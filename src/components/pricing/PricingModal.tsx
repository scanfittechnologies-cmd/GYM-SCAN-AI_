import React from 'react';
import { X, Sparkles, Check, Lock, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: string) => void;
  onNavigateToPricing?: () => void;
  highlightTier?: 'plus' | 'pro';
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onNavigateToPricing,
  highlightTier = 'plus',
}) => {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      description: 'Essential equipment scans and form guidance.',
      features: [
        { text: '15 AI Machine Scans / month', unlocked: true },
        { text: 'Basic Equipment Identification (Name & Target Muscle)', unlocked: true },
        { text: 'Basic Step-by-Step Operating Guide', unlocked: true },
        { text: 'Machine Library Catalog Browsing', unlocked: true },
        { text: 'Soft-gated scan history & favoriting', unlocked: true },
        { text: 'Machine Adjustments Guide', unlocked: false },
        { text: 'Exercise Variations & Grips', unlocked: false },
        { text: 'AI Workout Routine Generator', unlocked: false },
      ],
      cta: 'Current Plan',
      isPopular: false,
    },
    {
      id: 'plus',
      name: 'Plus Tier',
      price: billingCycle === 'monthly' ? '$1.99' : '$19.99',
      period: billingCycle === 'monthly' ? '/mo' : '/yr',
      description: 'For motivated lifters wanting complete adjustment and grip guides.',
      stripeUrl: 'https://buy.stripe.com/test_14AeV74FveCJ6VSeyb9R600',
      features: [
        { text: '75 AI Machine Scans / month', unlocked: true },
        { text: 'Full Machine Adjustments Guide (seat, pin, lever)', unlocked: true },
        { text: 'Exercise Variations List (grip & handle options)', unlocked: true },
        { text: 'Unlimited Save History & Bookmarks', unlocked: true },
        { text: 'Interactive Tutorials & 1.5x XP Boost', unlocked: true },
        { text: 'Priority Processing Speed', unlocked: false },
        { text: 'Form Injury Prevention', unlocked: false },
        { text: 'AI Workout Routine Generator', unlocked: false },
      ],
      cta: billingCycle === 'monthly' ? 'Upgrade to Plus ($1.99)' : 'Upgrade to Plus ($19.99)',
      isPopular: true,
      badge: 'Most Popular',
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      price: billingCycle === 'monthly' ? '$4.99' : '$39.99',
      period: billingCycle === 'monthly' ? '/mo' : '/yr',
      description: 'Ultimate power lifter experience with AI routine creation and form safety.',
      stripeUrl: 'https://buy.stripe.com/test_5kQaERc7X66ddkggGj9R601',
      features: [
        { text: 'Unlimited AI Machine Scans (Fair Use ~300/mo)', unlocked: true },
        { text: 'Common Mistakes & Form Injury Prevention', unlocked: true },
        { text: 'AI Workout Routine Generator (from scans)', unlocked: true },
        { text: 'Priority Processing Speed', unlocked: true },
        { text: '2.0x XP Boost & Premium Badges', unlocked: true },
        { text: 'Full Machine Adjustments & Variations', unlocked: true },
        { text: 'Unlimited Save History & Bookmarks', unlocked: true },
      ],
      cta: billingCycle === 'monthly' ? 'Get Pro Access ($4.99)' : 'Get Pro Access ($39.99)',
      isPopular: false,
      badge: 'Best Value',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#0e131f',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '2rem 1.5rem',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(0, 245, 155, 0.1)',
              border: '1px solid rgba(0, 245, 155, 0.25)',
              color: '#00f59b',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} /> ScanFit Premium Tiers
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 800,
              color: '#f8fafc',
              marginBottom: '0.5rem',
            }}
          >
            Supercharge Your Training
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto' }}>
            Choose the tier that fits your workout consistency. Unlock unlimited scans, adjustment guides, and AI routines.
          </p>

          {/* Billing Toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              padding: '4px',
              marginTop: '1.25rem',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                border: 'none',
                background: billingCycle === 'monthly' ? '#1e2638' : 'transparent',
                color: billingCycle === 'monthly' ? '#f8fafc' : '#94a3b8',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
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
                background: billingCycle === 'yearly' ? 'linear-gradient(135deg, rgba(0,245,155,0.2), rgba(0,210,255,0.2))' : 'transparent',
                color: billingCycle === 'yearly' ? '#00f59b' : '#94a3b8',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              Annual Billing
              <span
                style={{
                  background: 'rgba(0, 245, 155, 0.15)',
                  color: '#00f59b',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(0, 245, 155, 0.3)',
                }}
              >
                Save ~16%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            alignItems: 'stretch',
          }}
        >
          {tiers.map((tier) => {
            const isHighlighted = tier.id === highlightTier || tier.isPopular;
            const isFree = tier.id === 'free';
            const isPro = tier.id === 'pro';

            return (
              <div
                key={tier.id}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isHighlighted
                    ? 'linear-gradient(180deg, rgba(20, 28, 45, 0.95) 0%, rgba(13, 18, 30, 0.95) 100%)'
                    : 'rgba(17, 22, 34, 0.65)',
                  border: isHighlighted
                    ? '1.5px solid rgba(0, 245, 155, 0.45)'
                    : isPro
                    ? '1.5px solid rgba(168, 85, 247, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: isHighlighted ? '0 12px 30px -8px rgba(0, 245, 155, 0.15)' : 'none',
                }}
              >
                {/* Popular or Tier Badge */}
                {tier.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: tier.isPopular
                        ? 'linear-gradient(135deg, #00f59b, #00d2ff)'
                        : 'linear-gradient(135deg, #a855f7, #6366f1)',
                      color: '#071018',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: '9999px',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div>
                  {/* Title & Price */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#f1f5f9', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {tier.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', minHeight: '2.4em' }}>
                      {tier.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.75rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '2.1rem',
                          fontWeight: 900,
                          color: '#f8fafc',
                        }}
                      >
                        {tier.price}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {tier.period}
                      </span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Features
                    </div>
                    {tier.features.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.55rem',
                          opacity: feat.unlocked ? 1 : 0.35,
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                            background: feat.unlocked
                              ? isHighlighted
                                ? 'rgba(0, 245, 155, 0.15)'
                                : isPro
                                ? 'rgba(168, 85, 247, 0.15)'
                                : 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(255, 255, 255, 0.03)',
                            color: feat.unlocked
                              ? isHighlighted
                                ? '#00f59b'
                                : isPro
                                ? '#c084fc'
                                : '#94a3b8'
                              : '#475569',
                          }}
                        >
                          {feat.unlocked ? <Check size={11} strokeWidth={3} /> : <Lock size={10} />}
                        </div>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            color: feat.unlocked ? '#cbd5e1' : '#64748b',
                            lineHeight: 1.4,
                          }}
                        >
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <button
                  id={`modal-plan-${tier.id}-btn`}
                  onClick={() => {
                    if (onSelectPlan) {
                      onSelectPlan(tier.id);
                    } else if (tier.stripeUrl) {
                      window.open(tier.stripeUrl, '_blank', 'noopener,noreferrer');
                    } else if (onNavigateToPricing) {
                      onClose();
                      onNavigateToPricing();
                    } else {
                      onClose();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    border: isFree
                      ? '1px solid rgba(255, 255, 255, 0.12)'
                      : 'none',
                    background: isHighlighted
                      ? 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)'
                      : isPro
                      ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                      : 'rgba(255, 255, 255, 0.06)',
                    color: isHighlighted || isPro ? '#061019' : '#cbd5e1',
                  }}
                >
                  {(isHighlighted || isPro) && <Zap size={14} fill="currentColor" />}
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default PricingModal;
