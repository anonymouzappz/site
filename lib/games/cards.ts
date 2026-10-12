export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker';
export type Card = { id: string; suit: Suit; rank: number };
export const suitSymbol: Record<Suit, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣', joker: '★' };
export const rankLabel = (card: Card) => card.suit === 'joker' ? (card.rank === 16 ? 'BIG' : 'LIL') : ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[card.rank] || String(card.rank));
export function makeDeck(jokers = false): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const cards = suits.flatMap(suit => Array.from({ length: 13 }, (_, i) => ({ id: `${suit}-${i + 1}`, suit, rank: i + 1 })));
  return jokers ? [...cards.filter(c => !(c.rank === 2 && (c.suit === 'clubs' || c.suit === 'diamonds'))),
    { id: 'big-joker', suit: 'joker', rank: 16 }, { id: 'little-joker', suit: 'joker', rank: 15 }] : cards;
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export const sortHand = (hand: Card[]) => [...hand].sort((a,b) => a.suit.localeCompare(b.suit) || a.rank - b.rank);
export type Difficulty = 'easy' | 'balanced' | 'expert';
export type Mode = 'solo' | 'local' | 'online';
