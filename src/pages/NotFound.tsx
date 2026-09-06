import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import ErrorIllustration from "@/components/errors/ErrorIllustration";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="text-center max-w-lg">
        <ErrorIllustration />

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Oops! This door doesn't exist.
        </h1>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been
          moved, renamed, or never existed at this address.
        </p>

        <Button asChild size="lg">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;