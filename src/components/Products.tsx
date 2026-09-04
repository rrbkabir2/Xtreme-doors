import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ShieldCheck, Ruler, Wand2 } from "lucide-react";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import flushDoor from "@/assets/flush-door.jpg";
import mouldedDoor from "@/assets/moulded-door.jpg";
import doorFrame from "@/assets/door-frame.jpg";
import postFormingDoor from "@/assets/post-forming-door.jpg";

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
  // Placeholder 5th product — added only to demo/confirm that a second
  // scroll "page" correctly appears once there are more than 4 products.
  // Replace title/description/image/features/specs with a real product
  // whenever the owner is ready to add one, or remove this entry.
  {
    title: "[Reference] New Product Slot",
    description: "Placeholder card demonstrating that a second scroll page appears automatically once a 5th product is added. Replace with real product details.",
    image: flushDoor,
    icon: Layers,
    features: ["Replace with real features"],
    specifications: [{ label: "Note", value: "Placeholder for testing" }],
  },
];

// Group products into pages of 4 (2x2 grid per page). The horizontal
// scroll moves one full page at a time, not one card at a time.
const PRODUCTS_PER_PAGE = 4;
const pages = Array.from(
  { length: Math.ceil(products.length / PRODUCTS_PER_PAGE) },
  (_, i) => products.slice(i * PRODUCTS_PER_PAGE, i * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE)
);

const Products = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Pins the section and drives horizontal page-by-page motion from
  // vertical scroll on desktop/tablet (lg+). Falls back to normal
  // vertical stacking below that.
  useHorizontalScroll(sectionRef, trackRef);

  return (
    <section id="products" ref={sectionRef} className="py-24 bg-background overflow-hidden">
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

          {/* Pages — each page is a 2x2 grid of full-detail cards.
              Track scrolls one page at a time on lg+; stacks normally below. */}
          <div ref={trackRef} className="flex flex-col lg:flex-row">
            {pages.map((pageProducts, pageIndex) => (
              <div
                key={pageIndex}
                className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-rows-2 gap-8 lg:px-1"
              >
                {pageProducts.map((product, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-elegant transition-smooth border-border"
                  >
                    <div className="relative h-56 overflow-hidden bg-secondary/30">
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
                      <CardTitle className="text-xl text-card-foreground">{product.title}</CardTitle>
                      <CardDescription className="text-sm">{product.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-2 text-sm">Key Features</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {product.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Specifications */}
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-2 text-sm">Specifications</h4>
                        <div className="space-y-1">
                          {product.specifications.map((spec, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;