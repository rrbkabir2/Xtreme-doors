import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Layers, ShieldCheck, Ruler, Wand2 } from "lucide-react";
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
  // Placeholder products — added only to demo/confirm that a second
  // carousel page appears and the Previous/Next buttons work once
  // there are more than 4 products. Replace title/description/image/
  // features/specs with real products whenever the owner is ready,
  // or remove these two entries.
  {
    title: "[Reference] New Product Slot 1",
    description: "Placeholder card demonstrating that a second carousel page appears automatically once a 5th product is added. Replace with real product details.",
    image: flushDoor,
    icon: Layers,
    features: ["Replace with real features"],
    specifications: [{ label: "Note", value: "Placeholder for testing" }],
  },
  {
    title: "[Reference] New Product Slot 2",
    description: "Second placeholder card, so page 2 shows a full 2-card row for a realistic test.",
    image: mouldedDoor,
    icon: ShieldCheck,
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

// Height of the fixed navbar (h-16 = 64px), plus a small buffer, so the
// section heading isn't tucked underneath it after an auto-scroll.
const NAV_OFFSET = 80;

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(null);
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Whenever the carousel page changes (Previous/Next clicked), scroll
  // the Products section fully into view at the top of the viewport
  // instead of leaving the user scrolled to wherever they were —
  // otherwise the new row's cards can appear half cut-off above/below.
  //
  // Also track canScrollPrev/canScrollNext so we can hide a button
  // entirely when it has nowhere to go, instead of showing a dimmed
  // disabled button that does nothing.
  useEffect(() => {
    if (!api) return;

    const scrollSectionToTop = () => {
      const section = sectionRef.current;
      if (!section) return;
      const top =
        section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    };

    const updateScrollability = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollability(); // set correct initial state (e.g. first page)

    api.on("select", scrollSectionToTop);
    api.on("select", updateScrollability);
    api.on("reInit", updateScrollability);

    return () => {
      api.off("select", scrollSectionToTop);
      api.off("select", updateScrollability);
      api.off("reInit", updateScrollability);
    };
  }, [api]);

  return (
    <section id="products" ref={sectionRef} className="py-24 bg-background">
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

          {/* Pages — each page is a 2x2 grid of cards. User navigates
              between pages with the Previous/Next buttons; nothing
              moves automatically on scroll. */}
          <Carousel opts={{ align: "start" }} setApi={setApi} className="relative">
            <CarouselContent>
              {pages.map((pageProducts, pageIndex) => (
                <CarouselItem key={pageIndex}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                          <CardDescription className="text-sm line-clamp-3">{product.description}</CardDescription>
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
                </CarouselItem>
              ))}
            </CarouselContent>

            {canScrollPrev && (
              <CarouselPrevious
                variant="default"
                className="top-3/4 left-2 lg:-left-6 h-11 w-11 shadow-elegant border-none"
              />
            )}
            {canScrollNext && (
              <CarouselNext
                variant="default"
                className="top-3/4 right-2 lg:-right-6 h-11 w-11 shadow-elegant border-none"
              />
            )}
          </Carousel>
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
                  <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Specifications</h4>
                  <div className="space-y-2">
                    {selectedProduct.specifications.map((spec, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{spec.label}:</span>
                        <span className="font-medium text-foreground">{spec.value}</span>
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