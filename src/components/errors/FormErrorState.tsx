import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface FormErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

/**
 * Compact, inline version of the site's door-themed error illustration,
 * for use INSIDE a page (e.g. replacing a form after a failed submit)
 * rather than swapping the whole page like NotFound/ErrorBoundary do.
 * A full-page error would be too disruptive for something like "the
 * quote request failed to send" — the user should be able to see the
 * error and immediately try again without losing their place.
 */
const FormErrorState = ({
  title = "Couldn't send your request",
  description = "Something went wrong on our end. Please try again — if it keeps happening, call or email us directly.",
  onRetry,
}: FormErrorStateProps) => {
  return (
    <div className="text-center py-10 px-4">
      <svg viewBox="0 0 160 200" className="w-16 h-auto mx-auto mb-4 animate-door-creak" style={{ transformOrigin: "8px 190px" }}>
        <rect x="4" y="10" width="140" height="180" rx="4" className="fill-secondary" />
        <rect x="10" y="16" width="128" height="168" rx="3" className="fill-primary" />
        <rect x="26" y="32" width="96" height="58" rx="3" className="fill-primary-foreground/10" />
        <rect x="26" y="102" width="96" height="58" rx="3" className="fill-primary-foreground/10" />
        <circle cx="118" cy="100" r="6" className="fill-accent" />
        <g className="animate-eye-blink" style={{ transformOrigin: "60px 20px" }}>
          <circle cx="60" cy="20" r="11" fill="white" stroke="currentColor" strokeWidth="2" className="text-border" />
          <circle cx="63" cy="17" r="4" className="fill-foreground" />
        </g>
        <g className="animate-eye-blink" style={{ transformOrigin: "95px 14px", animationDelay: "0.15s" }}>
          <circle cx="95" cy="14" r="11" fill="white" stroke="currentColor" strokeWidth="2" className="text-border" />
          <circle cx="91" cy="11" r="4" className="fill-foreground" />
        </g>
      </svg>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>

      <Button onClick={onRetry}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
};

export default FormErrorState;
