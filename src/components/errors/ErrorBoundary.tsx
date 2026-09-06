import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw } from "lucide-react";
import ErrorIllustration from "@/components/errors/ErrorIllustration";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches unexpected runtime errors anywhere in the component tree
 * below it and shows the same on-brand illustration used on the 404
 * page, instead of a blank white screen or a raw React error overlay.
 *
 * React error boundaries only work as class components — there is no
 * hook equivalent for this. Note the real limits of what this catches:
 * it catches errors thrown during rendering, in lifecycle methods, and
 * in constructors of the tree below it. It does NOT catch errors in
 * event handlers (e.g. an onClick throwing), async code, or errors
 * thrown inside this component itself.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unexpected application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
          <div className="text-center max-w-lg">
            <ErrorIllustration />

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Something went wrong.
            </h1>
            <p className="text-muted-foreground mb-8">
              An unexpected error occurred. Try reloading the page — if the
              problem continues, head back to the home page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => window.location.reload()}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
