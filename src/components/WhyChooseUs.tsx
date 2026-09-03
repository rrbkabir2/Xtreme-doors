import { CheckCircle, Award, Users, Leaf, Clock, Wrench } from "lucide-react";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Premium materials with strict quality control and IS Standard compliance",
    },
    {
      icon: Users,
      title: "48+ Years Experience",
      description: "Nearly five decades of expertise in door manufacturing since 1975",
    },
    {
      icon: Wrench,
      title: "Advanced Machinery",
      description: "State-of-the-art imported equipment for precision manufacturing",
    },
    {
      icon: Leaf,
      title: "Sustainable Practices",
      description: "Eco-friendly manufacturing with environmental responsibility",
    },
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "Reliable production schedules ensuring on-time project completion",
    },
    {
      icon: CheckCircle,
      title: "Complete Solutions",
      description: "Doors, frames, and accessories all under one roof",
    },
  ];

  return (
    <section id="why-us" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Why Choose Xtreme Doors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unmatched quality, reliability, and customer satisfaction
            </p>
          </div>

          {/* Reasons Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-8 shadow-soft hover:shadow-elegant transition-smooth border border-border group"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-smooth">
                  <reason.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>

          {/* Trust Banner */}
          <div className="bg-gradient-warm rounded-lg p-12 text-center shadow-elegant">
            <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Trusted by Thousands
            </h3>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Join countless satisfied customers who have chosen Xtreme Doors for their premium door solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-8 py-4">
                <div className="text-3xl font-bold text-primary-foreground">Custom Sizing</div>
                <div className="text-sm text-primary-foreground/80">Available for Bulk Orders</div>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-8 py-4">
                <div className="text-3xl font-bold text-primary-foreground">Affordable</div>
                <div className="text-sm text-primary-foreground/80">Competitive Pricing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
