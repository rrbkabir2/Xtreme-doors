/**
 * Shared illustration for error states across the site (404, generic
 * runtime errors, etc.) — a puzzled door with blinking eyes, gently
 * creaking open and closed. Keeps every error page visually consistent
 * without duplicating the SVG markup in each one.
 */
const ErrorIllustration = () => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-6 mb-4">
      <span className="text-7xl sm:text-9xl font-bold text-primary/20 leading-none select-none">
        4
      </span>

      <svg
        viewBox="0 0 160 200"
        className="w-24 sm:w-36 h-auto animate-door-creak"
        style={{ transformOrigin: "8px 190px" }}
      >
        {/* Door frame */}
        <rect x="4" y="10" width="140" height="180" rx="4" className="fill-secondary" />
        {/* Door */}
        <rect x="10" y="16" width="128" height="168" rx="3" className="fill-primary" />
        {/* Panel details */}
        <rect x="26" y="32" width="96" height="58" rx="3" className="fill-primary-foreground/10" />
        <rect x="26" y="102" width="96" height="58" rx="3" className="fill-primary-foreground/10" />
        {/* Knob */}
        <circle cx="118" cy="100" r="6" className="fill-accent" />

        {/* Puzzled eyes peeking over the door */}
        <g className="animate-eye-blink" style={{ transformOrigin: "60px 20px" }}>
          <circle cx="60" cy="20" r="11" fill="white" stroke="currentColor" strokeWidth="2" className="text-border" />
          <circle cx="63" cy="17" r="4" className="fill-foreground" />
        </g>
        <g className="animate-eye-blink" style={{ transformOrigin: "95px 14px", animationDelay: "0.15s" }}>
          <circle cx="95" cy="14" r="11" fill="white" stroke="currentColor" strokeWidth="2" className="text-border" />
          <circle cx="91" cy="11" r="4" className="fill-foreground" />
        </g>
      </svg>

      <span className="text-7xl sm:text-9xl font-bold text-primary/20 leading-none select-none">
        4
      </span>
    </div>
  );
};

export default ErrorIllustration;
