import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ShieldCheck, Ruler, Wand2 } from "lucide-react";
import flushDoor from "@/assets/flush-door.jpg";
import mouldedDoor from "@/assets/moulded-door.jpg";
import doorFrame from "@/assets/door-frame.jpg";
import postFormingDoor from "@/assets/post-forming-door.jpg";

const Products = () => {
  const products = [
    {
      title: "Laminated Flush Doors",
      description: "Premium quality doors with solid core blockboard and HPL decorative laminates on both sides, engineered for superior durability and aesthetic appeal",
      image: flushDoor,
      icon: Layers,
      features: [
        "Plain & Grooved variants",
        "Phenol formaldehyde resin bonded",
        "Hot pressed for durability",
        "Premium Pinewood & Hardwood",
        "HPL both sides",
        "Termite resistant",
        "Moisture resistant",
        "Warp-free construction",
      ],
      specifications: [
        { label: "Thickness", value: "30-50mm" },
        { label: "Standard Sizes", value: "84x27\", 84x32\", 84x35\"" },
        { label: "Special Size", value: "120\"x48\" (10x4 feet)" },
      ],
    },
    {
      title: "Moulded Panel Doors",
      description: "Elegant pre-primed doors featuring international design standards with superior durability, ready for painting in your choice of color",
      image: mouldedDoor,
      icon: ShieldCheck,
      features: [
        "Pre-primed white finish",
        "Anti-warping & cracking",
        "Kiln seasoned timber",
        "Marine grade quality",
        "Economical & eco-friendly",
        "International design",
        "Paint-ready surface",
        "Dimensional stability",
        "Easy installation",
      ],
      specifications: [
        { label: "Thickness", value: "30mm" },
        { label: "Standard Sizes", value: "84x27\", 84x32\", 84x36\", 84x39\"" },
        { label: "Finish", value: "Pre-primed white" },
      ],
    },
    {
      title: "Door Frames",
      description: "Complete range of premium door frames including conventional, finger jointed, post-form, and pre-laminated options with railings and architrave",
      image: doorFrame,
      icon: Ruler,
      features: [
        "Easy installation",
        "Space-efficient storage",
        "Multiple variants available",
        "Includes railings & architrave",
        "Carton packed for protection",
        "Precision engineered joints",
        "Weather resistant",
        "Long-lasting finish",
      ],
      specifications: [
        { label: "Thickness", value: "30-52mm" },
        { label: "Length", value: "1100-2300mm" },
        { label: "Width", value: "300-1100mm" },
        { label: "Types", value: "Conventional, Finger Jointed, Post-Form, Pre-laminated" },
      ],
    },
    {
      title: "Post Forming Doors",
      description: "A modern, seamless, and highly durable door solution designed to enhance both residential and commercial interiors",
      image: postFormingDoor,
      icon: Wand2,
      features: [
        "Smooth curved edges",
        "Advanced post-forming technology",
        "Seamless continuous surface",
        "No visible joints",
        "Premium laminate finish",
        "Safer rounded corners",
        "Easy to maintain",
        "Visually appealing design",
        "High durability",
      ],
      specifications: [
        { label: "Thickness", value: "30-35mm" },
        { label: "Standard Sizes", value: "84x27\", 84x32\", 84x36\"" },
        { label: "Finish", value: "High-quality laminate with curved edges" },
      ],
    },
  ];

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Our Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive range of premium doors and frames for every requirement
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {products.map((product, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-elegant transition-smooth border-border">
                <div className="relative h-80 overflow-hidden bg-secondary/30">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-smooth duration-500"
                  />
                  <div className="absolute top-4 right-4 w-12 h-12 bg-accent/90 rounded-lg flex items-center justify-center shadow-elegant">
                    <product.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl text-card-foreground">{product.title}</CardTitle>
                  <CardDescription className="text-base">{product.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-3">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-3">Specifications</h4>
                    <div className="space-y-2">
                      {product.specifications.map((spec, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{spec.label}:</span>
                          <span className="font-medium text-card-foreground">{spec.value}</span>
                        </div>
                      ))}
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

export default Products;
