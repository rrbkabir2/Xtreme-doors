import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "About Us", href: "#about" },
    { label: "Products", href: "#products" },
    { label: "Specifications", href: "#specifications" },
    { label: "Contact", href: "#contact" },
  ];

  const products = [
    "Laminated Flush Doors",
    "Moulded Panel Doors",
    "Door Frames",
    "Accessories",
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Xtreme Doors</h3>
            <p className="text-primary-foreground/80 mb-4 text-sm">
              A unit of Hannure Doors
            </p>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Crafting quality doors since 1975. Premium manufacturing with 48+ years of excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-smooth text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Products</h4>
            <ul className="space-y-2">
              {products.map((product, index) => (
                <li key={index} className="text-primary-foreground/70 text-sm">
                  {product}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                <span className="text-primary-foreground/70">
                  Bopgaon, Pune - 412301, Maharashtra
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href="tel:+919175997197 / 87961 30786"
                  className="text-primary-foreground/70 hover:text-accent transition-smooth text-sm"
                >
                  +91 91759 97197 / 87961 30786
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href="mailto:xtremeedoors@gmail.com"
                  className="text-primary-foreground/70 hover:text-accent transition-smooth text-sm"
                >
                  xtremeedoors@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} Xtreme Doors. All rights reserved.
            </p>
            <p className="text-primary-foreground/60 text-sm">
              Manufactured with pride in Pune, Maharashtra
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
