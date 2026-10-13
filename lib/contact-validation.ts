export const contactTypes = ['General Inquiry', 'Order Support', 'Product Question', 'Shipping Question', 'Collaboration', 'Wholesale', 'Press / Media'] as const;
export class ContactError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function validateContact(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ContactError('Invalid message.');
  const data = value as Record<string, unknown>;
  const text = (field: string, max: number) => {
    const value = data[field];
    if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ContactError(`Check your ${field}.`);
    return value.trim();
  };
  if (data.website !== '' && data.website !== undefined) throw new ContactError('Could not verify your message.');
  const name = text('name', 200), email = text('email', 254).toLowerCase(), type = text('type', 100), message = text('message', 10000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ContactError('Enter a valid email address.');
  if (!(contactTypes as readonly string[]).includes(type)) throw new ContactError('Select an inquiry type.');
  const captchaToken = text('captchaToken', 4096);
  return { name, email, type, message, captchaToken };
}
export async function verifyContactCaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new ContactError('The robot check is unavailable. Please use one of the contact email addresses.', 503);
  let response: Response;
  try {
    response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }), signal: AbortSignal.timeout(8000),
    });
  } catch { throw new ContactError('The robot check could not connect. Please try again.', 503); }
  if (!response.ok) throw new ContactError('The robot check is unavailable. Please try again.', 503);
  let result: { success?: boolean; hostname?: string; 'error-codes'?: string[] };
  try { result = await response.json(); }
  catch { throw new ContactError('The robot check is unavailable. Please try again.', 503); }
  if (!result || typeof result !== 'object') throw new ContactError('The robot check is unavailable. Please try again.', 503);
  if (result['error-codes']?.some(code => ['missing-input-secret', 'invalid-input-secret'].includes(code))) throw new ContactError('The robot check is unavailable. Please use one of the contact email addresses.', 503);
  const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || 'nurnrebel.com,www.nurnrebel.com').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (process.env.NODE_ENV !== 'production') hosts.push('localhost', '127.0.0.1');
  if (result.success !== true || typeof result.hostname !== 'string' || !hosts.includes(result.hostname.toLowerCase())) throw new ContactError('The robot check expired or failed. Please complete it again.');
}
