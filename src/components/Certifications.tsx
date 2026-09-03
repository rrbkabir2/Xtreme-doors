import { Card, CardContent } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { CheckCircle2, Award, Shield, Leaf } from "lucide-react";

const Certifications = () => {
  const certifications = [
    {
      icon: Award,
      title: "IS Standard Compliant",
      description: "All products meet Indian Standards for quality and safety",
      year: "Certified Since 1975",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Rigorous testing and inspection at every production stage",
      year: "100% Guaranteed",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly Certified",
      description: "Sustainable manufacturing with environmental responsibility",
      year: "Green Initiative",
    },
    {
      icon: CheckCircle2,
      title: "International Standards",
      description: "Adherence to global quality benchmarks",
      year: "Export Ready",
    },
  ];

  const qualityFeatures = [
    "Premium grade Pinewood and Hardwood sourced responsibly",
    "Advanced imported machinery ensuring precision manufacturing",
    "Phenol formaldehyde resin bonding for superior durability",
    "Hot pressed construction for enhanced strength",
    "Kiln-dried timber preventing warping and cracking",
    "Multi-layer quality control at each production stage",
    "Marine grade materials for moisture resistance",
    "IS Standard compliant manufacturing processes",
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Quality & Certifications
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Committed to excellence with industry-leading standards and certifications
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-elegant transition-smooth border-border group">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-smooth">
                    <cert.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg text-card-foreground mb-2">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                  <BadgeUI variant="secondary" className="text-xs">{cert.year}</BadgeUI>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quality Features */}
          <Card className="shadow-soft border-border">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-card-foreground mb-8 text-center">
                Our Quality Commitment
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {qualityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
