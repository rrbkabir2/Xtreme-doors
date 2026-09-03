import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Hexagon, Grid3x3, Layers } from "lucide-react";

const TechnicalSpecs = () => {
  const coreTypes = [
    {
      icon: Box,
      name: "Timber Core",
      description: "Traditional solid timber construction",
      features: ["Extremely strong", "Solid structure", "Classic durability", "Heavy-duty applications"],
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Grid3x3,
      name: "Particle Core",
      description: "Eco-friendly revolutionary design",
      features: ["Sustainable material", "Cost-effective", "Good strength", "Environmental friendly"],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Layers,
      name: "Tubular Board",
      description: "Lightweight innovative solution",
      features: ["60% weight reduction", "Easy installation", "Efficient structure", "Modern design"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Hexagon,
      name: "Honeycomb",
      description: "Aerospace technology application",
      features: ["High load-bearing", "Ultra-lightweight", "Maximum strength", "Advanced engineering"],
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section id="specifications" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Technical Specifications
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Optional door infill core types designed for different requirements
            </p>
          </div>

          {/* Core Types Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTypes.map((core, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-elegant transition-smooth border-border group">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${core.color} rounded-lg flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-smooth`}>
                    <core.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-card-foreground">{core.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{core.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {core.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-card rounded-lg p-8 shadow-soft border border-border">
            <h3 className="text-2xl font-bold text-card-foreground mb-4 text-center">
              Complete Door Solutions
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">48+</div>
                <div className="text-sm text-muted-foreground">Years of Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">100%</div>
                <div className="text-sm text-muted-foreground">IS Standard Compliant</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">Custom</div>
                <div className="text-sm text-muted-foreground">Sizing Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicalSpecs;
