import { Button } from "@/components/ui/button";
import { Phone, Mail, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-doors.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm text-accent-foreground rounded-full text-sm font-semibold mb-4">
              Since 1975
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 leading-tight">
              Crafting Quality<br />
              <span className="text-accent">Doors & Frames</span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            Premium door manufacturing with 48+ years of excellence. 
            Unmatched quality using imported machinery and sustainable practices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="text-lg h-14 px-8 shadow-elegant hover:scale-105 transition-smooth">
              <Phone className="w-5 h-5 mr-2" />
              Get Quote
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg h-14 px-8 bg-background/90 hover:bg-background backdrop-blur-sm shadow-elegant hover:scale-105 transition-smooth"
              asChild
            >
              <a href="#products">
                View Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>

          {/* Quick Contact Info */}
          <div className="flex flex-col sm:flex-row gap-6 text-primary-foreground/80">
            <a href="tel:+919175997197" className="flex items-center gap-2 hover:text-accent transition-smooth hover:scale-105">
              <Phone className="w-5 h-5" />
              <span>+91 91759 97197 / 87961 30786</span>
            </a>
            <a href="mailto:xtremeedoors@gmail.com" className="flex items-center gap-2 hover:text-accent transition-smooth hover:scale-105">
              <Mail className="w-5 h-5" />
              <span>xtremeedoors@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;