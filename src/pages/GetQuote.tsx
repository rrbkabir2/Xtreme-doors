import { useState } from "react";
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
import FormErrorState from "@/components/errors/FormErrorState";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin } from "lucide-react";
import {
  BUSINESS_LIKE_TYPES,
  customerTypeOptions,
  businessRoleOptions,
  requirementForOptions,
  projectTypeOptions,
  purchaseTimelineOptions,
  contactMethodOptions,
} from "@/lib/quoteOptions";

const quoteFormSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    mobileNumber: z
      .string()
      .trim()
      .regex( /^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
      .optional()
      .or(z.literal("")),
    email: z.string().trim().email("Enter a valid email address").max(255).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),

    customerType: z.string().min(1, "Please select a customer type"),
    companyName: z.string().trim().max(200).optional().or(z.literal("")),
    businessRole: z.string().optional().or(z.literal("")),

    requirementFor: z.string().min(1, "Please select what this is for"),
    projectType: z.string().optional().or(z.literal("")),
    projectSiteName: z.string().trim().max(200).optional().or(z.literal("")),
    siteLocation: z.string().trim().max(300).optional().or(z.literal("")),

    productType: z.string().trim().max(200).optional().or(z.literal("")),
    quantity: z.string().trim().max(50).optional().or(z.literal("")),
    additionalDetails: z.string().trim().max(1000).optional().or(z.literal("")),

    purchaseTimeline: z.string().optional().or(z.literal("")),
    preferredContactMethod: z.string().optional().or(z.literal("")),

    leadSource: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((v) => (v.mobileNumber && v.mobileNumber.trim().length >= 10) || (v.email && v.email.length > 0), {
    message: "Provide a mobile number or an email address.",
    path: ["mobileNumber"],
  })
  .refine(
    (v) => {
      if (!(BUSINESS_LIKE_TYPES as readonly string[]).includes(v.customerType)) return true;
      return !!v.companyName && v.companyName.trim().length > 0;
    },
    { message: "Company / business name is required for this customer type.", path: ["companyName"] }
  )
  .refine(
    (v) => {
      if (!(BUSINESS_LIKE_TYPES as readonly string[]).includes(v.customerType)) return true;
      return !!v.businessRole && v.businessRole.length > 0;
    },
    { message: "Please select your role.", path: ["businessRole"] }
  );

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const GetQuote = () => {
  const { toast } = useToast();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
     mode: "onChange",
     reValidateMode: "onChange" ,
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      email: "",
      city: "",
      customerType: "",
      companyName: "",
      businessRole: "",
      requirementFor: "",
      projectType: "",
      projectSiteName: "",
      siteLocation: "",
      productType: "",
      quantity: "",
      additionalDetails: "",
      purchaseTimeline: "",
      preferredContactMethod: "",
      leadSource: "",
    },
  });

  const [submitFailed, setSubmitFailed] = useState(false);

  const customerType = form.watch("customerType");
  const projectSiteName = form.watch("projectSiteName");
  const showBusinessSection = (BUSINESS_LIKE_TYPES as readonly string[]).includes(customerType);
  const showSiteLocation = !!projectSiteName && projectSiteName.trim().length > 0;

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSubmitFailed(false);
      toast({
        title: "Quote request received",
        description: "Thanks! We'll get back to you shortly with a quote.",
      });
      form.reset();
    } catch (error) {
      console.error("Quote submission failed:", error);
      setSubmitFailed(true);
    }
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
            <Card className="lg:col-span-2 shadow-elegant">
              <CardContent className="pt-6">
                {submitFailed ? (
                  <FormErrorState onRetry={() => setSubmitFailed(false)} />
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      {/* 1. Customer Information */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                          Customer Information
                        </h2>
                        <FormField
                          control={form.control}
                          name="fullName"
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
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="mobileNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mobile Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" inputMode="numeric" placeholder="10-digit mobile number" {...field} onChange={(e) => { const value = e.target.value.replace(/\D/g, "").slice(0, 10); field.onChange(value); }} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground -mt-4">
                          Provide at least a mobile number or an email address.
                        </p>
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Your city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 2. Customer Type */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                          Customer Type
                        </h2>
                        <FormField
                          control={form.control}
                          name="customerType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select customer type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[60vh] overflow-y-auto">
                                  {customerTypeOptions.map((o) => (
                                   <SelectItem key={o.value} value={o.value}>
                                     {o.label}
                                   </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 3. Business Information — conditional */}
                      {showBusinessSection && (
                        <div className="space-y-6">
                          <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                            Business Information
                          </h2>
                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company / Business Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your company name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="businessRole"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business Role / Designation *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[60vh] overflow-y-auto">
                                      {businessRoleOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                          {o.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* 4. Project Information */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                          Project Information
                        </h2>
                        <FormField
                          control={form.control}
                          name="requirementFor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Requirement For *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select requirement" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[60vh] overflow-y-auto">
                                  {requirementForOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                      {o.label}
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
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select project type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[60vh] overflow-y-auto">
                                  {projectTypeOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                      {o.label}
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
                          name="projectSiteName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project / Site Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Sunrise Apartments" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {showSiteLocation && (
                          <FormField
                            control={form.control}
                            name="siteLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Area, city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* 5. Product Requirement */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                          Product Requirement
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="productType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Type</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Flush doors" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
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
                          name="additionalDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Sizes, finish, or anything else we should know"
                                  className="min-h-24 resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 6. Purchase Information */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                          Purchase Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="purchaseTimeline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expected Purchase Timeline</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select timeline" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[60vh] overflow-y-auto">
                                    {purchaseTimelineOptions.map((o) => (
                                      <SelectItem key={o.value} value={o.value}>
                                        {o.label}
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
                            name="preferredContactMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Contact Method</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[60vh] overflow-y-auto">
                                    {contactMethodOptions.map((o) => (
                                      <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* 7. Lead Source */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
                          Lead Source
                        </h2>
                        <FormField
                          control={form.control}
                          name="leadSource"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How Did You Hear About Us?</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Google search, referral, social media" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                )}
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