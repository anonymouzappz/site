"use client";

import { motion } from "framer-motion";
import { Bot, Crown, Play, RotateCcw, Spade } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Suit = "♠" | "♥" | "♦" | "♣" | "🃏";

type Card = {
  id: string;
  suit: Suit;
  rank: string;
  value: number;
  isSpade: boolean;
  isJoker?: boolean;
};

type Player = {
  name: string;
  hand: Card[];
  tricks: number;
  bid: number;
  isBot: boolean;
};

const suits: Suit[] = ["♠", "♥", "♦", "♣"];

const ranks = [
  ["2", 2],
  ["3", 3],
  ["4", 4],
  ["5", 5],
  ["6", 6],
  ["7", 7],
  ["8", 8],
  ["9", 9],
  ["10", 10],
  ["J", 11],
  ["Q", 12],
  ["K", 13],
  ["A", 14],
] as const;

function buildDeck() {
  const deck: Card[] = [];

  suits.forEach((suit) => {
    ranks.forEach(([rank, value]) => {
      deck.push({
        id: `${rank}${suit}`,
        suit,
        rank,
        value: suit === "♠" ? value + 100 : value,
        isSpade: suit === "♠",
      });
    });
  });

  deck.push({
    id: "big-joker",
    suit: "🃏",
    rank: "BJ",
    value: 116,
    isSpade: true,
    isJoker: true,
  });

  deck.push({
    id: "little-joker",
    suit: "🃏",
    rank: "LJ",
    value: 115,
    isSpade: true,
    isJoker: true,
  });

  return deck;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function sortHand(hand: Card[]) {
  return [...hand].sort((a, b) => b.value - a.value);
}

function CardFace({
  card,
  small = false,
  back = false,
  onClick,
  active = false,
}: {
  card?: Card;
  small?: boolean;
  back?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const red = card?.suit === "♥" || card?.suit === "♦";
  const joker = card?.isJoker;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative shrink-0 overflow-hidden rounded-2xl border shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition ${
        small ? "h-[82px] w-[56px]" : "h-[116px] w-[78px]"
      } ${
        active ? "border-white/80 bg-[#f4efe6]" : "border-white/15 bg-[#f4efe6]"
      } ${onClick ? "hover:-translate-y-3 active:scale-95" : ""}`}
    >
      {back ? (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,#303030,#080808)] text-white">
          <Spade size={small ? 22 : 32} />
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-col justify-between p-2">
          <div
            className={`text-left font-black leading-none ${
              joker ? "text-yellow-500" : red ? "text-red-600" : "text-black"
            }`}
          >
            <div className={small ? "text-[14px]" : "text-xl"}>
              {card?.rank}
            </div>
            <div className={small ? "text-[13px]" : "text-lg"}>
              {card?.suit}
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center font-black ${
              joker ? "text-yellow-500" : red ? "text-red-600" : "text-black"
            }`}
          >
            <span className={small ? "text-2xl" : "text-4xl"}>
              {joker ? "★" : card?.suit}
            </span>
          </div>

          <div
            className={`rotate-180 text-left font-black leading-none ${
              joker ? "text-yellow-500" : red ? "text-red-600" : "text-black"
            }`}
          >
            <div className={small ? "text-[14px]" : "text-xl"}>
              {card?.rank}
            </div>
            <div className={small ? "text-[13px]" : "text-lg"}>
              {card?.suit}
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

export default function SpadesPage() {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [trick, setTrick] = useState<{ player: number; card: Card }[]>([]);
  const [message, setMessage] = useState("Choose players and start.");
  const [round, setRound] = useState(1);
  const [resolvingTrick, setResolvingTrick] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  function startGame(count = playerCount) {
    const deck = shuffle(buildDeck());

    const newPlayers: Player[] = Array.from({ length: count }).map((_, i) => ({
      name: i === 0 ? "You" : `Bot ${i}`,
      hand: [],
      tricks: 0,
      bid: 0,
      isBot: i !== 0,
    }));

    deck.forEach((card, index) => {
      newPlayers[index % count].hand.push(card);
    });

    newPlayers.forEach((p) => {
      p.hand = sortHand(p.hand);
      p.bid = Math.max(
        1,
        p.hand.filter((c) => c.isSpade || c.value >= 13).length,
      );
    });

    setPlayers(newPlayers);
    setTurn(0);
    setTrick([]);
    setRound(1);
    setStarted(true);
    setResolvingTrick(false);
    setGameOver(false);
    setMessage("Your turn. Play a card.");
  }

  function getWinner(cards: { player: number; card: Card }[]) {
    const leadSuit = cards[0].card.suit;

    return cards.reduce((best, current) => {
      const b = best.card;
      const c = current.card;

      if (c.isSpade && !b.isSpade) return current;
      if (c.isSpade && b.isSpade && c.value > b.value) return current;

      if (
        !c.isSpade &&
        !b.isSpade &&
        c.suit === leadSuit &&
        c.value > b.value
      ) {
        return current;
      }

      return best;
    }, cards[0]);
  }

  function chooseBotCard(bot: Player) {
    const leadSuit = trick[0]?.card.suit;
    let playable = bot.hand;

    if (leadSuit) {
      const sameSuit = bot.hand.filter((c) => c.suit === leadSuit);
      if (sameSuit.length > 0) playable = sameSuit;
    }

    return [...playable].sort((a, b) => {
      if (a.isSpade && !b.isSpade) return 1;
      if (!a.isSpade && b.isSpade) return -1;
      return a.value - b.value;
    })[0];
  }

  function playCard(playerIndex: number, card: Card) {
    if (!started || resolvingTrick || gameOver) return;
    if (playerIndex !== turn) return;

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));

    copy[playerIndex].hand = copy[playerIndex].hand.filter(
      (c) => c.id !== card.id,
    );

    const newTrick = [...trick, { player: playerIndex, card }];

    if (newTrick.length === copy.length) {
      const winner = getWinner(newTrick);
      copy[winner.player].tricks += 1;

      setResolvingTrick(true);
      setPlayers(copy);
      setTrick(newTrick);
      setMessage(`${copy[winner.player].name} wins the book.`);

      setTimeout(() => {
        const roundDone = copy.every((p) => p.hand.length === 0);

        setTrick([]);
        setTurn(winner.player);
        setResolvingTrick(false);

        if (roundDone) {
          const champ = [...copy].sort((a, b) => b.tricks - a.tricks)[0];
          setGameOver(true);
          setMessage(`${champ.name} wins the round.`);
        } else {
          setRound((r) => r + 1);
          setMessage(
            winner.player === 0
              ? "Your turn. Play a card."
              : `${copy[winner.player].name} is thinking...`,
          );
        }
      }, 950);

      return;
    }

    const next = (playerIndex + 1) % copy.length;

    setPlayers(copy);
    setTrick(newTrick);
    setTurn(next);
    setMessage(
      next === 0
        ? "Your turn. Play a card."
        : `${copy[next].name} is thinking...`,
    );
  }

  useEffect(() => {
    if (!started || resolvingTrick || gameOver) return;

    const current = players[turn];

    if (!current || !current.isBot || current.hand.length === 0) return;

    const timer = setTimeout(() => {
      const chosen = chooseBotCard(current);
      if (chosen) playCard(turn, chosen);
    }, 850);

    return () => clearTimeout(timer);
  }, [started, players, turn, trick, resolvingTrick, gameOver]);

  const currentPlayer = players[turn];
  const myHand = players[0]?.hand ?? [];

  const scores = useMemo(() => {
    return players.map((p) => ({
      name: p.name,
      score: p.tricks >= p.bid ? p.bid * 10 + (p.tricks - p.bid) : -p.bid * 10,
    }));
  }, [players]);

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#050505] text-white">
      <div className="flex h-full flex-col px-3 py-3 sm:px-5">
        <header className="flex shrink-0 items-center justify-between rounded-3xl border border-white/10 bg-[#111]/90 px-4 py-3 shadow-2xl">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/45">
              Cards Corner
            </p>
            <h1 className="text-xl font-black uppercase tracking-tight sm:text-3xl">
              Spades
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!started && (
              <select
                value={playerCount}
                onChange={(e) =>
                  setPlayerCount(Number(e.target.value) as 2 | 3 | 4)
                }
                className="h-10 rounded-full border border-white/10 bg-black px-3 text-xs font-black uppercase"
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            )}

            <button
              onClick={() => startGame()}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-black uppercase text-black"
            >
              {started ? <RotateCcw size={15} /> : <Play size={15} />}
              {started ? "Reset" : "Start"}
            </button>
          </div>
        </header>

        <section className="mt-3 grid min-h-0 flex-1 grid-rows-[76px_1fr_136px] gap-3">
          <div className="grid grid-cols-4 gap-2">
            {players.length > 0
              ? players.map((p, i) => (
                  <div
                    key={p.name}
                    className={`rounded-2xl border p-2 ${
                      turn === i
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-[#101010]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate text-[10px] font-black uppercase">
                        {p.isBot ? (
                          <Bot className="mr-1 inline" size={12} />
                        ) : (
                          <Crown className="mr-1 inline" size={12} />
                        )}
                        {p.name}
                      </p>
                      <p className="text-[10px] font-black">{p.hand.length}</p>
                    </div>
                    <p className="mt-1 text-[10px] font-bold opacity-70">
                      Bid {p.bid} / Books {p.tricks}
                    </p>
                  </div>
                ))
              : [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="rounded-2xl border border-white/10 bg-[#101010] p-2"
                  >
                    <p className="text-[10px] font-black uppercase text-white/35">
                      Seat {n}
                    </p>
                  </div>
                ))}
          </div>

          <div className="relative min-h-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,#1b1b1b,#070707_70%)] p-3">
            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
              Round {round}
            </div>

            <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
              {currentPlayer?.name ?? "Ready"}
            </div>

            <div className="flex h-full items-center justify-center">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {trick.length > 0 ? (
                  trick.map((play) => (
                    <motion.div
                      key={`${play.player}-${play.card.id}`}
                      initial={{ scale: 0.7, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <CardFace card={play.card} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                        {players[play.player]?.name}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center text-center sm:col-span-4">
                    <Spade size={54} className="mb-3 text-white/20" />
                    <p className="max-w-sm text-xs font-bold uppercase tracking-[0.25em] text-white/40">
                      {message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-h-0 rounded-[2rem] border border-white/10 bg-[#101010] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                Your Hand
              </p>

              <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                {message}
              </p>
            </div>

            <div className="flex h-[92px] items-end gap-1 overflow-hidden">
              {myHand.length > 0 ? (
                myHand.map((card) => (
                  <CardFace
                    key={card.id}
                    card={card}
                    small
                    active={turn === 0 && !resolvingTrick && !gameOver}
                    onClick={
                      turn === 0 && !resolvingTrick && !gameOver
                        ? () => playCard(0, card)
                        : undefined
                    }
                  />
                ))
              ) : started ? (
                <div className="flex w-full items-center justify-center text-xs font-black uppercase tracking-[0.25em] text-white/40">
                  Round Complete
                </div>
              ) : (
                <div className="flex w-full items-center justify-center text-xs font-black uppercase tracking-[0.25em] text-white/40">
                  Start game to deal cards
                </div>
              )}
            </div>
          </div>
        </section>

        {started && (
          <footer className="mt-3 grid shrink-0 grid-cols-4 gap-2">
            {scores.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl border border-white/10 bg-[#101010] px-3 py-2 text-center"
              >
                <p className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                  {s.name}
                </p>
                <p className="text-sm font-black">{s.score}</p>
              </div>
            ))}
          </footer>
        )}
      </div>
    </main>
  );
}
