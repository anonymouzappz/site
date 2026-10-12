import type { SpadesOptions, SpadesState, SpadesAction } from './spades';
import type { TonkOptions, TonkState, TonkAction } from './tonk';
export type RoomGame = SpadesState | TonkState;
export type RoomAction = SpadesAction | TonkAction;
export type RoomOptions = SpadesOptions | TonkOptions;
export type PublicRoom = { code: string; kind: 'spades' | 'tonk'; status: 'lobby' | 'playing' | 'closed';
  host: boolean; mySeat: number; seats: { name: string; occupied: boolean }[];
  version: number; fillBots: boolean; game: RoomGame | null };
