import { Card, Difficulty, Mode, makeDeck, shuffle, sortHand } from './cards';
export type TonkOptions = { mode: Mode; difficulty: Difficulty; players: number; target: number; instantTonk: boolean; dropLimit: number; waiting: boolean; unit: number; instantLow?: boolean };
export type Spread = { id: string; owner: number; cards: Card[] };
export type TonkPlayer = { name: string; bot: boolean; hand: Card[]; score: number; wait: number };
export type TonkState = { kind: 'tonk'; options: TonkOptions; players: TonkPlayer[]; deck: Card[]; discard: Card[]; spreads: Spread[];
  turn: number; dealer: number; round: number; phase: 'draw' | 'play' | 'roundOver' | 'matchOver'; drawnDiscard: string;
  log: string[]; result: string; winner: number | null };
export type TonkAction = { type: 'DRAW'; source: 'deck' | 'discard' } | { type: 'DISCARD'; id: string } |
  { type: 'SPREAD'; ids: string[] } | { type: 'HIT'; id: string; spread: string } | { type: 'DROP' } | { type: 'BOT' } | { type: 'NEXT' };
export const points = (hand: Card[]) => hand.reduce((sum,c) => sum + Math.min(c.rank, 10), 0);
export function validSpread(cards: Card[]) {
  if (cards.length < 3 || new Set(cards.map(c => c.id)).size !== cards.length) return false;
  if (cards.length <= 4 && cards.every(c => c.rank === cards[0].rank)) return true;
  const sorted = [...cards].sort((a,b) => a.rank - b.rank);
  return sorted.every((c,i) => c.suit === sorted[0].suit && (!i || c.rank === sorted[i - 1].rank + 1));
}
export const canHit = (card: Card, spread: Spread) => validSpread([...spread.cards, card]);
export function bestSpread(hand: Card[]) {
  let best: Card[] = [];
  for (let mask = 0; mask < (1 << hand.length); mask++) {
    const cards = hand.filter((_,i) => mask & (1 << i));
    if (validSpread(cards) && points(cards) > points(best)) best = cards;
  }
  return best;
}
function settle(state: TonkState, winner: number | null, reason: string, multiplier = 1, caught?: number): TonkState {
  const scores = state.players.map(p => p.score);
  if (winner !== null) {
    for (let i = 0; i < scores.length; i++) if (i !== winner) {
      const payment = state.options.unit * (i === caught ? 2 : multiplier);
      scores[i] -= payment; scores[winner] += payment;
    }
  }
  const players = state.players.map((p,i) => ({ ...p, score: scores[i] }));
  const match = winner !== null && scores[winner] >= state.options.target;
  const result = `${reason}${winner !== null ? ` ${players[winner].name} wins${match ? ' the match' : ' the round'}!` : ' Round drawn.'}`;
  return { ...state, players, winner, phase: match ? 'matchOver' : 'roundOver', result, log: [...state.log, result].slice(-30) };
}
export function createTonk(options: TonkOptions, previous?: TonkState, random = Math.random): TonkState {
  const deck = shuffle(makeDeck(), random);
  const dealer = previous ? (previous.dealer + 1) % options.players : options.players - 1;
  const players = Array.from({ length: options.players }, (_,i) => ({ name: options.mode === 'solo' ? ['You','Nova','Ace','Rook'][i] : `Player ${i + 1}`,
    bot: options.mode === 'solo' && i !== 0, hand: [] as Card[], score: previous?.players[i]?.score || 0, wait: 0 }));
  for (let i = 0; i < 5; i++) for (const player of players) player.hand.push(deck.shift()!);
  for (const player of players) player.hand = sortHand(player.hand);
  const state: TonkState = { kind: 'tonk', options, players, deck, discard: [deck.shift()!], spreads: [], turn: (dealer + 1) % options.players,
    dealer, round: (previous?.round || 0) + 1, phase: 'draw', drawnDiscard: '', log: ['Five cards dealt. Draw or drop to begin.'], result: '', winner: null };
  const tonks = players.map((p,i) => (options.instantTonk && points(p.hand) >= 49 || options.instantLow && points(p.hand) <= 9) ? i : -1).filter(i => i >= 0);
  return tonks.length ? settle(state, tonks.length === 1 ? tonks[0] : null, 'Opening Tonk.', tonks.length === 1 && points(players[tonks[0]].hand) <= 9 ? 3 : 2) : state;
}
function finishTurn(state: TonkState): TonkState {
  return { ...state, turn: (state.turn + 1) % state.players.length, phase: 'draw', drawnDiscard: '' };
}
export function tonkReducer(state: TonkState, action: TonkAction): TonkState {
  if (action.type === 'NEXT') return state.phase === 'roundOver' ? createTonk(state.options, state) : state;
  if (state.phase === 'roundOver' || state.phase === 'matchOver') return state;
  const seat = state.turn, player = state.players[seat];
  if (action.type === 'BOT') {
    if (!player.bot) return state;
    if (state.phase === 'draw') {
      if (player.wait === 0 && points(player.hand) <= Math.min(state.options.dropLimit, state.options.difficulty === 'expert' ? 6 : 3)) return tonkReducer(state, { type: 'DROP' });
      const top = state.discard.at(-1);
      const useful = top && (bestSpread([...player.hand, top]).length > bestSpread(player.hand).length || state.spreads.some(s => canHit(top, s)));
      return tonkReducer(state, { type: 'DRAW', source: useful && state.options.difficulty !== 'easy' ? 'discard' : 'deck' });
    }
    const spread = bestSpread(player.hand);
    if (spread.length) return tonkReducer(state, { type: 'SPREAD', ids: spread.map(c => c.id) });
    for (const card of player.hand) { const target = state.spreads.find(s => canHit(card, s)); if (target) return tonkReducer(state, { type: 'HIT', id: card.id, spread: target.id }); }
    const candidates = player.hand.filter(c => c.id !== state.drawnDiscard);
    const value = (card: Card) => Math.min(card.rank,10) - (state.options.difficulty === 'expert' ? player.hand.filter(c => c.id !== card.id && (c.rank === card.rank || c.suit === card.suit && Math.abs(c.rank - card.rank) <= 2)).length * 4 : 0);
    const discard = state.options.difficulty === 'easy' ? candidates[Math.floor(Math.random() * candidates.length)] : [...candidates].sort((a,b) => value(b) - value(a))[0];
    return discard ? tonkReducer(state, { type: 'DISCARD', id: discard.id }) : state;
  }
  if (action.type === 'DROP' && state.phase === 'draw' && player.wait === 0 && points(player.hand) <= state.options.dropLimit) {
    const total = points(player.hand);
    if (state.players.every((p,i) => i === seat || points(p.hand) > total)) return settle(state, seat, `${player.name} dropped with ${total}.`);
    const low = Math.min(...state.players.map(p => points(p.hand)));
    // House rule: ties beat the dropper; closest eligible seat left of dealer wins.
    let winner = (state.dealer + 1) % state.players.length;
    for (let i = 0; i < state.players.length; i++) {
      const candidate = (state.dealer + 1 + i) % state.players.length;
      if (candidate !== seat && points(state.players[candidate].hand) === low) { winner = candidate; break; }
    }
    return settle(state, winner, `${player.name} was caught dropping.`, 1, seat);
  }
  if (action.type === 'DRAW' && state.phase === 'draw') {
    const card = action.source === 'deck' ? state.deck[0] : state.discard.at(-1);
    if (!card) {
      if (action.source === 'discard') return state;
      const low = Math.min(...state.players.map(p => points(p.hand)));
      const tied = state.players.map((p,i) => points(p.hand) === low ? i : -1).filter(i => i >= 0);
      return settle(state, tied.length === 1 ? tied[0] : null, 'Stock exhausted.');
    }
    return { ...state, phase: 'play', players: state.players.map((p,i) => i === seat ? { ...p, wait: Math.max(0,p.wait - 1), hand: sortHand([...p.hand, card]) } : p),
      deck: action.source === 'deck' ? state.deck.slice(1) : state.deck,
      discard: action.source === 'discard' ? state.discard.slice(0,-1) : state.discard,
      drawnDiscard: action.source === 'discard' ? card.id : '' };
  }
  if (state.phase !== 'play') return state;
  if (action.type === 'DISCARD') {
    const card = player.hand.find(c => c.id === action.id);
    if (!card || card.id === state.drawnDiscard) return state;
    const next = { ...state, players: state.players.map((p,i) => i === seat ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p),
      discard: [...state.discard, card], log: [...state.log, `${player.name} discarded ${card.rank === 1 ? 'A' : card.rank} of ${card.suit}.`].slice(-30) };
    return next.players[seat].hand.length ? finishTurn(next) : settle(next, seat, 'Out on the final discard.');
  }
  if (action.type === 'SPREAD') {
    const cards = player.hand.filter(c => action.ids.includes(c.id));
    if (cards.length !== action.ids.length || !validSpread(cards)) return state;
    const next = { ...state, players: state.players.map((p,i) => i === seat ? { ...p, hand: p.hand.filter(c => !action.ids.includes(c.id)), wait: p.wait + (state.options.waiting ? 3 : 0) } : p),
      spreads: [...state.spreads, { id: cards.map(c => c.id).sort().join('|'), owner: seat, cards }],
      log: [...state.log, `${player.name} laid a ${cards.length}-card spread.`].slice(-30) };
    return next.players[seat].hand.length ? next : settle(next, seat, 'Tonk out without a discard.', 2);
  }
  if (action.type === 'HIT') {
    const card = player.hand.find(c => c.id === action.id), target = state.spreads.find(s => s.id === action.spread);
    if (!card || !target || !canHit(card, target)) return state;
    const next = { ...state, players: state.players.map((p,i) => ({ ...p, hand: i === seat ? p.hand.filter(c => c.id !== card.id) : p.hand,
      wait: p.wait + (state.options.waiting && i === target.owner ? 1 : 0) })),
      spreads: state.spreads.map(s => s.id === target.id ? { ...s, cards: sortHand([...s.cards, card]) } : s),
      log: [...state.log, `${player.name} hit ${state.players[target.owner].name}'s spread.`].slice(-30) };
    return next.players[seat].hand.length ? next : settle(next, seat, 'Tonk out without a discard.', 2);
  }
  return state;
}
