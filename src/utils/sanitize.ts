/**
 * Input sanitization helpers for user authentication and profile data.
 * Protects against XSS (Cross-Site Scripting) and script injection.
 */

/**
 * Strips script tags, HTML tags, javascript: pseudo-protocols, and dangerous characters.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/javascript:/gi, '') // remove javascript: URI scheme
    .replace(/data:/gi, '') // remove data: URI scheme
    .replace(/vbscript:/gi, '') // remove vbscript: URI scheme
    .replace(/on\w+\s*=/gi, '') // remove inline event handlers like onload=, onclick=
    .replace(/[\0\x08\x09\x1a\n\r"'\\]/g, (char) => {
      // Escape or strip control chars and risky quote marks
      switch (char) {
        case '\0': return '';
        case '\x08': return '';
        case '\x09': return ' ';
        case '\x1a': return '';
        case '\n': return ' ';
        case '\r': return ' ';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '\\': return '';
        default: return char;
      }
    })
    .trim();
}

/**
 * Sanitizes email addresses: removes whitespace, lowercases, and strips illegal characters.
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email
    .trim()
    .toLowerCase()
    .replace(/[<>'"]/g, '');
}

/**
 * Sanitizes user display names: preserves human-readable characters while stripping HTML/tags.
 */
export function sanitizeDisplayName(name: string): string {
  if (typeof name !== 'string') return '';
  // Remove HTML and special control characters, keep letters, numbers, spaces, dots, hyphens
  const cleaned = name.replace(/<[^>]*>/g, '').trim();
  return cleaned.slice(0, 50); // Enforce max display name length
}
