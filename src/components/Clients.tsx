import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const Clients = () => {
  const clients = [
    {
      name: "MONARCH GROUP",
      projects: ["Monarch Estates", "Monarch Tower"],
    },
    {
      name: "SHANTI GROUP",
      projects: ["Shanti Niketan","Shanti Anand","Shanti Samarth"],
    },
    {
      name: "KUMAR GROUP",
      projects: ["Kumar Picassa"],
    },
    {
      name: "VARDHAMAN GROUP",
      projects: ["Vardhaman Township", "Sasane Nagar"],
    },
    {
      name: "SANKALP DEVELOPERS",
      projects: ["Wadgaon Sheri"],
    },
    {
      name: "VISION CONSTRUCTION",
      projects: ["Narayangoan, Pune"],
    },
    {
      name: "BHAVANI CONSTRUCTIONS",
      projects: ["Nanapeth", "Rastapeth", "Somwar Peth", "Bhavani Peth"],
    },
    {
      name: "KOHINOOR GROUP",
      projects: [
        "Riena - Kondhwa",
        "I-trend Homes - Hinjewadi",
        "Coral - Hinjewadi",
        "Abhiman - Shirgaon",
        "I-Trend Life - Chakan",
      ],
    },
    {
      name: "GAGAN DEVELOPERS",
      projects: [],
    },
  ];

  return (
    <section id="clients" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Our Prestigious Clients
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trusted by leading developers and construction companies across Pune
            </p>
          </div>

          {/* Clients Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client, index) => (
              <Card
                key={index}
                className="hover:shadow-elegant transition-smooth border-border"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-card-foreground mb-2">
                        {client.name}
                      </h3>
                      {client.projects.length > 0 && (
                        <ul className="space-y-1">
                          {client.projects.map((project, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              • {project}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
