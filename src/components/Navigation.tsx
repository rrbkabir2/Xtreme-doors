import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Height of the fixed navbar (h-16 = 64px) plus a small buffer, so a
// section's heading isn't tucked underneath it after scrolling to it.
const NAV_OFFSET = 80;

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const location = useLocation();

  const navItems = [
    { label: "About", href: "#about", id: "about" },
    { label: "Products", href: "#products", id: "products" },
    { label: "Specifications", href: "#specifications", id: "specifications" },
    { label: "Why Choose Us", href: "#why-us", id: "why-us" },
    { label: "Contact", href: "#contact", id: "contact" },
  ];

  // Nav links now always route through React Router (to={`/${item.href}`})
  // instead of plain <a href="#id"> anchors, so they work correctly from
  // ANY page — previously, clicking "About" from /get-quote tried to jump
  // to an element that only exists on the home page, and did nothing.
  // This effect performs the actual scroll once we're on the home page
  // with a matching hash in the URL (whether we just navigated here from
  // another page, or clicked a link while already on the home page).
  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const id = location.hash.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }, [location.pathname, location.hash]);

  // Scroll-spy: highlight the nav item for whichever section is currently
  // in view. Only runs on the home page, since these section IDs only
  // exist there (e.g. not on /get-quote).
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = navItems.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among sections currently intersecting the viewport band,
        // pick the one closest to the top.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        // Treat a section as "active" once it's within this horizontal
        // band of the viewport (accounts for the fixed navbar height).
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">Xtreme Doors</div>
            <span className="hidden sm:block text-xs text-muted-foreground">A unit of Hannure Doors</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={`/${item.href}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                  activeSection === item.id
                    ? "text-primary bg-secondary"
                    : "text-foreground hover:text-primary hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button size="sm" className="ml-4" asChild>
              <Link to="/get-quote">
                <Phone className="w-4 h-4 mr-2" />
                Get Quote
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={`/${item.href}`}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                  activeSection === item.id
                    ? "text-primary bg-secondary"
                    : "text-foreground hover:text-primary hover:bg-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Button size="sm" className="w-full" asChild>
                <Link to="/get-quote" onClick={() => setIsOpen(false)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Get Quote
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;