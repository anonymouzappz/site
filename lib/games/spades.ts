import { Card, Difficulty, Mode, makeDeck, shuffle, sortHand } from './cards';
export type SpadesOptions = { mode: Mode; difficulty: Difficulty; target: number; jokers: boolean; nil: boolean; bagPenalty: boolean; deucesHigh?: boolean; minTeamBid?: number };
export type SpadesPlayer = { name: string; bot: boolean; hand: Card[]; bid: number | null; tricks: number };
export type Play = { seat: number; card: Card };
export type SpadesState = { kind: 'spades'; options: SpadesOptions; players: SpadesPlayer[]; turn: number; dealer: number; round: number;
  phase: 'bid' | 'play' | 'trick' | 'roundOver' | 'matchOver'; trick: Play[]; broken: boolean;
  scores: number[]; bags: number[]; log: string[]; result: string };
export type SpadesAction = { type: 'BID'; bid: number } | { type: 'PLAY'; id: string } | { type: 'RESOLVE' } | { type: 'BOT' } | { type: 'NEXT' };
export const trump = (card: Card, options?: SpadesOptions) => card.suit === 'spades' || card.suit === 'joker' || Boolean(options?.deucesHigh && card.suit === 'hearts' && card.rank === 2);
const strength = (card: Card, options?: SpadesOptions) => options?.deucesHigh && card.suit === 'joker' ? card.rank + 102 :
  options?.deucesHigh && card.rank === 2 && card.suit === 'spades' ? 116 :
  options?.deucesHigh && card.rank === 2 && card.suit === 'hearts' ? 115 :
  (trump(card, options) ? 100 : 0) + (card.rank === 1 ? 14 : card.rank);
export function legalSpades(hand: Card[], trick: Play[], broken: boolean, options?: SpadesOptions) {
  if (!trick.length) { const plain = hand.filter(c => !trump(c, options)); return broken || !plain.length ? hand : plain; }
  const lead = trick[0].card;
  const follow = hand.filter(c => trump(lead, options) ? trump(c, options) : c.suit === lead.suit && !trump(c, options));
  return follow.length ? follow : hand;
}
export function trickWinner(trick: Play[], options?: SpadesOptions) {
  const lead = trick[0].card;
  return trick.reduce((best, play) => {
    if (trump(play.card, options)) return !trump(best.card, options) || strength(play.card, options) > strength(best.card, options) ? play : best;
    return !trump(best.card, options) && play.card.suit === lead.suit && strength(play.card, options) > strength(best.card, options) ? play : best;
  }).seat;
}
export function scoreSpades(players: SpadesPlayer[], scores: number[], bags: number[], options: SpadesOptions) {
  const nextScores = [...scores], nextBags = [...bags];
  for (let team = 0; team < 2; team++) {
    const members = players.filter((_, i) => i % 2 === team);
    const bid = members.reduce((sum,p) => sum + (p.bid || 0), 0);
    const books = members.filter(p => p.bid !== 0).reduce((sum,p) => sum + p.tricks, 0);
    const extras = Math.max(0, books - bid) + members.filter(p => p.bid === 0).reduce((sum,p) => sum + p.tricks, 0);
    nextScores[team] += books >= bid ? bid * 10 + extras : -bid * 10;
    for (const player of members.filter(p => p.bid === 0)) nextScores[team] += player.tricks === 0 ? 100 : -100;
    nextBags[team] += extras;
    if (options.bagPenalty) { nextScores[team] -= Math.floor(nextBags[team] / 10) * 100; nextBags[team] %= 10; }
  }
  return { scores: nextScores, bags: nextBags };
}
export function createSpades(options: SpadesOptions, previous?: SpadesState, random = Math.random): SpadesState {
  const cards = shuffle(makeDeck(options.jokers), random);
  const dealer = previous ? (previous.dealer + 1) % 4 : 3;
  const players = Array.from({ length: 4 }, (_,i) => ({ name: options.mode === 'solo' ? ['You', 'Nova', 'Your partner', 'Ace'][i] : `Player ${i + 1}`,
    bot: options.mode === 'solo' && i !== 0, hand: sortHand(cards.filter((_,j) => j % 4 === i)), bid: null, tricks: 0 }));
  return { kind: 'spades', options, players, turn: (dealer + 1) % 4, dealer, round: (previous?.round || 0) + 1,
    phase: 'bid', trick: [], broken: false, scores: previous?.scores || [0,0], bags: previous?.bags || [0,0], log: ['New deal. Place your bids.'], result: '' };
}
export function spadesBotCard(state: SpadesState): Card {
  const player = state.players[state.turn];
  const legal = legalSpades(player.hand, state.trick, state.broken, state.options);
  if (state.options.difficulty === 'easy') return legal[Math.floor(Math.random() * legal.length)];
  const ascending = [...legal].sort((a,b) => strength(a, state.options) - strength(b, state.options));
  if (!state.trick.length) {
    if (player.bid === 0) return ascending[0];
    return state.options.difficulty === 'expert' ? [...legal].sort((a,b) => strength(b, state.options) - strength(a, state.options))[0] : ascending[0];
  }
  const partnerWinning = trickWinner(state.trick, state.options) % 2 === state.turn % 2;
  if (partnerWinning || player.bid === 0 || player.tricks >= (player.bid || 0)) return ascending[0];
  return ascending.find(card => trickWinner([...state.trick, { seat: state.turn, card }], state.options) === state.turn) || ascending[0];
}
export function spadesReducer(state: SpadesState, action: SpadesAction): SpadesState {
  if (action.type === 'NEXT') return state.phase === 'roundOver' ? createSpades(state.options, state) : state;
  if (action.type === 'BOT') {
    if (!state.players[state.turn].bot) return state;
    if (state.phase === 'bid') {
      const hand = state.players[state.turn].hand;
      const partnerBid = state.players[(state.turn + 2) % 4].bid;
      const minimum = partnerBid === null ? (state.options.nil ? 0 : 1) : Math.max(state.options.nil ? 0 : 1, (state.options.minTeamBid || 0) - partnerBid);
      const estimate = Math.min(13, Math.max(minimum, Math.round(hand.reduce((sum,c) => sum + (trump(c, state.options) ? (strength(c, state.options) >= 110 ? .9 : .35) : c.rank === 1 ? .85 : c.rank === 13 ? .4 : 0), 0))));
      return spadesReducer(state, { type: 'BID', bid: estimate });
    }
    if (state.phase === 'play') return spadesReducer(state, { type: 'PLAY', id: spadesBotCard(state).id });
    return state;
  }
  if (action.type === 'BID' && state.phase === 'bid') {
    if (!Number.isInteger(action.bid) || action.bid < (state.options.nil ? 0 : 1) || action.bid > 13) return state;
    const partnerBid = state.players[(state.turn + 2) % 4].bid;
    if (partnerBid !== null && action.bid + partnerBid < (state.options.minTeamBid || 0)) return state;
    const players = state.players.map((p,i) => i === state.turn ? { ...p, bid: action.bid } : p);
    const done = players.every(p => p.bid !== null);
    return { ...state, players, turn: done ? (state.dealer + 1) % 4 : (state.turn + 1) % 4,
      phase: done ? 'play' : 'bid', log: [...state.log, `${players[state.turn].name} bids ${action.bid === 0 ? 'nil' : action.bid}.`].slice(-30) };
  }
  if (action.type === 'PLAY' && state.phase === 'play') {
    const card = legalSpades(state.players[state.turn].hand, state.trick, state.broken, state.options).find(c => c.id === action.id);
    if (!card) return state;
    const trick = [...state.trick, { seat: state.turn, card }];
    return { ...state, players: state.players.map((p,i) => i === state.turn ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p),
      broken: state.broken || trump(card, state.options), trick, phase: trick.length === 4 ? 'trick' : 'play', turn: (state.turn + 1) % 4 };
  }
  if (action.type === 'RESOLVE' && state.phase === 'trick') {
    const winner = trickWinner(state.trick, state.options);
    const players = state.players.map((p,i) => i === winner ? { ...p, tricks: p.tricks + 1 } : p);
    const log = [...state.log, `${players[winner].name} wins the book.`].slice(-30);
    if (players.every(p => !p.hand.length)) {
      const tally = scoreSpades(players, state.scores, state.bags, state.options);
      const done = Math.max(...tally.scores) >= state.options.target && tally.scores[0] !== tally.scores[1];
      return { ...state, players, ...tally, turn: winner, phase: done ? 'matchOver' : 'roundOver', log,
        result: done ? `${tally.scores[0] > tally.scores[1] ? 'Team North' : 'Team South'} wins the match!` : 'Round complete. Scores are settled.' };
    }
    return { ...state, players, turn: winner, phase: 'play', trick: [], log };
  }
  return state;
}
