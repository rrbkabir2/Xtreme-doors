import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import Gallery from "@/components/Gallery";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import Certifications from "@/components/Certifications";
import WhyChooseUs from "@/components/WhyChooseUs";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Products />
      <Gallery />
      <TechnicalSpecs />
      <Certifications />
      <WhyChooseUs />
      <Clients />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
