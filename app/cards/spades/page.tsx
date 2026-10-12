import CardTable from '@/components/games/CardTable';
export const metadata = { title: "Spades | Cards Corner", description: "Play Spades with hood rules, bots, local pass-and-play, and private online rooms." };
export default function GamePage() { return <CardTable kind="spades" />; }
