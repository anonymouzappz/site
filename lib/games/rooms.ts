import { randomBytes } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { createSpades, spadesReducer, type SpadesOptions } from './spades';
import { createTonk, tonkReducer, type TonkOptions } from './tonk';
import type { PublicRoom, RoomAction, RoomGame, RoomOptions } from './room-types';
type Seat = { uid: string; name: string };
export type Room = { code: string; kind: 'spades' | 'tonk'; hostId: string; status: 'lobby' | 'playing' | 'closed';
  options: RoomOptions; seats: Seat[]; version: number; fillBots: boolean; game: RoomGame | null;
  nextActionAt: number; createdAt: number; expiresAt: number };
export class RoomError extends Error { constructor(message: string, public status = 400) { super(message); } }
function normalizeOptions(kind: 'spades' | 'tonk', raw: Record<string, unknown>): RoomOptions {
  const difficulty = ['easy','balanced','expert'].includes(String(raw.difficulty)) ? raw.difficulty as 'easy' | 'balanced' | 'expert' : 'balanced';
  if (kind === 'spades') return { mode: 'online', difficulty, target: [250,350,500,750].includes(Number(raw.target)) ? Number(raw.target) : 500,
    jokers: raw.jokers === true || raw.deucesHigh === true, deucesHigh: raw.deucesHigh === true, nil: raw.nil !== false,
    bagPenalty: raw.bagPenalty !== false, minTeamBid: [0,4,5].includes(Number(raw.minTeamBid)) ? Number(raw.minTeamBid) : 0 };
  return { mode: 'online', difficulty, players: [2,3,4].includes(Number(raw.players)) ? Number(raw.players) : 3,
    target: [50,100,200].includes(Number(raw.target)) ? Number(raw.target) : 100, instantTonk: raw.instantTonk !== false,
    dropLimit: [5,10,15,50].includes(Number(raw.dropLimit)) ? Number(raw.dropLimit) : 50,
    waiting: raw.waiting === true, unit: 10, instantLow: raw.instantLow === true };
}
export function publicRoom(room: Room, uid: string): PublicRoom {
  const mySeat = room.seats.findIndex(s => s.uid === uid);
  if (mySeat < 0) throw new RoomError('Join this room before viewing the table.',403);
  let game = room.game;
  if (game) {
    const reveal = ['roundOver','matchOver'].includes(game.phase);
    game = { ...game, players: game.players.map((p,i) => ({ ...p,
      hand: i === mySeat || reveal ? p.hand : p.hand.map((_,index) => ({ id: `hidden-${index}`, suit: 'clubs' as const, rank: 0 })) })),
      ...(game.kind === 'tonk' ? { deck: game.deck.map((_,index) => ({ id: `stock-${index}`, suit: 'clubs' as const, rank: 0 })),
        discard: game.discard.length ? [game.discard[game.discard.length - 1]] : [] } : {}) } as RoomGame;
  }
  return { code: room.code, kind: room.kind, status: room.status, host: room.hostId === uid, mySeat,
    seats: room.seats.map(s => ({name:s.name,occupied:Boolean(s.uid)})), version: room.version, fillBots: room.fillBots, game };
}
export async function createRoom(db: Firestore, uid: string, input: Record<string, unknown>) {
  if (!['spades','tonk'].includes(String(input.kind))) throw new RoomError('Choose a valid game.');
  const kind = input.kind as 'spades' | 'tonk';
  const options = normalizeOptions(kind, typeof input.options === 'object' && input.options ? input.options as Record<string, unknown> : {});
  const code = randomBytes(6).toString('hex').toUpperCase();
  const count = kind === 'spades' ? 4 : (options as TonkOptions).players;
  const name = String(input.name || 'Host').trim().slice(0,24) || 'Host';
  const room: Room = { code,kind,hostId:uid,status:'lobby',options,fillBots:input.fillBots !== false,
    seats:Array.from({length:count},(_,i)=>({uid:i === 0 ? uid : '',name:i === 0 ? name : `Open seat ${i+1}`})),
    version:1,game:null,nextActionAt:0,createdAt:Date.now(),expiresAt:Date.now()+24*60*60*1000 };
  await db.runTransaction(async tx => {
    const limitRef = db.collection('gameRoomLimits').doc(uid);
    const limit = await tx.get(limitRef);
    if ((limit.data()?.nextCreateAt || 0) > Date.now()) throw new RoomError('Wait a minute before creating another room.',429);
    tx.set(db.collection('gameRooms').doc(code),room);
    tx.set(limitRef,{nextCreateAt:Date.now()+60000});
  });
  return publicRoom(room,uid);
}
function validAction(kind: Room['kind'], action: unknown): action is RoomAction {
  if (!action || typeof action !== 'object') return false;
  const a = action as Record<string, unknown>;
  if (a.type === 'NEXT') return true;
  if (kind === 'spades') return a.type === 'BID' && Number.isInteger(a.bid) || a.type === 'PLAY' && typeof a.id === 'string';
  return a.type === 'DROP' || a.type === 'DRAW' && ['deck','discard'].includes(String(a.source)) ||
    a.type === 'DISCARD' && typeof a.id === 'string' || a.type === 'SPREAD' && Array.isArray(a.ids) && a.ids.length <= 6 && a.ids.every(id=>typeof id === 'string') ||
    a.type === 'HIT' && typeof a.id === 'string' && typeof a.spread === 'string';
}
export async function updateRoom(db: Firestore, code: string, uid: string, input: Record<string, unknown>) {
  if (!/^[A-F0-9]{12}$/.test(code)) throw new RoomError('Enter a valid room code.');
  const ref = db.collection('gameRooms').doc(code);
  return db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) throw new RoomError('Room not found.',404);
    let room = snapshot.data() as Room;
    if (room.expiresAt < Date.now() || room.status === 'closed') throw new RoomError('This room has closed.',410);
    if (input.kind && input.kind !== room.kind) throw new RoomError(`This code is for ${room.kind}. Open that game to join.`);
    let seat = room.seats.findIndex(s=>s.uid === uid);
    if (input.op === 'join') {
      if (seat < 0) {
        if (room.status !== 'lobby') throw new RoomError('This match has started. Ask the host for a new room.',409);
        seat = room.seats.findIndex(s=>!s.uid);
        if (seat < 0) throw new RoomError('This room is full.',409);
        room = { ...room, seats:room.seats.map((s,i)=>i === seat ? {uid,name:String(input.name || 'Player').trim().slice(0,24) || 'Player'} : s) };
      } else return publicRoom(room,uid);
    } else {
      if (seat < 0) throw new RoomError('You are not a member of this room.',403);
      if (input.op === 'start') {
        if (uid !== room.hostId || room.status !== 'lobby') throw new RoomError('Only the host can start this room.',403);
        if (room.seats.filter(s=>s.uid).length < 2) throw new RoomError('At least two people must join before starting.');
        if (!room.fillBots && room.seats.some(s=>!s.uid)) throw new RoomError('Wait until every seat is filled.');
        const game = room.kind === 'spades' ? createSpades(room.options as SpadesOptions) : createTonk(room.options as TonkOptions);
        const named = {...game,players:game.players.map((p,i)=>({...p,name:room.seats[i].uid ? room.seats[i].name : ['Rook','Nova','Ace','Echo'][i],bot:!room.seats[i].uid}))} as RoomGame;
        room = { ...room, game:named, status:'playing' };
      } else if (input.op === 'close') {
        if (uid !== room.hostId) throw new RoomError('Only the host can close the room.',403);
        room = { ...room,status:'closed' };
      } else if (input.op === 'sync') {
        const game = room.game;
        if (!game || room.nextActionAt > Date.now()) return publicRoom(room,uid);
        let next = game;
        if (game.kind === 'spades' && game.phase === 'trick') next = spadesReducer(game,{type:'RESOLVE'});
        else if (game.players[game.turn].bot) next = game.kind === 'spades' ? spadesReducer(game,{type:'BOT'}) : tonkReducer(game,{type:'BOT'});
        if (next === game) return publicRoom(room,uid);
        room = { ...room,game:next };
      } else if (input.op === 'action') {
        const game = room.game;
        if (!game || !validAction(room.kind,input.action)) throw new RoomError('Invalid game action.');
        if (input.version !== room.version) throw new RoomError('The table changed. Your room will refresh.',409);
        const action = input.action as RoomAction;
        if (action.type === 'NEXT') {
          if (uid !== room.hostId) throw new RoomError('Only the host can deal the next round.',403);
        } else if (game.turn !== seat || game.players[seat].bot) throw new RoomError('Wait for your turn.',409);
        let next = game.kind === 'spades' ? spadesReducer(game,action as Parameters<typeof spadesReducer>[1]) : tonkReducer(game,action as Parameters<typeof tonkReducer>[1]);
        if (next === game) throw new RoomError('That move is not legal under this table’s rules.',409);
        // New deals must preserve membership and which seats are bots.
        if (action.type === 'NEXT') next = {...next,players:next.players.map((p,i)=>({...p,name:game.players[i].name,bot:game.players[i].bot}))} as RoomGame;
        room = { ...room,game:next };
      } else throw new RoomError('Unknown room action.');
    }
    room = { ...room,version:room.version+1,nextActionAt:Date.now()+750 };
    tx.set(ref,room);
    return publicRoom(room,uid);
  });
}
