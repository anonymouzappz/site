import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { DesignError, validateSubmission } from '@/lib/jersey';

export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return Response.json({ error: 'Sign in to submit your design.' }, { status: 401 });
    const user = await adminAuth.verifyIdToken(token, true).catch(() => null);
    if (!user || user.firebase.sign_in_provider === 'anonymous' || !user.email) return Response.json({ error: 'Sign in with a customer account.' }, { status: 401 });
    // Cap the stream before parsing or buffering artwork supplied by a client.
    const reader = req.body?.getReader();
    if (!reader) throw new DesignError('Missing submission.');
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.length;
      if (length > 850000) { await reader.cancel(); throw new DesignError('Your design is too large. Reduce the artwork size.'); }
      chunks.push(value);
    }
    const body = validateSubmission(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    const id = `${user.uid}_${body.requestId}`, ref = adminDb.collection('jerseySubmissions').doc(id);
    await adminDb.runTransaction(async tx => {
      const profile = await tx.get(adminDb.collection('users').doc(user.uid));
      if (!profile.exists || profile.data()?.isDisabled === true) throw new DesignError('This account cannot submit designs.');
      const existing = await tx.get(ref);
      if (existing.exists) return; // A retry never creates a second review request.
      const parent = body.parentId ? adminDb.collection('jerseySubmissions').doc(body.parentId) : null;
      if (parent) {
        const previous = await tx.get(parent);
        if (!previous.exists || previous.data()?.customerId !== user.uid || previous.data()?.status !== 'changes_requested') throw new DesignError('This design is no longer awaiting a revision.');
      }
      // A per-customer cooldown also serializes concurrent submissions.
      const gate = adminDb.collection('jerseySubmissionLimits').doc(user.uid);
      const last = await tx.get(gate);
      if (Date.now() - (last.data()?.lastSubmittedAt ?? 0) < 30000) throw new DesignError('Wait 30 seconds before submitting another design.');
      tx.set(ref, { ...body, customerId: user.uid, customerName: user.name || profile.data()?.displayName || '', customerEmail: user.email,
        status: 'pending', reviewNote: '', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      tx.set(gate, { lastSubmittedAt: Date.now() });
      if (parent) tx.update(parent, { status: 'revised', revisedBy: id, updatedAt: FieldValue.serverTimestamp() });
    });
    return Response.json({ id });
  } catch (error) {
    if (error instanceof DesignError || error instanceof SyntaxError) return Response.json({ error: error.message }, { status: 400 });
    console.error('Jersey submission failed', error);
    return Response.json({ error: 'Could not submit your design. Please try again.' }, { status: 500 });
  }
}
