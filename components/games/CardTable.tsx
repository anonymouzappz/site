"use client";
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, ChevronLeft, Crown, HelpCircle, Pause, Play, Settings2, Shield, Trophy, Volume2, VolumeX } from 'lucide-react';
import { useOnlineRoom } from '@/lib/games/useOnlineRoom';
import { Card, rankLabel, suitSymbol } from '@/lib/games/cards';
import { createSpades, legalSpades, spadesReducer, SpadesAction, SpadesOptions, SpadesState } from '@/lib/games/spades';
import { canHit, createTonk, points, tonkReducer, TonkAction, TonkOptions, TonkState, validSpread } from '@/lib/games/tonk';
import './card-table.css';
type Game = SpadesState | TonkState;
type Kind = Game['kind'];
const spadesDefaults: SpadesOptions = { mode: 'solo', difficulty: 'balanced', target: 500, jokers: false, nil: true, bagPenalty: true };
const tonkDefaults: TonkOptions = { mode: 'solo', difficulty: 'balanced', players: 3, target: 100, instantTonk: true, dropLimit: 50, waiting: false, unit: 10 };

function CardFace({ card, selected = false, disabled = false, onClick, back = false }: { card?: Card; selected?: boolean; disabled?: boolean; onClick?: () => void; back?: boolean }) {
  const red = card?.suit === 'hearts' || card?.suit === 'diamonds';
  return <button type="button" disabled={disabled || !onClick} onClick={onClick}
    aria-label={back ? 'Draw from stock' : card ? `${rankLabel(card)} of ${card.suit}` : 'Card'} aria-pressed={onClick ? selected : undefined}
    className={`playing-card ${red ? 'red-card' : ''} ${selected ? 'selected-card' : ''} ${back ? 'card-back' : ''} ${disabled ? 'illegal-card' : ''}`}>
    {back ? <span className="card-back-mark">XNX</span> : card && <>
      <span className="card-corner">{rankLabel(card)}<small>{suitSymbol[card.suit]}</small></span>
      <span className="card-pip">{suitSymbol[card.suit]}</span>
      <span className="card-corner card-bottom">{rankLabel(card)}<small>{suitSymbol[card.suit]}</small></span>
    </>}
  </button>;
}

export default function CardTable({ kind }: { kind: Kind }) {
  const [localGame, setGame] = useState<Game | null>(null);
  const online = useOnlineRoom(kind);
  const game = online.room ? online.room.game : localGame;
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('Player');
  const [fillBots, setFillBots] = useState(true);
  const [spadesOptions, setSpadesOptions] = useState(spadesDefaults);
  const [tonkOptions, setTonkOptions] = useState(tonkDefaults);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [reveal, setReveal] = useState('');
  const [bid, setBid] = useState(3);
  const [speed, setSpeed] = useState(850);
  const [notice, setNotice] = useState('');
  const storageKey = `xnx_${kind}_v3`;
  useEffect(() => {
    Promise.resolve().then(() => {
      const invite = new URLSearchParams(window.location.search).get("room");
      if (invite) { setRoomCode(invite.toUpperCase()); setLobbyOpen(true); }
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved?.kind === kind && Array.isArray(saved.players) && saved.players.length >= 2 && saved.players.every((p: { hand?: Card[] }) => Array.isArray(p.hand)) && saved.options && saved.phase) {
          setGame(saved); setPaused(true); setNotice('Saved table restored. Resume when ready.');
          if (kind === 'spades') setSpadesOptions(saved.options); else setTonkOptions(saved.options);
        }
      } catch { /* An invalid saved table can be replaced by a new match. */ }
    });
  }, [kind, storageKey]);
  useEffect(() => { if (localGame) localStorage.setItem(storageKey, JSON.stringify(localGame)); }, [localGame, storageKey]);
  const apply = useCallback((action: SpadesAction | TonkAction) => {
    setSelected([]);
    setGame(previous => previous ? previous.kind === 'spades' ? spadesReducer(previous, action as SpadesAction) : tonkReducer(previous, action as TonkAction) : null);
  }, []);
  useEffect(() => {
    if (!game || online.room || paused || optionsOpen || rulesOpen) return;
    if (game.kind === 'spades' && game.phase === 'trick') {
      const timer = setTimeout(() => apply({ type: 'RESOLVE' }), speed + 300); return () => clearTimeout(timer);
    }
    if (!['play','draw','bid'].includes(game.phase) || !game.players[game.turn]?.bot) return;
    const timer = setTimeout(() => apply({ type: 'BOT' }), speed); return () => clearTimeout(timer);
  }, [game, online.room, paused, optionsOpen, rulesOpen, speed, apply]);

  function playSound() {
    if (!sound) return;
    try {
      const context = new AudioContext(), oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.connect(gain); gain.connect(context.destination); oscillator.frequency.setValueAtTime(440, context.currentTime);
      gain.gain.setValueAtTime(.035, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .08);
      oscillator.start(); oscillator.stop(context.currentTime + .08); oscillator.onended = () => { context.close(); };
    } catch { /* Sound is optional. */ }
  }
  function act(action: SpadesAction | TonkAction) { playSound(); setNotice(''); if (online.room) { setSelected([]); online.send(action); } else apply(action); }
  function newMatch() {
    if ((kind === 'spades' ? spadesOptions : tonkOptions).mode === 'online') { setLobbyOpen(true); setOptionsOpen(false); return; }
    online.disconnect();
    setGame(kind === 'spades' ? createSpades(spadesOptions) : createTonk(tonkOptions));
    setPaused(false); setOptionsOpen(false); setSelected([]); setReveal(''); setNotice('');
  }
  const player = game?.players[game.turn];
  const ended = game?.phase === 'roundOver' || game?.phase === 'matchOver';
  const local = game?.options.mode === 'local';
  const revealKey = game ? `${game.round}:${game.turn}` : '';
  const visibleSeat = online.room ? online.room.mySeat : local ? game?.turn || 0 : 0;
  const hand = game?.players[visibleSeat]?.hand || [];
  const hidden = local && !ended && reveal !== revealKey;
  const humanTurn = Boolean(game && !player?.bot && (!paused || Boolean(online.room)) && !hidden && !ended && !online.sending && (!online.room || online.room.status === 'playing' && online.room.mySeat === game?.turn));
  const legal = game?.kind === 'spades' && game.phase === 'play' ? legalSpades(hand, game.trick, game.broken, game.options).map(c => c.id) : [];
  const partnerBid = game?.kind === 'spades' ? game.players[(game.turn + 2) % 4].bid : null;
  const minimumBid = game?.kind === 'spades' && partnerBid !== null ? Math.max(game.options.nil ? 0 : 1, (game.options.minTeamBid || 0) - partnerBid) : game?.kind === 'spades' && !game.options.nil ? 1 : 0;
  const selectedCards = hand.filter(c => selected.includes(c.id));
  const title = kind === 'spades' ? 'Spades' : 'Tonk';
  const options = kind === 'spades' ? spadesOptions : tonkOptions;
  const patchShared = (field: 'mode' | 'difficulty' | 'target', value: string | number) => {
    setSpadesOptions(current => ({ ...current, [field]: value })); setTonkOptions(current => ({ ...current, [field]: value }));
  };
  return <div className="card-game">
    <header className="game-toolbar">
      <div className="flex items-center gap-3"><Link href="/cards" aria-label="Back to Cards Corner" className="game-icon"><ChevronLeft size={20} /></Link><div><p className="game-eyebrow">Nurnrebel / XNX · Cards Corner</p><h1>{title}<span className="game-title-dot">.</span></h1></div></div>
      <div className="flex flex-wrap items-center gap-2">
        {game && !online.room && <button className="game-icon" onClick={() => { setPaused(!paused); setNotice(''); }} aria-label={paused ? 'Resume game' : 'Pause game'}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>}
        <button className="game-icon" onClick={() => setSound(!sound)} aria-label={sound ? 'Mute sound' : 'Enable sound'}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button className="game-icon" onClick={() => setRulesOpen(true)} aria-label="Game rules"><HelpCircle size={18} /></button>
        <button className="game-button secondary" onClick={() => setOptionsOpen(true)}><Settings2 size={16} /> Options</button>
      </div>
    </header>
    {online.message && <p className="room-error" role="alert">{online.message}</p>}
    {online.room && <div className="online-room-bar"><span><b>Room {online.room.code}</b> · {online.connected ? 'Connected' : 'Reconnecting'}</span><button className="game-button secondary" onClick={() => setLobbyOpen(true)}>Room</button><button className="game-button secondary" onClick={online.disconnect}>Leave table</button></div>}
    {!game ? <section className="game-welcome"><div className="welcome-content"><p className="game-eyebrow">Your seat is waiting</p><h2>{kind === 'spades' ? 'Make your bid.\nOwn the table.' : 'Five cards.\nEvery move counts.'}</h2><p>{kind === 'spades' ? 'Partner up, read the room, and bring home your books.' : 'Build your spreads, hit the table, and know when to drop.'}</p><button className="game-button" onClick={() => setOptionsOpen(true)}><Play size={18} /> Set up your table</button><div className="welcome-tags"><span>Smart opponents</span><span>House rules</span><span>Saved matches</span></div></div></section> : <>
      <section className="game-scorebar">
        <span className="game-pill">Round {game.round}</span><span className="game-pill">{game.options.mode === 'solo' ? 'Solo vs bots' : game.options.mode === 'online' ? 'Online room' : 'Pass & play'}</span><span className="game-pill">{game.options.difficulty}</span>
        {game.kind === 'spades' ? <><strong>North {game.scores[0]} <small>({game.bags[0]} bags)</small></strong><strong>South {game.scores[1]} <small>({game.bags[1]} bags)</small></strong><span>Race to {game.options.target}</span></> : <span>Race to {game.options.target} · {game.options.unit} points per win</span>}
      </section>
      <div className="game-layout">
        <section className="game-play-area">
          <div className="game-seats">{game.players.map((seat,i) => <div key={i} className={`game-seat ${game.turn === i && !ended ? 'active-seat' : ''}`}>
            <div className="seat-avatar">{seat.bot ? <Bot size={20} /> : <Crown size={20} />}</div><div><strong>{seat.name}</strong><small>{game.kind === 'spades' ? `${i % 2 === 0 ? 'North' : 'South'} · bid ${game.players[i].bid === null ? '—' : game.players[i].bid === 0 ? 'Nil' : game.players[i].bid} · ${game.players[i].tricks} books` : `${game.players[i].score} points${game.players[i].wait ? ` · wait ${game.players[i].wait}` : ''}`}</small></div><span className="seat-count">{seat.hand.length}<small>cards</small></span>
          </div>)}</div>
          <div className="felt-table">
            <div className="felt-watermark">XNX<span>CARDS CORNER</span></div>
            {game.kind === 'spades' ? <>
              <div className="table-status"><span>{game.broken ? 'Spades broken' : 'Spades unbroken'}</span><span>{game.phase === 'bid' ? 'Bidding' : `Book ${game.players.reduce((sum,p) => sum + p.tricks, 0) + (ended ? 0 : 1)} / 13`}</span></div>
              <div className="trick-cards">{game.trick.map(play => <div className="trick-card" key={play.seat}><CardFace card={play.card} /><small>{game.players[play.seat].name}</small></div>)}</div>
              {!game.trick.length && <p className="table-prompt">{game.phase === 'bid' ? 'Bids are in. Strategy begins.' : 'Lead the next book.'}</p>}
            </> : <>
              <div className="table-status"><span>Stock {game.deck.length}</span><span>{game.phase === 'draw' ? 'Draw or drop' : game.phase === 'play' ? 'Spread, hit, or discard' : 'Round settled'}</span></div>
              <div className="stock-piles"><div><CardFace back onClick={humanTurn && game.phase === 'draw' ? () => act({ type: 'DRAW', source: 'deck' }) : undefined} /><small>Draw stock</small></div><div><CardFace card={game.discard.at(-1)} onClick={humanTurn && game.phase === 'draw' ? () => act({ type: 'DRAW', source: 'discard' }) : undefined} /><small>Take discard</small></div></div>
              <div className="table-spreads">{game.spreads.map(spread => <button key={spread.id} className="spread-group" disabled={!humanTurn || game.phase !== 'play' || selectedCards.length !== 1 || !canHit(selectedCards[0], spread)} onClick={() => act({ type: 'HIT', id: selectedCards[0].id, spread: spread.id })}><small>{game.players[spread.owner].name}&apos;s spread</small><span>{spread.cards.map(c => <b key={c.id} className={c.suit === 'hearts' || c.suit === 'diamonds' ? 'red-card' : ''}>{rankLabel(c)}{suitSymbol[c.suit]}</b>)}</span></button>)}</div>
            </>}
          </div>
          <div className="hand-panel">
            <div className="hand-heading"><div><p className="game-eyebrow">{local ? game.players[visibleSeat].name : 'Your hand'}</p><h3>{hidden ? 'Your cards are private' : game.kind === 'tonk' ? `${points(hand)} points in hand` : humanTurn ? game.phase === 'bid' ? 'Place your bid' : 'Your move' : 'Watch the table'}</h3></div><span className="game-pill">{player?.name}&apos;s turn</span></div>
            {hidden ? <div className="private-hand"><Shield size={30} /><p>Pass the device to {player?.name}.</p><button className="game-button" onClick={() => setReveal(revealKey)}>Reveal my hand</button></div> : <>
              <div className="hand-cards">{hand.map(card => <CardFace key={card.id} card={card} selected={selected.includes(card.id)} disabled={!humanTurn || (game.kind === 'spades' && game.phase === 'play' && !legal.includes(card.id))}
                onClick={humanTurn ? () => { if (game.kind === 'spades') { if(game.phase === 'play') act({ type: 'PLAY', id: card.id }); } else if(game.phase === 'play') setSelected(current => current.includes(card.id) ? current.filter(id => id !== card.id) : [...current, card.id]); } : undefined} />)}</div>
              {game.kind === 'spades' && humanTurn && game.phase === 'bid' && <div className="game-actions"><label htmlFor="bid">Your bid</label><select id="bid" value={Math.max(bid, minimumBid)} onChange={event => setBid(Number(event.target.value))}>{Array.from({ length: 14 }, (_,i) => i).filter(i => i >= minimumBid).map(i => <option value={i} key={i}>{i === 0 ? 'Nil (0)' : i}</option>)}</select><button className="game-button" onClick={() => act({ type: 'BID', bid: Math.max(bid, minimumBid) })}>Lock bid</button></div>}
              {game.kind === 'tonk' && <div className="game-actions"><button className="game-button secondary" disabled={!humanTurn || game.phase !== 'draw' || points(hand) > game.options.dropLimit || game.players[game.turn].wait > 0} onClick={() => act({ type: 'DROP' })}>Drop</button><button className="game-button secondary" disabled={!humanTurn || game.phase !== 'play' || !validSpread(selectedCards)} onClick={() => act({ type: 'SPREAD', ids: selected })}>Lay spread</button><button className="game-button" disabled={!humanTurn || game.phase !== 'play' || selectedCards.length !== 1 || selected[0] === game.drawnDiscard} onClick={() => act({ type: 'DISCARD', id: selected[0] })}>Discard selected</button><small>Select cards to lay a spread, or one card to hit a spread above.</small></div>}
            </>}
          </div>
        </section>
        <aside className="game-sidebar"><div className="sidebar-title"><Trophy size={18} /><h3>Table notes</h3></div><p className="game-live" role="status">{online.message || notice || (paused && !online.room ? 'Match paused. Resume to continue.' : ended ? game.result : player?.bot ? `${player.name} is thinking…` : hidden ? 'Pass the device to the next player.' : humanTurn ? 'Your turn. Choose your next move.' : `Waiting for ${player?.name}.`)}</p>
          {game.kind === 'spades' ? <div className="rules-summary"><p>{game.options.deucesHigh ? 'Hood: Joker–Joker–Deuce–Deuce' : game.options.jokers ? 'Jokers high' : 'Standard deck'}</p><p>Minimum team bid: {game.options.minTeamBid || 'none'}</p><p>North: seats 1 & 3</p><p>South: seats 2 & 4</p><p>Contract: 10 × bid</p><p>Nil: +100 / −100</p><p>Ten bags: {game.options.bagPenalty ? '−100' : 'penalty off'}</p></div> : <div className="rules-summary"><p>Ace low · faces count 10</p><p>Opening 49 / 50: {game.options.instantTonk ? 'double win' : 'off'}</p><p>Drop at {game.options.dropLimit} or fewer</p><p>Waiting rule: {game.options.waiting ? '3 turns after spreading; +1 when hit' : 'off'}</p><p>Ties catch the dropper. Closest low hand left of dealer wins.</p></div>}
          <ol className="game-log" aria-label="Game history">{game.log.slice(-8).map((entry,i) => <li key={`${entry}-${i}`}>{entry}</li>)}</ol>
          {local && !hidden && <button className="game-button secondary" onClick={() => setReveal('')}>Hide my hand</button>}
        </aside>
      </div>
      {ended && <section className="round-result"><Trophy size={28} /><h2>{game.result}</h2><div className="round-hands">{game.players.map((p,i) => <div key={i}><strong>{p.name}</strong><p>{game.kind === 'tonk' ? `${points(p.hand)} in hand · ${game.players[i].score} match points` : `${game.players[i].bid === 0 ? 'Nil' : game.players[i].bid} bid · ${game.players[i].tricks} books`}</p>{p.hand.length > 0 && <small>{p.hand.map(c => `${rankLabel(c)}${suitSymbol[c.suit]}`).join(' ')}</small>}</div>)}</div><button className="game-button" disabled={Boolean(online.room && !online.room.host)} onClick={() => game.phase === 'roundOver' ? act({ type: 'NEXT' }) : setOptionsOpen(true)}>{game.phase === 'roundOver' ? 'Deal next round' : 'Start a new match'}</button></section>}
    </>}
    {lobbyOpen && <div className="game-modal-backdrop"><section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="room-title"><div className="modal-heading"><h2 id="room-title">Online {title} room</h2><button className="game-icon" aria-label="Close room panel" onClick={() => setLobbyOpen(false)}>×</button></div>
      {online.message && <p role="alert" className="room-error">{online.message} <Link href="/auth" className="underline">Sign in</Link></p>}
      {online.room ? <><p className="room-code">{online.room.code}</p><p className="text-sm text-white/60">Share this code. Private hands stay on the server; only your own cards are sent to your device.</p><div className="room-seats">{online.room.seats.map((seat,i) => <p key={i}><b>Seat {i + 1}</b> {seat.occupied ? seat.name : online.room?.fillBots ? 'Open / bot if unfilled' : 'Waiting for player'}</p>)}</div><button className="game-button secondary" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/cards/${kind}?room=${online.room!.code}`); setNotice('Invite link copied.'); }}>Copy invite link</button>{notice && <p role="status">{notice}</p>}{online.room.status === 'lobby' && online.room.host && <button className="game-button ml-2" disabled={online.sending || online.room.seats.filter(s=>s.occupied).length < 2} onClick={() => online.start()}>Start table</button>}{online.room.status === 'playing' && <button className="game-button ml-2" onClick={() => setLobbyOpen(false)}>Return to game</button>}{online.room.host && <button className="game-button secondary mt-4" onClick={() => online.close()}>Close room</button>}</> : <><label className="room-field">Your table name<input value={playerName} maxLength={24} onChange={e=>setPlayerName(e.target.value)} /></label><label className="toggle-option"><input type="checkbox" checked={fillBots} onChange={e=>setFillBots(e.target.checked)} /> Fill empty seats with bots</label><button className="game-button my-5" disabled={online.sending} onClick={() => { setPaused(false); online.create(kind === 'spades' ? spadesOptions : tonkOptions,playerName,fillBots); }}>Create room with these rules</button><hr className="border-white/10" /><label className="room-field mt-5">Room code<input value={roomCode} maxLength={12} onChange={e=>setRoomCode(e.target.value.toUpperCase())} placeholder="12-character room code" /></label><button className="game-button secondary" disabled={online.sending || !roomCode} onClick={() => online.join(roomCode,playerName)}>Join room</button><p className="mt-4 text-xs text-white/40">At least two people are needed to start. Sign in or use a guest session. Your room saves for reconnection on this device.</p></>}
    </section></div>}
    {(optionsOpen || !game && optionsOpen) && <div className="game-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="options-title" className="game-modal"><div className="modal-heading"><h2 id="options-title">Your table. Your rules.</h2><button aria-label="Close options" className="game-icon" onClick={() => setOptionsOpen(false)}>×</button></div>
      <p className="text-sm text-white/50">House rules vary by table. Choose Hood rules or adjust each switch. Options apply to a new match. Your current match stays saved until you start.</p>
      <div className="preset-buttons"><button className="game-button secondary" onClick={() => kind === 'spades' ? setSpadesOptions({...spadesDefaults,mode:options.mode}) : setTonkOptions({...tonkDefaults,mode:options.mode})}>Classic rules</button><button className="game-button" onClick={() => kind === 'spades' ? setSpadesOptions({...spadesDefaults,mode:options.mode,jokers:true,deucesHigh:true,nil:false,bagPenalty:false,minTeamBid:4}) : setTonkOptions({...tonkDefaults,mode:options.mode,dropLimit:10,waiting:true,instantLow:true})}>Hood rules</button></div>
      <div className="options-grid"><label>Game mode<select value={options.mode} onChange={e => patchShared('mode', e.target.value)}><option value="solo">Solo vs bots</option><option value="local">Local pass & play</option><option value="online">Online multiplayer room</option></select></label><label>Bot difficulty<select value={options.difficulty} onChange={e => patchShared('difficulty',e.target.value)}><option value="easy">Easy</option><option value="balanced">Balanced</option><option value="expert">Expert</option></select></label><label>Winning score<select value={options.target} onChange={e => patchShared('target',Number(e.target.value))}>{(kind === 'spades' ? [250,350,500,750] : [50,100,200]).map(n => <option key={n} value={n}>{n} points</option>)}</select></label><label>Table pace<select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={350}>Quick</option><option value={850}>Normal</option><option value={1500}>Relaxed</option></select></label>
      {kind === 'spades' ? <><label className="toggle-option"><input type="checkbox" checked={spadesOptions.jokers} onChange={e => setSpadesOptions(o => ({ ...o, jokers: e.target.checked, deucesHigh: e.target.checked && o.deucesHigh }))} /> Jokers (replace 2♣ and 2♦)</label><label className="toggle-option"><input type="checkbox" checked={Boolean(spadesOptions.deucesHigh)} onChange={e => setSpadesOptions(o => ({ ...o, deucesHigh:e.target.checked,jokers:e.target.checked || o.jokers }))} /> Joker–Joker–Deuce–Deuce</label><label>Minimum team bid<select value={spadesOptions.minTeamBid || 0} onChange={e => setSpadesOptions(o => ({ ...o,minTeamBid:Number(e.target.value) }))}><option value={0}>No minimum</option><option value={4}>4 books (board)</option><option value={5}>5 books</option></select></label><label className="toggle-option"><input type="checkbox" checked={spadesOptions.nil} onChange={e => setSpadesOptions(o => ({ ...o, nil: e.target.checked }))} /> Nil bids</label><label className="toggle-option"><input type="checkbox" checked={spadesOptions.bagPenalty} onChange={e => setSpadesOptions(o => ({ ...o, bagPenalty: e.target.checked }))} /> Ten-bag penalty</label></> : <><label>Players<select value={tonkOptions.players} onChange={e => setTonkOptions(o => ({ ...o, players: Number(e.target.value) }))}>{[2,3,4].map(n => <option key={n} value={n}>{n} players</option>)}</select></label><label>Drop ceiling<select value={tonkOptions.dropLimit} onChange={e => setTonkOptions(o => ({ ...o, dropLimit: Number(e.target.value) }))}><option value={50}>Any total</option><option value={10}>10 or fewer</option><option value={5}>5 or fewer</option></select></label><label className="toggle-option"><input type="checkbox" checked={tonkOptions.instantTonk} onChange={e => setTonkOptions(o => ({ ...o, instantTonk: e.target.checked }))} /> Opening 49 / 50 Tonk</label><label className="toggle-option"><input type="checkbox" checked={tonkOptions.waiting} onChange={e => setTonkOptions(o => ({ ...o, waiting: e.target.checked }))} /> Wait after spreads / hits</label><label className="toggle-option"><input type="checkbox" checked={Boolean(tonkOptions.instantLow)} onChange={e => setTonkOptions(o => ({ ...o,instantLow:e.target.checked }))} /> Opening 9 or fewer wins triple</label></>}
      </div><button className="game-button w-full" onClick={newMatch}><Play size={18} />{game ? 'Start a new match' : 'Deal me in'}</button><p className="mt-4 text-xs text-white/40">{game ? 'Starting a new match replaces the saved match.' : 'Play for points. Progress saves on this device.'}</p>
    </section></div>}
    {rulesOpen && <div className="game-modal-backdrop"><section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title"><div className="modal-heading"><h2 id="rules-title">How to play {title}</h2><button className="game-icon" aria-label="Close rules" onClick={() => setRulesOpen(false)}>×</button></div>
      {kind === 'spades' ? <div className="game-rule-copy"><p>Four seats, two partnerships. Each player receives 13 cards and bids how many books they expect to win. Partners sit opposite each other.</p><p>Follow the led suit whenever possible. Spades are trump. You cannot lead trump until it has been played on another suit, unless your hand contains only trump. Highest trump wins; otherwise the highest card of the led suit wins.</p><p>Make the partnership bid to earn 10 points per bid plus one per overtrick. Miss it and lose 10 points per bid. Successful nil earns 100; a failed nil loses 100. Nil tricks do not help your partner make the contract and count as bags.</p><p>With jokers enabled, remove 2♣ and 2♦. Big Joker beats Little Joker, then A♠ through 2♠. Jokers follow the trump suit. Hood Joker–Joker–Deuce–Deuce ranks Big Joker, Little Joker, 2♠, 2♥, then A♠ down. The 2♥ is trump and does not follow hearts. The second partner must meet the configured minimum team bid. Ten bags cost 100 when the penalty is enabled. Highest team score wins once a team reaches the target; ties play another round.</p></div> : <div className="game-rule-copy"><p>Each player gets five cards. Aces count one, faces count ten. Draw from stock or take the top discard, then lay spreads, hit spreads, and discard one card.</p><p>A spread is three or four equal ranks, or three or more consecutive cards of one suit. Aces stay low. A hit extends a spread on the table. You cannot immediately discard the card you just took from the discard pile.</p><p>Drop at the start of your turn when you believe your total is strictly lower than everyone else. Ties catch you. This table uses a house rule: the lowest opponent collects double from the dropper and the usual points from everyone else; low ties go to the first eligible seat left of dealer.</p><p>Going out without a discard or opening with 49 / 50 wins double. Discarding your last card wins the usual points. If low-Tonk is enabled, opening with 9 or fewer wins triple. Multiple opening Tonks draw the round. Empty stock settles the lowest hand; tied low hands draw. With waiting enabled, a new spread blocks dropping on your next three turns; being hit adds one waiting turn. Playing every card always wins.</p></div>}
      <button className="game-button mt-6" onClick={() => setRulesOpen(false)}>Back to the table</button>
    </section></div>}
  </div>;
}
