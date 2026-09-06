import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Layers, ShieldCheck, Ruler, Wand2, DoorOpen, Download, Expand, type LucideIcon } from "lucide-react";
import { getProductImageUrl } from "@/lib/productImage";

// Products now live in the database, managed from /admin/products —
// this is fetched from our own /api/products endpoint (which reads
// only rows marked "visible on public site").
interface Spec {
  label: string;
  value: string;
}
interface ApiProduct {
  id: string;
  title: string;
  description: string;
  features: string[];
  specifications: Spec[];
  image_path: string | null;
  icon_name: string;
  sort_order: number;
}
interface DisplayProduct {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  features: string[];
  specifications: Spec[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  ShieldCheck,
  Ruler,
  Wand2,
  DoorOpen,
};

async function fetchProducts(): Promise<DisplayProduct[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return (data.products as ApiProduct[]).map((p) => ({
    title: p.title,
    description: p.description,
    image: getProductImageUrl(p.image_path),
    icon: ICON_MAP[p.icon_name] || Layers,
    features: p.features,
    specifications: p.specifications,
  }));
}

// Group products into pages of 4 (2x2 grid per page). The horizontal
// scroll moves one full page at a time, not one card at a time.
const PRODUCTS_PER_PAGE = 4;

// Height of the fixed navbar (h-16 = 64px), plus a small buffer, so the
// section heading isn't tucked underneath it after an auto-scroll.
const NAV_OFFSET = 80;

const Products = () => {
  const { data: products } = useQuery({ queryKey: ["public-products"], queryFn: fetchProducts });
  const pages = Array.from(
    { length: Math.ceil((products?.length || 0) / PRODUCTS_PER_PAGE) },
    (_, i) => (products || []).slice(i * PRODUCTS_PER_PAGE, i * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE)
  );
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heightWrapperRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // A horizontal carousel's container height defaults to the tallest
  // slide, since all slides sit side-by-side. With an uneven last page
  // (6 products = 4 + 2), that meant the shorter 2nd page still
  // reserved the taller 1st page's full height underneath it —
  // showing a big empty gap and pushing the Prev/Next buttons down
  // into that empty space. This measures the ACTIVE page's real
  // height and resizes the wrapper to match it, so the layout always
  // hugs whatever is actually visible.
  //
  // It also precisely centers the Prev/Next buttons on the LAST
  // product card of the active page, measured directly via
  // getBoundingClientRect rather than a guessed CSS percentage — this
  // stays correct regardless of how many rows/columns a page has at
  // any screen size (mobile 1-column, tablet/desktop 2-column, a
  // full 2x2 page, or a shorter last page).
  useLayoutEffect(() => {
    if (!api) return;

    const updateLayout = () => {
      const activeIndex = api.selectedScrollSnap();
      const activePage = pageRefs.current[activeIndex];
      const wrapper = heightWrapperRef.current;
      if (!activePage || !wrapper) return;

      wrapper.style.height = `${activePage.offsetHeight}px`;

      const lastCard = activePage.lastElementChild as HTMLElement | null;
      if (lastCard) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const cardRect = lastCard.getBoundingClientRect();
        const centerY = cardRect.top - wrapperRect.top + cardRect.height / 2;

        if (prevButtonRef.current) prevButtonRef.current.style.top = `${centerY}px`;
        if (nextButtonRef.current) nextButtonRef.current.style.top = `${centerY}px`;
        setIsPositioned(true);
      }
    };

    updateLayout();

    api.on("select", updateLayout);
    api.on("reInit", updateLayout);
    window.addEventListener("resize", updateLayout);

    return () => {
      api.off("select", updateLayout);
      api.off("reInit", updateLayout);
      window.removeEventListener("resize", updateLayout);
    };
  }, [api]);

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

  const handleDownloadImage = () => {
    if (!selectedProduct) return;
    const filename = `${selectedProduct.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}.jpg`;

    const link = document.createElement("a");
    link.href = selectedProduct.image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              moves automatically on scroll. Height-locked to the
              active page only (see updateHeight above) so a shorter
              last page doesn't leave empty reserved space below it —
              and so the Prev/Next buttons (positioned as a % of this
              same element's height) land on the visible content,
              not the empty space. */}
          <Carousel
            ref={heightWrapperRef}
            opts={{ align: "start" }}
            setApi={setApi}
            className="relative overflow-hidden transition-[height] duration-300 ease-in-out"
          >
            <CarouselContent>
              {pages.map((pageProducts, pageIndex) => (
                <CarouselItem key={pageIndex}>
                  <div
                    ref={(el) => (pageRefs.current[pageIndex] = el)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-8"
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
                ref={prevButtonRef}
                variant="default"
                className={`left-2 h-11 w-11 shadow-elegant border-none transition-opacity duration-150 ${
                  isPositioned ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
            {canScrollNext && (
              <CarouselNext
                ref={nextButtonRef}
                variant="default"
                className={`right-2 h-11 w-11 shadow-elegant border-none transition-opacity duration-150 ${
                  isPositioned ? "opacity-100" : "opacity-0"
                }`}
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
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setIsPhotoOpen(true)}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="shadow-elegant"
                    onClick={() => setIsPhotoOpen(true)}
                  >
                    <Expand className="w-4 h-4 mr-2" />
                    View Full Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="shadow-elegant"
                    onClick={handleDownloadImage}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
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
                  <div className="space-y-3">
                    {selectedProduct.specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-foreground sm:text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-photo lightbox — separate Dialog (sibling, not nested)
          showing the complete, uncropped image */}
      <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
        <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
          {selectedProduct && (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Products;