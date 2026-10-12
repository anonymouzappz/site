import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { RoomError } from './rooms';
export async function roomUser(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer /,'');
  if (!token) throw new RoomError('Sign in or continue as a guest to play online.',401);
  let uid: string;
  try { uid = (await adminAuth.verifyIdToken(token)).uid; }
  catch { throw new RoomError('Your session expired. Rejoin the room.',401); }
  const profile = (await adminDb.collection('users').doc(uid).get()).data();
  if (profile?.isDisabled === true) throw new RoomError('This account is disabled.',403);
  return uid;
}
