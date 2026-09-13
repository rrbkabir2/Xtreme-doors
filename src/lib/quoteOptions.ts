// FILE: src/lib/quoteOptions.ts
// ACTION: Replace the ENTIRE file with this

// Shared between the public quote form (GetQuote.tsx) and the admin
// quotes view (AdminQuotes.tsx) so the option lists and their labels
// never drift out of sync between the two.

export const BUSINESS_LIKE_TYPES = ["business", "dealer", "contractor", "architect", "builder"] as const;

export const customerTypeOptions = [
  { value: "individual", label: "Individual / Homeowner" },
  { value: "business", label: "Business / Company" },
  { value: "dealer", label: "Dealer / Distributor" },
  { value: "contractor", label: "Contractor" },
  { value: "architect", label: "Architect / Interior Designer" },
  { value: "builder", label: "Builder / Developer" },
  { value: "other", label: "Other" },
];

export const businessRoleOptions = [
  { value: "partner", label: "Partner" },
  { value: "director", label: "Director" },
  { value: "ceo", label: "CEO" },
  { value: "md", label: "Managing Director (MD)" },
  { value: "general_manager", label: "General Manager" },
  { value: "purchase_manager", label: "Purchase Manager" },
  { value: "procurement_executive", label: "Procurement Executive" },
  { value: "project_manager", label: "Project Manager" },
  { value: "architect", label: "Architect" },
  { value: "interior_designer", label: "Interior Designer" },
  { value: "contractor", label: "Contractor" },
  { value: "builder_developer", label: "Builder / Developer" },
  { value: "employee_staff", label: "Employee / Staff" },
  { value: "authorized_representative", label: "Authorized Representative" },
  { value: "other", label: "Other" },
];

export const requirementForOptions = [
  { value: "residential", label: "Residential / Home" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "villa", label: "Villa / Bungalow" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail / Showroom" },
  { value: "hotel", label: "Hotel / Hospitality" },
  { value: "hospital", label: "Hospital / Healthcare" },
  { value: "school", label: "School / College / Institution" },
  { value: "industrial", label: "Industrial" },
  { value: "commercial", label: "Commercial Building" },
  { value: "other", label: "Other" },
];

export const projectTypeOptions = [
  { value: "new_construction", label: "New Construction" },
  { value: "renovation", label: "Renovation" },
  { value: "replacement", label: "Replacement" },
  { value: "interior", label: "Interior Project" },
  { value: "maintenance", label: "Maintenance / Repair" },
  { value: "other", label: "Other" },
];

export const purchaseTimelineOptions = [
  { value: "immediate", label: "Immediate" },
  { value: "1_week", label: "Within 1 Week" },
  { value: "1_month", label: "Within 1 Month" },
  { value: "1_3_months", label: "1–3 Months" },
  { value: "3_6_months", label: "3–6 Months" },
  { value: "6_plus_months", label: "More than 6 Months" },
  { value: "researching", label: "Just Enquiring / Researching" },
];

export const contactMethodOptions = [
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export const leadSourceOptions = [
  { value: "google_search", label: "Google Search" },
  { value: "social_media", label: "Social Media (Facebook/Instagram)" },
  { value: "referral", label: "Referral (Friend/Family)" },
  { value: "existing_customer", label: "Existing Customer" },
  { value: "newspaper_ad", label: "Newspaper / Print Ad" },
  { value: "exhibition", label: "Exhibition / Trade Show" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

// Accepts common ways people type an Indian mobile number (with/without
// +91, spaces, dashes, a leading 0) and normalizes down to the bare
// 10-digit number, which is what actually gets validated and stored.
// A real Indian mobile number always starts with 6, 7, 8, or 9.
export function normalizeIndianMobile(raw: string): string {
  let digits = raw.replace(/[\s\-()]/g, "");
  digits = digits.replace(/^\+?91/, "");
  digits = digits.replace(/^0/, "");
  return digits;
}

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function isValidIndianMobile(raw: string): boolean {
  return INDIAN_MOBILE_REGEX.test(normalizeIndianMobile(raw));
}

function buildLabelMap(options: { value: string; label: string }[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

export const customerTypeLabels = buildLabelMap(customerTypeOptions);
export const businessRoleLabels = buildLabelMap(businessRoleOptions);
export const requirementForLabels = buildLabelMap(requirementForOptions);
export const projectTypeLabels = buildLabelMap(projectTypeOptions);
export const purchaseTimelineLabels = buildLabelMap(purchaseTimelineOptions);
export const contactMethodLabels = buildLabelMap(contactMethodOptions);
export const leadSourceLabels = buildLabelMap(leadSourceOptions);

export function labelFor(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "—";
  return map[value] || value;
}