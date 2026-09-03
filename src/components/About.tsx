import { Award, Clock, Leaf, CheckCircle } from "lucide-react";

const About = () => {
  const highlights = [
    {
      icon: Award,
      title: "Unmatched Quality",
      description: "Premium Pinewood and Hardwood with IS Standard compliance",
    },
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "Reliable production schedules with advanced machinery",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable manufacturing with environmental responsibility",
    },
  ];

  const features = [
    "Established in 1975 by visionary founder Mr. Hussain Hannure",
    "48+ years of industry expertise and craftsmanship excellence",
    "State-of-the-art facility with advanced imported machinery",
    "Located in Bhopgaon, Pune - strategic manufacturing hub",
    "100% IS Standard compliant manufacturing processes",
    "Custom sizing available for bulk and special orders",
    "Eco-friendly sustainable manufacturing practices",
    "Complete door solutions from production to installation",
  ];

  return (
    <section id="about" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              About Xtreme Doors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A unit of Hannure Doors, delivering excellence in door manufacturing since 1975
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-8 shadow-soft hover:shadow-elegant transition-smooth border border-border"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Company Story */}
          <div className="bg-card rounded-lg p-8 md:p-12 shadow-soft border border-border">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  Our Story
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Founded in 1975 by Mr. Hussain Hannure, Xtreme Doors (a proud unit of Hannure Doors) 
                  has been at the forefront of quality door manufacturing for nearly five decades. What 
                  started as a vision to deliver unmatched quality has evolved into a legacy of excellence 
                  that serves thousands of satisfied customers across India.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Our state-of-the-art manufacturing facility in Bhopgaon, strategically located near Pune, 
                  spans across a modern production floor equipped with advanced imported machinery from 
                  leading global manufacturers. This investment in technology allows us to maintain precise 
                  quality control while scaling production to meet growing demand.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We pride ourselves on three core pillars: uncompromising quality through premium materials, 
                  timely delivery through efficient production schedules, and affordable pricing through 
                  optimized processes. Every door that leaves our facility undergoes rigorous quality checks 
                  to ensure it meets IS Standard compliance and exceeds customer expectations.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  Key Differentiators
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
