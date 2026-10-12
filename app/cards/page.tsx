import Link from "next/link";
import { Crown, Spade, Sparkles, Users } from "lucide-react";

const games = [
  {
    title: "Spades",
    href: "/cards/spades",
    desc: "Team-based trick-taking card game with bids, bags, books, and strategy.",
    tag: "4 seats · Solo, local & online",
  },
  {
    title: "Tonk",
    href: "/cards/tonk",
    desc: "Street-style five-card action with drops, spreads, hits, and hood house rules.",
    tag: "2–4 seats · Solo, local & online",
  },
];

export default function CardsCornerPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 rounded-[2rem] border border-border bg-[linear-gradient(90deg,rgba(7,16,14,.95),rgba(7,16,14,.35)),url(/assets/cards-corner-hero.png)] bg-cover bg-center p-8 py-20 md:p-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted">
            <Sparkles size={14} />
            Cards Corner
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
            Pick Your Table
          </h1>

          <p className="mt-5 text-lg leading-8 text-muted">
            Your seat at the Nurnrebel card club. Play Spades and Tonk with smart
            opponents, online rooms, local pass-and-play, hood rules, and saved matches.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 transition hover:-translate-y-1 hover:border-foreground"
            >
              <div className="absolute right-6 top-6 opacity-10 transition group-hover:opacity-20">
                {game.title === "Spades" ? (
                  <Spade size={120} />
                ) : (
                  <Crown size={120} />
                )}
              </div>

              <div className="relative z-10">
                <div className="mb-8 inline-flex rounded-full bg-foreground px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-background">
                  {game.tag}
                </div>

                <h2 className="text-4xl font-black uppercase tracking-tight">
                  {game.title}
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                  {game.desc}
                </p>

                <div className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em]">
                  <Users size={16} />
                  Enter Game
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}