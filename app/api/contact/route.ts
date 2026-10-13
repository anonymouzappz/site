import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { ContactError, validateContact, verifyContactCaptcha } from '@/lib/contact-validation';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const reader = req.body?.getReader();
    if (!reader) throw new ContactError('Missing message.');
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.length;
      if (length > 50000) { await reader.cancel(); throw new ContactError('Your message is too long.', 413); }
      chunks.push(value);
    }
    const { captchaToken, ...message } = validateContact(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    await verifyContactCaptcha(captchaToken);
    const key = createHash('sha256').update(message.email).digest('hex');
    const gate = adminDb.collection('contactSubmissionLimits').doc(key);
    const ref = adminDb.collection('contactMessages').doc();
    await adminDb.runTransaction(async tx => {
      const last = await tx.get(gate);
      if (Date.now() - (last.data()?.lastSubmittedAt ?? 0) < 60000) throw new ContactError('Please wait a minute before sending another message.', 429);
      tx.set(ref, { ...message, status: 'new', isArchived: false, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      tx.set(gate, { lastSubmittedAt: Date.now() });
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ContactError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return Response.json({ error: 'Invalid message.' }, { status: 400 });
    console.error('Contact submission failed', error);
    return Response.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  }
}
