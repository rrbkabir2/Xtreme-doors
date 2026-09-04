import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin } from "lucide-react";

const quoteFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address").max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  productType: z.string().min(1, "Please select a product type"),
  quantity: z.string().trim().max(50).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const productOptions = [
  "Laminated Flush Doors",
  "Moulded Panel Doors",
  "Door Frames",
  "Post-Forming Doors",
  "Not sure / Need guidance",
];

const GetQuote = () => {
  const { toast } = useToast();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      productType: "",
      quantity: "",
      message: "",
    },
  });

  const onSubmit = (values: QuoteFormValues) => {
    // NOTE: No backend is connected yet. This currently just confirms
    // receipt to the user. Wire this up to an email/CRM/API endpoint
    // when ready.
    console.log("Quote request submitted:", values);

    toast({
      title: "Quote request received",
      description: "Thanks! We'll get back to you shortly with a quote.",
    });

    form.reset();
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="pt-32 pb-24 bg-secondary/30 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              Get a Quote
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tell Us What You Need
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Share a few details about your requirement and our team will get
              back to you with pricing and availability.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Form */}
            <Card className="lg:col-span-2 shadow-elegant">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="productType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approx. Quantity (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 10 doors" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Details (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Sizes, finish, timeline, or anything else we should know"
                              className="min-h-32 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={form.formState.isSubmitting}
                    >
                      Submit Request
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Sidebar contact info */}
            <div className="space-y-4">
              <Card className="shadow-soft">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Prefer to talk directly?
                  </h3>
                  <a
                    href="tel:+919404040031"
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-smooth"
                  >
                    <Phone className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>+91 94040 40031 / 87961 30786</span>
                  </a>
                  <a
                    href="mailto:xtremeedoors@gmail.com"
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-smooth"
                  >
                    <Mail className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>xtremeedoors@gmail.com</span>
                  </a>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>Pune, Maharashtra</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GetQuote;