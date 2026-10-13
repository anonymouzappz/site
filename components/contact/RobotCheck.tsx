"use client";
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, options: { sitekey: string; size: 'compact'; theme: 'dark' | 'light'; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => number;
      reset: (id: number) => void;
    };
  }
}
export default function RobotCheck({ onToken, reset }: { onToken: (token: string) => void; reset: number }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const container = useRef<HTMLDivElement>(null), widget = useRef<number | null>(null);
  const callback = useRef(onToken);
  const [ready, setReady] = useState(false), [error, setError] = useState('');
  useEffect(() => { callback.current = onToken; }, [onToken]);
  useEffect(() => {
    if (!ready || !siteKey) return;
    let active = true;
    window.grecaptcha?.ready(() => {
      if (!active || !container.current || widget.current !== null) return;
      try {
        widget.current = window.grecaptcha!.render(container.current, {
          sitekey: siteKey, size: 'compact', theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          callback: token => { callback.current(token); setError(''); },
          'expired-callback': () => { callback.current(''); setError('Robot check expired. Please complete it again.'); },
          'error-callback': () => { callback.current(''); setError('Robot check could not load. Check your connection or refresh this page.'); },
        });
      } catch { setError('Robot check could not load. Please refresh this page.'); }
    });
    return () => { active = false; };
  }, [ready, siteKey]);
  useEffect(() => {
    if (reset > 0 && widget.current !== null) window.grecaptcha?.reset(widget.current);
  }, [reset]);
  if (!siteKey) return <p role="status" className="text-sm text-muted">The robot check is being set up. Please use one of the contact email addresses above.</p>;
  return <div aria-label="Robot verification">
    <Script id="contact-recaptcha" src="https://www.google.com/recaptcha/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { callback.current(''); setError('Robot check could not load. Please refresh or use a contact email address.'); }}/>
    <div ref={container}/>
    {!ready && !error && <p className="text-sm text-muted" role="status">Loading robot check…</p>}
    {error && <p className="mt-2 text-sm text-muted" role="alert">{error}</p>}
  </div>;
}
