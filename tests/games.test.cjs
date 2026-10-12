const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { makeDeck } = require('../lib/games/cards.ts');
const { createSpades, spadesReducer, legalSpades, trickWinner, scoreSpades } = require('../lib/games/spades.ts');
const { createTonk, tonkReducer, validSpread, points } = require('../lib/games/tonk.ts');
const spadesOptions = { mode: 'solo', difficulty: 'expert', target: 500, jokers: false, nil: true, bagPenalty: true };
const tonkOptions = { mode: 'solo', difficulty: 'expert', players: 3, target: 100, instantTonk: true, dropLimit: 50, waiting: true, unit: 10 };
const card = (suit, rank) => ({ id: `${suit}-${rank}`, suit, rank });
test('both Spades decks have 52 unique cards and deal four equal hands', () => {
  for (const jokers of [false,true]) {
    assert.equal(makeDeck(jokers).length, 52);
    const state = createSpades({ ...spadesOptions, jokers });
    assert.deepEqual(state.players.map(p => p.hand.length), [13,13,13,13]);
    assert.equal(new Set(state.players.flatMap(p => p.hand).map(c => c.id)).size, 52);
  }
});
test('Spades requires following suit and prevents leading unbroken trump', () => {
  const hand = [card('spades',1), card('hearts',4), card('clubs',7)];
  assert.deepEqual(legalSpades(hand, [], false).map(c => c.suit), ['hearts','clubs']);
  assert.deepEqual(legalSpades(hand, [{ seat: 1, card: card('hearts',12) }], true), [hand[1]]);
  assert.equal(trickWinner([{ seat: 0, card: card('hearts',1) }, { seat: 1, card: card('clubs',13) }, { seat: 2, card: card('hearts',2) }]), 0);
});
test('nil, failed contracts and crossing ten bags score correctly', () => {
  const players = [{bid:0,tricks:0},{bid:4,tricks:1},{bid:4,tricks:6},{bid:4,tricks:1}];
  const result = scoreSpades(players,[0,0],[9,0],spadesOptions);
  assert.deepEqual(result.scores,[42,-80]);
  assert.deepEqual(result.bags,[1,0]);
});
test('100 complete bot Spades rounds terminate with exactly 13 books', () => {
  for (let n = 0; n < 100; n++) {
    let state = createSpades({ ...spadesOptions, jokers: n % 2 === 0 || n % 3 === 0, deucesHigh: n % 3 === 0, minTeamBid: n % 3 === 0 ? 4 : 0, nil: n % 3 !== 0 });
    state.players.forEach(p => p.bot = true);
    for (let turn = 0; turn < 100 && !['roundOver','matchOver'].includes(state.phase); turn++) {
      state = spadesReducer(state, { type: state.phase === 'trick' ? 'RESOLVE' : 'BOT' });
    }
    assert.ok(['roundOver','matchOver'].includes(state.phase));
    assert.equal(state.players.reduce((sum,p) => sum + p.tricks,0),13);
    assert.ok(state.players.every(p => p.hand.length === 0));
  }
});
test('Tonk spreads use low aces, unique cards and consecutive ranks', () => {
  assert.ok(validSpread([card('clubs',1),card('clubs',2),card('clubs',3)]));
  assert.ok(!validSpread([card('clubs',12),card('clubs',13),card('clubs',1)]));
  assert.ok(!validSpread([card('clubs',3),card('clubs',3),card('clubs',3)]));
  assert.equal(points([card('clubs',1),card('hearts',13)]),11);
});
test('hood Spades treats 2 hearts as trump and ranks Joker Joker Deuce Deuce', () => {
  const options={...spadesOptions,jokers:true,deucesHigh:true,minTeamBid:4,nil:false};
  assert.equal(trickWinner([{seat:0,card:card('spades',1)},{seat:1,card:card('hearts',2)},{seat:2,card:card('spades',2)},{seat:3,card:card('joker',15)}],options),3);
  const hand=[card('hearts',2),card('clubs',5)];
  assert.deepEqual(legalSpades(hand,[],false,options),[hand[1]]);
  let state=createSpades(options);state.players[2].bid=1;
  assert.equal(spadesReducer(state,{type:'BID',bid:2}),state);
});
test('Tonk catches a tied dropper and pays double from that seat', () => {
  let state = createTonk({...tonkOptions, instantTonk:false});
  state = {...state, turn:0, players:state.players.map((p,i) => ({ ...p, hand:[card(['clubs','hearts','spades'][i], i === 2 ? 9 : 4)] }))};
  const next = tonkReducer(state,{type:'DROP'});
  assert.equal(next.winner,1);
  assert.deepEqual(next.players.map(p => p.score),[-20,30,-10]);
});
test('Tonk rejects a discard before drawing and an immediate return of a picked discard', () => {
  let state = createTonk({...tonkOptions, instantTonk:false});
  assert.equal(tonkReducer(state,{type:'DISCARD',id:state.players[0].hand[0].id}),state);
  const top = state.discard.at(-1);
  state = tonkReducer(state,{type:'DRAW',source:'discard'});
  assert.equal(tonkReducer(state,{type:'DISCARD',id:top.id}),state);
});
test('100 Tonk bot rounds preserve every card, settle, and keep point transfers balanced', () => {
  for (let n = 0; n < 100; n++) {
    let state = createTonk({...tonkOptions,players:2 + n % 3,waiting:n % 2 === 0});
    state.players.forEach(p => p.bot = true);
    let turns = 0;
    while (!['roundOver','matchOver'].includes(state.phase) && turns++ < 2000) {
      state = tonkReducer(state,{type:'BOT'});
      const cards = [...state.deck,...state.discard,...state.players.flatMap(p => p.hand),...state.spreads.flatMap(s => s.cards)];
      assert.equal(cards.length,52); assert.equal(new Set(cards.map(c => c.id)).size,52);
    }
    assert.ok(['roundOver','matchOver'].includes(state.phase), 'bot round should settle');
    assert.equal(state.players.reduce((sum,p) => sum + p.score,0),0);
  }
});
