import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      content: "Ground floor, Saswad Purandar Road, Bopgaon Bus Stop, Bopgaon, Pune - 412301, Maharashtra",
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      content: "+91 94040 40031 / +91 87961 30786",
      link: "tel:+919404040031",
    },
    {
      icon: Mail,
      title: "Email",
      content: "xtremeedoors@gmail.com",
      link: "mailto:xtremeedoors@gmail.com",
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Monday - Saturday: 9:00 AM - 6:00 PM",
    },
  ];

  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Information Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {contactInfo.map((info, index) => (
                <Card key={index} className="shadow-soft border-border hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-2">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-muted-foreground hover:text-accent transition-smooth"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.content}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Map Card - Full Width */}
            <div className="md:col-span-2">
              <Card className="shadow-soft border-border overflow-hidden">
                <div className="h-96">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3785.2576363636364!2d73.9876543!3d18.4287654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eb4c0e0e0e0e%3A0x0!2zMTjCsDI1JzQzLjYiTiA3M8KwNTknMTUuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Xtremee Doors Location"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;