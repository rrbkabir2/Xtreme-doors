import { Card } from "@/components/ui/card";
import galleryDoor1 from "@/assets/gallery-door-1.jpg";
import galleryDoor2 from "@/assets/gallery-door-2.jpg";
import flushDoor2 from "@/assets/flush-door-2.jpg";
import galleryDoor4 from "@/assets/gallery-door-4.jpg";
import galleryDoor5 from "@/assets/gallery-door-5.jpg";
import galleryDoor6 from "@/assets/gallery-door-6.jpg";
import galleryDoor7 from "@/assets/gallery-door-7.jpg";
import galleryDoor8 from "@/assets/gallery-door-8.jpg";

const Gallery = () => {
  const galleryItems = [
    {
      image: galleryDoor1,
      title: "Laminated Flush Door",
      description: "Premium wood finish for modern spaces",
      span: "md:col-span-2",
      delay: "0ms",
    },
    {
      image: galleryDoor2,
      title: "Simple Panel Door",
      description: "Clean minimalist panel design",
      span: "md:col-span-1",
      delay: "100ms",
    },
    {
      image: flushDoor2,
      title: "Modern Flush Door",
      description: "Contemporary minimalist design",
      span: "md:col-span-1",
      delay: "200ms",
    },
    {
      image: galleryDoor4,
      title: "White Moulded Panel Door",
      description: "Plain simple white moulded design",
      span: "md:col-span-2",
      delay: "300ms",
    },
    {
      image: galleryDoor5,
      title: "Contemporary Grooved Door",
      description: "Walnut laminated with horizontal grooves",
      span: "md:col-span-1",
      delay: "400ms",
    },
    {
      image: galleryDoor6,
      title: "Post Forming Door",
      description: "Smooth curved edges with premium finish",
      span: "md:col-span-1",
      delay: "500ms",
    },
    {
      image: galleryDoor7,
      title: "Laminated Wood Door",
      description: "Warm wood grain texture",
      span: "md:col-span-1",
      delay: "600ms",
    },
    {
      image: galleryDoor8,
      title: "Veneer Flush Door",
      description: "Natural wood grain pattern",
      span: "md:col-span-1",
      delay: "700ms",
    },
  ];

  return (
    <section id="gallery" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Our Gallery
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our extensive collection of premium doors, manufacturing facility, and installation showcase
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {galleryItems.map((item, index) => (
              <Card
                key={index}
                className={`${item.span} overflow-hidden group cursor-pointer hover:shadow-elegant transition-smooth border-border animate-fade-in-up`}
                style={{ animationDelay: item.delay }}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-xl mb-1">{item.title}</h3>
                      <p className="text-white/90 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
