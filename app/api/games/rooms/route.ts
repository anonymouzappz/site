import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { createRoom, RoomError } from '@/lib/games/rooms';
import { roomUser } from '@/lib/games/room-auth';
export async function POST(req: Request) {
  try { const uid=await roomUser(req);return NextResponse.json(await createRoom(adminDb,uid,await req.json())); }
  catch(e) { return NextResponse.json({error:e instanceof RoomError ? e.message : 'Unable to create room. Please try again.'},{status:e instanceof RoomError ? e.status : 500}); }
}
