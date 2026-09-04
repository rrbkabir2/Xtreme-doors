import { useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Layers, ShieldCheck, Ruler, Wand2 } from "lucide-react";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import flushDoor from "@/assets/flush-door.jpg";
import mouldedDoor from "@/assets/moulded-door.jpg";
import doorFrame from "@/assets/door-frame.jpg";
import postFormingDoor from "@/assets/post-forming-door.jpg";

const products = [
  {
    title: "Laminated Flush Doors",
    description:
      "Premium quality doors with solid core blockboard and HPL decorative laminates on both sides, engineered for superior durability and aesthetic appeal",
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
    description:
      "Elegant pre-primed doors featuring international design standards with superior durability, ready for painting in your choice of color",
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
    description:
      "Complete range of premium door frames including conventional, finger jointed, post-form, and pre-laminated options with railings and architrave",
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
      {
        label: "Types",
        value: "Conventional, Finger Jointed, Post-Form, Pre-laminated",
      },
    ],
  },
  {
    title: "Post Forming Doors",
    description:
      "A modern, seamless, and highly durable door solution designed to enhance both residential and commercial interiors",
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

const Products = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(null);

  // Pins the section and drives horizontal motion from vertical scroll
  // on desktop/tablet (lg+). Falls back to normal vertical stacking
  // below that — see flex-col lg:flex-row on the track below.
  useHorizontalScroll(sectionRef, trackRef);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="py-24 bg-background overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Our Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive range of premium doors and frames for every
              requirement
            </p>
          </div>

          {/* Products Row — horizontal scroll-jack on lg+, stacked below */}
          <div
            ref={trackRef}
            className="flex flex-col gap-8 lg:flex-row lg:gap-8"
          >
            {products.map((product, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-elegant transition-smooth border-border flex-shrink-0 w-full lg:w-[calc(25%-1.5rem)]"
              >
                <div className="relative h-64 overflow-hidden bg-secondary/30">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 w-12 h-12 bg-accent/90 rounded-lg flex items-center justify-center shadow-elegant">
                    <product.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <div className="px-6 pb-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedProduct(product)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Details popup — features + specifications */}
      <Dialog
        open={selectedProduct !== null}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-foreground">
                  {selectedProduct.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedProduct.description}
                </DialogDescription>
              </DialogHeader>

              <div className="relative h-64 overflow-hidden rounded-lg bg-secondary/30 mt-2">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    Specifications
                  </h4>
                  <div className="space-y-2">
                    {selectedProduct.specifications.map((spec, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {spec.label}:
                        </span>
                        <span className="font-medium text-foreground">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Products;