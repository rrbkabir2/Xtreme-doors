import { useEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useHorizontalScroll
 *
 * Pins `sectionRef` in the viewport and drives horizontal translateX
 * motion on `trackRef` from vertical scroll input, until the track has
 * fully scrolled past — at which point normal vertical scroll resumes.
 *
 * Only active at desktop/tablet widths (min-width: 1024px). Below that,
 * no pin/scrub is applied — the section behaves like normal scrollable
 * content, so the caller is free to lay it out as a regular vertical
 * stack via CSS (e.g. `flex-col lg:flex-row` on the track).
 *
 * Expected structure:
 *   <section ref={sectionRef} className="overflow-hidden">
 *     <div ref={trackRef} className="flex flex-col lg:flex-row"> ...items... </div>
 *   </section>
 */
export function useHorizontalScroll(
  sectionRef: RefObject<HTMLElement>,
  trackRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const getScrollDistance = () =>
          Math.max(0, track.scrollWidth - section.clientWidth);

        const tween = gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // Cleanup for this matchMedia breakpoint specifically — runs
        // automatically when the breakpoint stops matching, or on
        // ctx.revert().
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      // Recalculate distances once images finish loading, since card
      // images shift scrollWidth after they load in.
      const images = Array.from(track.querySelectorAll("img"));
      let pendingImages = images.filter((img) => !img.complete).length;

      const handleImageLoad = () => {
        pendingImages -= 1;
        if (pendingImages <= 0) ScrollTrigger.refresh();
      };

      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", handleImageLoad, { once: true });
        }
      });

      // Recalculate after web fonts finish loading (font swaps can
      // change text/card widths).
      if ("fonts" in document) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        images.forEach((img) =>
          img.removeEventListener("load", handleImageLoad)
        );
      };
    }, section);

    // Kill every ScrollTrigger/tween created in this context and undo
    // any inline styles GSAP applied, on unmount.
    return () => ctx.revert();
  }, [sectionRef, trackRef]);
}
