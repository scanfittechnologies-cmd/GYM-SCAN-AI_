/**
 * Synthetic high-tech chime and haptic feedback for scanner confirmations.
 * Uses Web Audio API oscillator synthesis so it works on any browser without external audio assets.
 */
export function playSuccessFeedback() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Two-tone rising chime (high-tech confirmation sound)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5 (880Hz)
      osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12); // E6 (1318.5Hz)

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.25); // A6 (1760Hz)

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    }
  } catch (err) {
    // Audio context may be restricted by autoplay policy until user interaction
  }

  // Haptic feedback (supported on mobile Android and iOS Safari)
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate([60, 40, 80]);
    }
  } catch (err) {
    // Vibration not supported or blocked
  }
}

/**
 * Robust extraction of equipment codes from QR content:
 * Handles raw codes (GYM-CHEST-01), URLs (?code=GYM-01 or /machine/GYM-01), or JSON.
 */
export function extractGymMachineCode(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // 1. Direct regex match for GYM- prefix pattern
  const gymMatch = trimmed.match(/\b(GYM-[A-Za-z0-9_-]+)\b/i);
  if (gymMatch) {
    return gymMatch[1].toUpperCase();
  }

  // 2. URL parsing for query parameters or path segments
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const paramCode = url.searchParams.get('code') || 
                        url.searchParams.get('id') || 
                        url.searchParams.get('machine') || 
                        url.searchParams.get('qr');
      if (paramCode) return paramCode.toUpperCase();

      const pathSegments = url.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.toUpperCase().startsWith('GYM-')) {
        return lastSegment.toUpperCase();
      }
    } catch {
      // Fall through if URL parsing fails
    }
  }

  // 3. Fallback to clean trimmed string
  return trimmed.toUpperCase();
}
