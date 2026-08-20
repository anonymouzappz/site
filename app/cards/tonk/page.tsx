"use client";

import { Bot, Crown, Layers, Play, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Phase = "draw" | "play" | "roundOver";
type MeldType = "set" | "run";

type Card = {
  id: string;
  suit: Suit;
  rank: string;
  value: number;
  points: number;
};

type Meld = {
  id: string;
  owner: number;
  type: MeldType;
  cards: Card[];
};

type Player = {
  name: string;
  hand: Card[];
  isBot: boolean;
  score: number;
  dropped: boolean;
};

const suits: Suit[] = ["♠", "♥", "♦", "♣"];

const ranks = [
  ["A", 1, 1],
  ["2", 2, 2],
  ["3", 3, 3],
  ["4", 4, 4],
  ["5", 5, 5],
  ["6", 6, 6],
  ["7", 7, 7],
  ["8", 8, 8],
  ["9", 9, 9],
  ["10", 10, 10],
  ["J", 11, 10],
  ["Q", 12, 10],
  ["K", 13, 10],
] as const;

function buildDeck() {
  const deck: Card[] = [];

  suits.forEach((suit) => {
    ranks.forEach(([rank, value, points]) => {
      deck.push({
        id: `${rank}${suit}`,
        suit,
        rank,
        value,
        points,
      });
    });
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
  return [...hand].sort((a, b) => {
    if (a.suit === b.suit) return a.value - b.value;
    return a.suit.localeCompare(b.suit);
  });
}

function handPoints(hand: Card[]) {
  return hand.reduce((sum, card) => sum + card.points, 0);
}

function isRed(card: Card) {
  return card.suit === "♥" || card.suit === "♦";
}

function isSet(cards: Card[]) {
  return cards.length >= 3 && cards.every((c) => c.rank === cards[0].rank);
}

function isRun(cards: Card[]) {
  if (cards.length < 3) return false;

  const sorted = [...cards].sort((a, b) => a.value - b.value);
  const sameSuit = sorted.every((c) => c.suit === sorted[0].suit);

  if (!sameSuit) return false;

  return sorted.every((card, index) => {
    if (index === 0) return true;
    return card.value === sorted[index - 1].value + 1;
  });
}

function getMeldType(cards: Card[]): MeldType | null {
  if (isSet(cards)) return "set";
  if (isRun(cards)) return "run";
  return null;
}

function canHitMeld(card: Card, meld: Meld) {
  if (meld.type === "set") {
    return card.rank === meld.cards[0].rank;
  }

  const sorted = [...meld.cards].sort((a, b) => a.value - b.value);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return (
    card.suit === first.suit &&
    (card.value === first.value - 1 || card.value === last.value + 1)
  );
}

function findBestMeld(hand: Card[]) {
  for (const rank of ranks) {
    const cards = hand.filter((c) => c.rank === rank[0]);
    if (cards.length >= 3) return cards.slice(0, 3);
  }

  for (const suit of suits) {
    const suited = hand
      .filter((c) => c.suit === suit)
      .sort((a, b) => a.value - b.value);

    for (let i = 0; i < suited.length; i++) {
      const run = [suited[i]];

      for (let j = i + 1; j < suited.length; j++) {
        if (suited[j].value === run[run.length - 1].value + 1) {
          run.push(suited[j]);
        } else if (suited[j].value > run[run.length - 1].value + 1) {
          break;
        }

        if (run.length >= 3) return run;
      }
    }
  }

  return [];
}

function bestDiscard(hand: Card[]) {
  return [...hand].sort((a, b) => b.points - a.points)[0];
}

function CardFace({
  card,
  small = false,
  back = false,
  selected = false,
  onClick,
}: {
  card?: Card;
  small?: boolean;
  back?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const red = card ? isRed(card) : false;
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? "button" : "img"}
      tabIndex={clickable ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!clickable) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative shrink-0 overflow-hidden rounded-2xl border shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition ${
        small ? "h-[78px] w-[52px]" : "h-[108px] w-[74px]"
      } ${
        selected
          ? "-translate-y-3 border-yellow-300 bg-yellow-100"
          : "border-white/15 bg-[#f4efe6]"
      } ${
        clickable
          ? "cursor-pointer hover:-translate-y-2 active:scale-95"
          : "cursor-default"
      }`}
    >
      {back ? (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,#303030,#080808)] text-white">
          <Sparkles size={small ? 22 : 32} />
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-col justify-between p-2">
          <div
            className={`text-left font-black leading-none ${
              red ? "text-red-600" : "text-black"
            }`}
          >
            <div className={small ? "text-[13px]" : "text-xl"}>
              {card?.rank}
            </div>
            <div className={small ? "text-[12px]" : "text-lg"}>
              {card?.suit}
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center font-black ${
              red ? "text-red-600" : "text-black"
            }`}
          >
            <span className={small ? "text-2xl" : "text-4xl"}>
              {card?.suit}
            </span>
          </div>

          <div
            className={`rotate-180 text-left font-black leading-none ${
              red ? "text-red-600" : "text-black"
            }`}
          >
            <div className={small ? "text-[13px]" : "text-xl"}>
              {card?.rank}
            </div>
            <div className={small ? "text-[12px]" : "text-lg"}>
              {card?.suit}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function TonkPage() {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>("draw");
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [melds, setMelds] = useState<Meld[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("Choose players and start.");
  const [busy, setBusy] = useState(false);

  function startGame(count = playerCount) {
    const shuffled = shuffle(buildDeck());

    const newPlayers: Player[] = Array.from({ length: count }).map((_, i) => ({
      name: i === 0 ? "You" : `Bot ${i}`,
      hand: [],
      isBot: i !== 0,
      score: 0,
      dropped: false,
    }));

    for (let i = 0; i < 5; i++) {
      newPlayers.forEach((player) => {
        const card = shuffled.shift();
        if (card) player.hand.push(card);
      });
    }

    newPlayers.forEach((player) => {
      player.hand = sortHand(player.hand);
    });

    const firstDiscard = shuffled.shift();

    setPlayers(newPlayers);
    setDeck(shuffled);
    setDiscardPile(firstDiscard ? [firstDiscard] : []);
    setMelds([]);
    setSelectedIds([]);
    setTurn(0);
    setPhase("draw");
    setStarted(true);
    setBusy(false);
    setMessage("Your turn. Draw from deck or discard.");
  }

  function endRound(reason: string, finalPlayers = players) {
    const activePlayers = finalPlayers.filter((p) => !p.dropped);
    const ranked = [...activePlayers].sort(
      (a, b) => handPoints(a.hand) - handPoints(b.hand),
    );
    const winner = ranked[0] ?? finalPlayers[0];

    setPlayers(
      finalPlayers.map((player) => ({
        ...player,
        score:
          player.name === winner.name
            ? player.score + 25
            : Math.max(0, player.score - handPoints(player.hand)),
      })),
    );

    setPhase("roundOver");
    setBusy(false);
    setMessage(`${reason} ${winner.name} wins.`);
  }

  function nextTurn(currentPlayers = players) {
    let next = (turn + 1) % currentPlayers.length;

    for (let i = 0; i < currentPlayers.length; i++) {
      if (!currentPlayers[next].dropped) break;
      next = (next + 1) % currentPlayers.length;
    }

    setSelectedIds([]);
    setTurn(next);
    setPhase("draw");
    setMessage(
      next === 0
        ? "Your turn. Draw from deck or discard."
        : `${currentPlayers[next].name} is thinking...`,
    );
  }

  function drawFromDeck(playerIndex: number) {
    if (!started || busy || phase !== "draw" || playerIndex !== turn) return;

    const top = deck[0];

    if (!top) {
      endRound("Deck is empty.");
      return;
    }

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));
    copy[playerIndex].hand = sortHand([...copy[playerIndex].hand, top]);

    setPlayers(copy);
    setDeck(deck.slice(1));
    setPhase("play");
    setMessage(
      playerIndex === 0
        ? "Lay down, hit, or discard."
        : `${copy[playerIndex].name} is playing...`,
    );
  }

  function drawFromDiscard(playerIndex: number) {
    if (!started || busy || phase !== "draw" || playerIndex !== turn) return;

    const top = discardPile[discardPile.length - 1];
    if (!top) return;

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));
    copy[playerIndex].hand = sortHand([...copy[playerIndex].hand, top]);

    setPlayers(copy);
    setDiscardPile(discardPile.slice(0, -1));
    setPhase("play");
    setMessage(
      playerIndex === 0
        ? "Lay down, hit, or discard."
        : `${copy[playerIndex].name} is playing...`,
    );
  }

  function discardCard(playerIndex: number, card: Card) {
    if (!started || busy || phase !== "play" || playerIndex !== turn) return;

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));
    copy[playerIndex].hand = sortHand(
      copy[playerIndex].hand.filter((c) => c.id !== card.id),
    );

    const newDiscard = [...discardPile, card];

    setPlayers(copy);
    setDiscardPile(newDiscard);
    setSelectedIds([]);

    if (copy[playerIndex].hand.length === 0) {
      endRound(`${copy[playerIndex].name} went out.`, copy);
      return;
    }

    nextTurn(copy);
  }

  function toggleSelect(cardId: string) {
    if (turn !== 0 || phase !== "play" || busy) return;

    setSelectedIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId],
    );
  }

  function layDownSelected() {
    if (turn !== 0 || phase !== "play" || busy) return;

    const player = players[0];
    const selectedCards = player.hand.filter((card) =>
      selectedIds.includes(card.id),
    );
    const type = getMeldType(selectedCards);

    if (!type) {
      setMessage("Select 3+ matching ranks or 3+ same-suit run.");
      return;
    }

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));

    copy[0].hand = sortHand(
      copy[0].hand.filter((card) => !selectedIds.includes(card.id)),
    );

    setPlayers(copy);
    setMelds((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        owner: 0,
        type,
        cards: sortHand(selectedCards),
      },
    ]);
    setSelectedIds([]);
    setMessage("Lay down made. You can hit or discard.");

    if (copy[0].hand.length === 0) {
      endRound("You went out.", copy);
    }
  }

  function hitMeld(meldId: string) {
    if (turn !== 0 || phase !== "play" || busy) return;
    if (selectedIds.length !== 1) {
      setMessage("Select 1 card to hit a laydown.");
      return;
    }

    const card = players[0].hand.find((c) => c.id === selectedIds[0]);
    const meld = melds.find((m) => m.id === meldId);

    if (!card || !meld) return;

    if (!canHitMeld(card, meld)) {
      setMessage("That card cannot hit this laydown.");
      return;
    }

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));
    copy[0].hand = sortHand(copy[0].hand.filter((c) => c.id !== card.id));

    setPlayers(copy);
    setMelds((prev) =>
      prev.map((m) =>
        m.id === meldId ? { ...m, cards: sortHand([...m.cards, card]) } : m,
      ),
    );
    setSelectedIds([]);
    setMessage("Hit added. Discard when ready.");

    if (copy[0].hand.length === 0) {
      endRound("You went out.", copy);
    }
  }

  function drop(playerIndex: number) {
    if (!started || busy || playerIndex !== turn) return;

    const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));
    copy[playerIndex].dropped = true;

    const active = copy.filter((p) => !p.dropped);

    setPlayers(copy);
    setSelectedIds([]);

    if (active.length <= 1) {
      endRound(`${copy[playerIndex].name} dropped.`, copy);
      return;
    }

    setMessage(`${copy[playerIndex].name} dropped.`);
    nextTurn(copy);
  }

  function botPlayTurn(botIndex: number) {
    const bot = players[botIndex];
    if (!bot || bot.dropped) return;

    if (phase === "draw") {
      const discard = discardPile[discardPile.length - 1];
      const shouldTakeDiscard =
        discard && bot.hand.some((card) => card.rank === discard.rank);

      if (shouldTakeDiscard) drawFromDiscard(botIndex);
      else drawFromDeck(botIndex);

      return;
    }

    if (phase === "play") {
      const copy = players.map((p) => ({ ...p, hand: [...p.hand] }));
      let nextMelds = [...melds];

      const botMeld = findBestMeld(copy[botIndex].hand);
      const meldType = getMeldType(botMeld);

      if (meldType) {
        copy[botIndex].hand = sortHand(
          copy[botIndex].hand.filter(
            (c) => !botMeld.some((m) => m.id === c.id),
          ),
        );

        nextMelds = [
          ...nextMelds,
          {
            id: crypto.randomUUID(),
            owner: botIndex,
            type: meldType,
            cards: sortHand(botMeld),
          },
        ];
      }

      for (const card of [...copy[botIndex].hand]) {
        const target = nextMelds.find((meld) => canHitMeld(card, meld));

        if (target) {
          copy[botIndex].hand = copy[botIndex].hand.filter(
            (c) => c.id !== card.id,
          );
          nextMelds = nextMelds.map((meld) =>
            meld.id === target.id
              ? { ...meld, cards: sortHand([...meld.cards, card]) }
              : meld,
          );
        }
      }

      setPlayers(copy);
      setMelds(nextMelds);

      if (copy[botIndex].hand.length === 0) {
        endRound(`${copy[botIndex].name} went out.`, copy);
        return;
      }

      const discard = bestDiscard(copy[botIndex].hand);

      setTimeout(() => {
        discardCard(botIndex, discard);
      }, 450);
    }
  }

  useEffect(() => {
    if (!started || busy || phase === "roundOver") return;

    const current = players[turn];

    if (!current || !current.isBot || current.dropped) return;

    const timer = setTimeout(() => {
      botPlayTurn(turn);
    }, 850);

    return () => clearTimeout(timer);
  }, [started, busy, phase, players, turn, discardPile, deck, melds]);

  const myHand = players[0]?.hand ?? [];
  const discardTop = discardPile[discardPile.length - 1];

  const selectedCards = useMemo(
    () => myHand.filter((card) => selectedIds.includes(card.id)),
    [myHand, selectedIds],
  );

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#050505] text-white">
      <div className="flex h-full flex-col px-3 py-3 sm:px-5">
        <header className="flex shrink-0 items-center justify-between rounded-3xl border border-white/10 bg-[#111]/90 px-4 py-3 shadow-2xl">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/45">
              Cards Corner
            </p>
            <h1 className="text-xl font-black uppercase tracking-tight sm:text-3xl">
              Tonk
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

        <section className="mt-3 grid min-h-0 flex-1 grid-rows-[76px_1fr_162px] gap-3">
          <div className="grid grid-cols-4 gap-2">
            {players.length > 0
              ? players.map((p, i) => (
                  <div
                    key={p.name}
                    className={`rounded-2xl border p-2 ${
                      turn === i
                        ? "border-white bg-white text-black"
                        : p.dropped
                          ? "border-red-500/30 bg-red-950/20 text-red-200"
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
                      {p.dropped
                        ? "Dropped"
                        : `Pts ${handPoints(p.hand)} / Score ${p.score}`}
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
              {phase.toUpperCase()}
            </div>

            <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
              {players[turn]?.name ?? "Ready"}
            </div>

            <div className="grid h-full grid-rows-[130px_1fr] gap-3 pt-8">
              <div className="flex items-center justify-center gap-5">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => drawFromDeck(0)}
                    disabled={turn !== 0 || phase !== "draw" || busy}
                    className="disabled:opacity-40"
                  >
                    <CardFace back />
                  </button>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    Deck {deck.length}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  {discardTop ? (
                    <CardFace
                      card={discardTop}
                      onClick={
                        turn === 0 && phase === "draw" && !busy
                          ? () => drawFromDiscard(0)
                          : undefined
                      }
                    />
                  ) : (
                    <CardFace back />
                  )}

                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    Discard
                  </p>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden">
                <p className="mb-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
                  <Layers size={12} /> Lay Downs / Hits
                </p>

                <div className="flex h-[calc(100%-28px)] flex-wrap content-start justify-center gap-2 overflow-hidden">
                  {melds.length > 0 ? (
                    melds.map((meld) => (
                      <button
                        key={meld.id}
                        onClick={() => hitMeld(meld.id)}
                        className="rounded-2xl border border-white/10 bg-black/35 p-2 text-left"
                      >
                        <p className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/35">
                          {players[meld.owner]?.name} {meld.type}
                        </p>

                        <div className="flex gap-1">
                          {meld.cards.slice(0, 6).map((card) => (
                            <span
                              key={card.id}
                              className={`rounded-md bg-white px-1.5 py-1 text-[10px] font-black ${
                                isRed(card) ? "text-red-600" : "text-black"
                              }`}
                            >
                              {card.rank}
                              {card.suit}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                      No lay downs yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 left-4 right-4 text-center">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                {message}
              </p>
            </div>
          </div>

          <div className="min-h-0 rounded-[2rem] border border-white/10 bg-[#101010] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                  Your Hand
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
                  Points {handPoints(myHand)} • Selected {selectedCards.length}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => drop(0)}
                  disabled={turn !== 0 || busy || phase === "roundOver"}
                  className="rounded-full border border-red-400/30 bg-red-950/30 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-red-200 disabled:opacity-30"
                >
                  Drop
                </button>

                <button
                  onClick={layDownSelected}
                  disabled={
                    turn !== 0 ||
                    phase !== "play" ||
                    busy ||
                    selectedCards.length < 3
                  }
                  className="rounded-full border border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/60 disabled:opacity-30"
                >
                  Lay
                </button>

                <button
                  onClick={() => {
                    const card = selectedCards[0];
                    if (card) discardCard(0, card);
                  }}
                  disabled={
                    turn !== 0 ||
                    phase !== "play" ||
                    busy ||
                    selectedCards.length !== 1
                  }
                  className="rounded-full bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-black disabled:opacity-30"
                >
                  Discard
                </button>
              </div>
            </div>

            <div className="flex h-[96px] items-end gap-1 overflow-hidden">
              {myHand.length > 0 ? (
                myHand.map((card) => (
                  <CardFace
                    key={card.id}
                    card={card}
                    small
                    selected={selectedIds.includes(card.id)}
                    onClick={
                      turn === 0 && phase === "play" && !busy
                        ? () => toggleSelect(card.id)
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
      </div>
    </main>
  );
}
