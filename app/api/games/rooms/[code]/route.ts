import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { publicRoom, updateRoom, Room, RoomError } from '@/lib/games/rooms';
import { roomUser } from '@/lib/games/room-auth';
type Context = {params:Promise<{code:string}>};
function failure(e: unknown) { return NextResponse.json({error:e instanceof RoomError ? e.message : 'Unable to connect to room. Please try again.'},{status:e instanceof RoomError ? e.status : 500}); }
export async function GET(req: Request, context: Context) {
  try {
    const uid=await roomUser(req),code=(await context.params).code.toUpperCase();
    if (!/^[A-F0-9]{12}$/.test(code)) throw new RoomError('Invalid room code.');
    const snapshot=await adminDb.collection('gameRooms').doc(code).get();
    if (!snapshot.exists) throw new RoomError('Room not found.',404);
    const room=snapshot.data() as Room;
    if(room.expiresAt<Date.now() || room.status==='closed') throw new RoomError('This room has closed.',410);
    return NextResponse.json(publicRoom(room,uid),{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
export async function POST(req:Request,context:Context) {
  try {const uid=await roomUser(req);return NextResponse.json(await updateRoom(adminDb,(await context.params).code.toUpperCase(),uid,await req.json()));}
  catch(e){return failure(e);}
}
