import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useLocation } from 'wouter';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Good Form` : 'Good Form — Everyday, considered';
  }, [title]);
}

function scrollWhenReady(id: string) {
  let attempts = 0;
  const attempt = () => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else if (attempts++ < 30) requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}

/** Goes to a section of the home page from anywhere, optionally replacing the shop's filters. */
export function useGoToSection() {
  const [location, navigate] = useLocation();
  return (id: string, query?: Record<string, string>) => {
    if (query) {
      const params = new URLSearchParams(query).toString();
      navigate(params ? `/?${params}` : '/');
    } else if (location !== '/') {
      navigate('/');
    }
    scrollWhenReady(id);
  };
}

// Back and forward should land where the shopper left off, so those navigations don't reset the scroll.
let restoringScroll = false;
window.addEventListener('popstate', () => {
  restoringScroll = true;
  window.setTimeout(() => {
    restoringScroll = false;
  }, 0);
});

/** Starts each new page at the top, and moves focus there so assistive tech follows the change. */
export function useRouteChangeEffects(mainRef: RefObject<HTMLElement | null>) {
  const [location] = useLocation();
  const previous = useRef(location);

  useLayoutEffect(() => {
    if (previous.current === location) return;
    previous.current = location;
    if (!restoringScroll) window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [location, mainRef]);
}
