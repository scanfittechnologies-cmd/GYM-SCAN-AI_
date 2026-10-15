import React, { useState, useCallback } from 'react';
import { Machine } from '../../types';
import { ZoomIn, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { MachineSvgIllustration } from './MachineSvgIllustrations';
import { getMachinePhotos } from '../../data/machinePhotos';

interface MachineImageGalleryProps {
  machine: Machine;
}

export const MachineImageGallery: React.FC<MachineImageGalleryProps> = ({ machine }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Resolve photo URL: prefer DB record → then machinePhotos map → fallback to SVG
  const photos = getMachinePhotos(machine.id);
  const isVerifiedPhoto = machine.verificationStatus === 'Verified' || photos?.verified === true;
  const frontUrl = isVerifiedPhoto ? (machine.frontReferenceImage ?? photos?.front ?? null) : null;

  const showSvg = !frontUrl || imgFailed;

  const handleImgError = useCallback(() => {
    setImgFailed(true);
  }, []);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>

        {/* ── Main Image Display ── */}
        <div
          style={{
            position: 'relative',
            height: '270px',
            background: showSvg
              ? 'linear-gradient(180deg, #0E131F 0%, #060A12 100%)'
              : 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsFullscreen(true)}
          title="Click to view fullscreen"
        >
          {showSvg ? (
            <div style={{ width: '100%', height: '100%', padding: '1.25rem' }}>
              <MachineSvgIllustration type={machine.imageSvg} />
            </div>
          ) : (
            <img
              src={frontUrl!}
              alt={machine.name}
              onError={handleImgError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                padding: '8px',
              }}
            />
          )}

          {/* Gradient scrim for text legibility */}
          {!showSvg && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
              pointerEvents: 'none'
            }} />
          )}

          {/* Top-right: zoom hint */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '50%', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <ZoomIn size={14} />
          </div>

          {/* Bottom-left: image source badge */}
          <div style={{
            position: 'absolute', bottom: '10px', left: '10px',
            display: 'flex', gap: '5px', alignItems: 'center'
          }}>
            {showSvg ? (
              <span style={{
                background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
                padding: '2px 8px', borderRadius: '6px',
                fontSize: '0.63rem', color: '#64748B',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'var(--font-mono)',
              }}>
                SVG Illustration
              </span>
            ) : isVerifiedPhoto ? (
              <span style={{
                background: 'rgba(0,245,155,0.15)', backdropFilter: 'blur(8px)',
                padding: '2px 8px', borderRadius: '6px',
                fontSize: '0.63rem', color: '#00F59B', fontWeight: 700,
                border: '1px solid rgba(0,245,155,0.25)',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <ShieldCheck size={10} /> Verified Photo
              </span>
            ) : (
              <span style={{
                background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
                padding: '2px 8px', borderRadius: '6px',
                fontSize: '0.63rem', color: '#FFB800',
                border: '1px solid rgba(255,184,0,0.25)',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <AlertCircle size={10} /> Reference Photo
              </span>
            )}
          </div>
        </div>

        {/* ── SVG Fallback Notice ── */}
        {showSvg && !frontUrl && (
          <div style={{
            background: 'rgba(255,184,0,0.06)',
            border: '1px solid rgba(255,184,0,0.18)',
            borderRadius: '10px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.72rem',
            color: '#FFB800',
            display: 'flex', alignItems: 'flex-start', gap: '6px',
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Real equipment photos for this machine are pending. Showing design illustration for reference.
            </span>
          </div>
        )}
      </div>

      {/* ── Fullscreen Modal ── */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'fixed', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#F1F5F9', cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>

          {/* Main image */}
          <div
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {showSvg ? (
              <div style={{
                width: '500px', height: '400px',
                background: 'linear-gradient(180deg, #0E131F 0%, #060A12 100%)',
                padding: '2rem',
              }}>
                <MachineSvgIllustration type={machine.imageSvg} />
              </div>
            ) : (
              <img
                src={frontUrl!}
                alt={machine.name}
                style={{
                  maxWidth: '90vw', maxHeight: '85vh',
                  objectFit: 'contain', display: 'block',
                  borderRadius: '12px',
                }}
              />
            )}
          </div>

          {/* Machine name label */}
          <div style={{
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            padding: '6px 18px', borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.82rem', color: '#F1F5F9', fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {machine.name}
          </div>
        </div>
      )}
    </>
  );
};
