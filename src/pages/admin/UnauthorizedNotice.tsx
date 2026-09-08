import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UnauthorizedNoticeProps {
  message?: string;
}

const UnauthorizedNotice = ({ message }: UnauthorizedNoticeProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-elegant p-8 text-center space-y-6">
        <svg viewBox="0 0 200 160" className="w-48 h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="95" rx="80" ry="50" fill="hsl(var(--secondary))" />
          <circle cx="60" cy="35" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
          <circle cx="85" cy="22" r="9" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
          <rect x="55" y="118" width="90" height="8" rx="2" fill="hsl(var(--muted-foreground) / 0.3)" />
          <rect x="65" y="98" width="70" height="24" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="72" y="104" width="30" height="3" rx="1.5" fill="hsl(var(--border))" />
          <rect x="72" y="110" width="45" height="3" rx="1.5" fill="hsl(var(--border))" />
          <path
            d="M100 40 L128 50 V78 C128 100 116 112 100 120 C84 112 72 100 72 78 V50 Z"
            fill="hsl(var(--destructive) / 0.15)"
            stroke="hsl(var(--destructive))"
            strokeWidth="3"
          />
          <rect x="90" y="76" width="20" height="16" rx="3" fill="hsl(var(--destructive))" />
          <path d="M94 76 V70 a6 6 0 0 1 12 0 V76" fill="none" stroke="hsl(var(--destructive))" strokeWidth="3" />
        </svg>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sorry!</h1>
          <p className="text-muted-foreground text-sm">
            {message || "You're not authorized to access this page. Please check your login credentials or contact an administrator for access."}
          </p>
        </div>

        <Button asChild className="w-full">
          <Link to="/admin/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedNotice;