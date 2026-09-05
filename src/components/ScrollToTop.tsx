import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router SPA navigations don't reset scroll position the way a
 * traditional multi-page site would — navigating from a scrolled-down
 * Home page to /get-quote kept the same scroll offset, landing the new
 * page wherever you happened to be instead of at the top.
 *
 * This resets scroll to the top on every route change. If the URL
 * includes a section hash (e.g. "/#about"), it defers instead —
 * Navigation.tsx already handles scrolling to that specific section,
 * and this would otherwise fight that behavior.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
