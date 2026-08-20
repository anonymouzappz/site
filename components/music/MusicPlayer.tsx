"use client";

import {
  ChevronUp,
  Disc3,
  Music2,
  Pause,
  Play,
  ShoppingBag,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  genre: string;
  isActive: boolean;
  isFeatured: boolean;
  isForSale: boolean;
  price: number;
  previewSeconds: number;
  allowFullPreviewInDev: boolean;
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentTrack = tracks[currentIndex];

  const canPlayFullTrack = useMemo(() => {
    if (!currentTrack) return true;

    if (currentTrack.allowFullPreviewInDev) return true;
    if (!currentTrack.isForSale) return true;

    return false;
  }, [currentTrack]);

  useEffect(() => {
    const q = query(
      collection(db, "musicTracks"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          title: String(data.title || "Untitled Track"),
          artist: String(data.artist || "Nurnrebel"),
          audioUrl: String(data.audioUrl || ""),
          coverUrl: String(data.coverUrl || ""),
          genre: String(data.genre || ""),
          isActive: Boolean(data.isActive ?? true),
          isFeatured: Boolean(data.isFeatured ?? false),
          isForSale: Boolean(data.isForSale ?? false),
          price: Number(data.price || 0),
          previewSeconds: Number(data.previewSeconds || 60),
          allowFullPreviewInDev: Boolean(data.allowFullPreviewInDev ?? false),
        } satisfies MusicTrack;
      });

      setTracks(items.filter((item) => item.audioUrl));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    audioRef.current.src = currentTrack.audioUrl;
    audioRef.current.muted = muted;
    setProgress(0);

    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [currentTrack?.id]);

  function togglePlay() {
    if (!audioRef.current || !currentTrack) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    audioRef.current.play();
    setPlaying(true);
  }

  function toggleMute() {
    if (!audioRef.current) return;

    audioRef.current.muted = !muted;
    setMuted(!muted);
  }

  function selectTrack(index: number) {
    setCurrentIndex(index);
    setOpen(false);
    setPlaying(true);

    setTimeout(() => {
      audioRef.current?.play().catch(() => setPlaying(false));
    }, 50);
  }

  function handleTimeUpdate() {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }

    if (!canPlayFullTrack && audio.currentTime >= currentTrack.previewSeconds) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }

  function handleEnded() {
    if (!tracks.length) return;

    const nextIndex = currentIndex + 1 >= tracks.length ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);

    setTimeout(() => {
      audioRef.current?.play().catch(() => setPlaying(false));
    }, 80);
  }

  if (!tracks.length || !currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {open && (
        <div className="fixed bottom-24 left-5 z-50 w-[min(92vw,420px)] overflow-hidden rounded-[2rem] border border-border bg-background/95 text-foreground shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">
                Nurnrebel Radio
              </p>
              <p className="mt-1 text-xs text-muted">
                {tracks.length} active track{tracks.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-border p-2 text-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {tracks.map((track, index) => {
              const active = index === currentIndex;

              return (
                <button
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  className={`mb-2 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground"
                  }`}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background">
                    {track.coverUrl ? (
                      <Image
                        src={track.coverUrl}
                        alt={track.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Music2 size={20} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black uppercase">
                      {track.title}
                    </p>
                    <p
                      className={`truncate text-xs ${
                        active ? "text-background/70" : "text-muted"
                      }`}
                    >
                      {track.artist} {track.genre ? `• ${track.genre}` : ""}
                    </p>
                  </div>

                  {track.isForSale && (
                    <div className="flex items-center gap-1 rounded-full border border-current px-2 py-1 text-[10px] font-black uppercase">
                      <ShoppingBag size={11} />
                      ${track.price}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="fixed bottom-5 left-5 z-50 overflow-hidden rounded-full border border-border bg-background/85 text-foreground shadow-2xl backdrop-blur-xl">
        <div
          className="h-1 bg-foreground transition-all"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background"
            aria-label="Play music"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="hidden items-center gap-3 sm:flex"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-card">
              {currentTrack.coverUrl ? (
                <Image
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  fill
                  sizes="40px"
                  className={`object-cover ${playing ? "animate-spin-slow" : ""}`}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Disc3 size={18} />
                </div>
              )}
            </div>

            <div className="text-left">
              <p className="max-w-[210px] truncate text-xs font-black uppercase tracking-[0.2em]">
                {currentTrack.title}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                {currentTrack.artist}
                {currentTrack.isForSale && !canPlayFullTrack
                  ? ` • ${currentTrack.previewSeconds}s preview`
                  : ""}
              </p>
            </div>

            <ChevronUp
              size={16}
              className={`text-muted transition ${open ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="text-muted hover:text-foreground sm:hidden"
            aria-label="Open music list"
          >
            <Music2 size={18} />
          </button>

          <button
            onClick={toggleMute}
            className="text-muted hover:text-foreground"
            aria-label="Mute music"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </>
  );
}