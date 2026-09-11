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

function buildLabelMap(options: { value: string; label: string }[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

export const customerTypeLabels = buildLabelMap(customerTypeOptions);
export const businessRoleLabels = buildLabelMap(businessRoleOptions);
export const requirementForLabels = buildLabelMap(requirementForOptions);
export const projectTypeLabels = buildLabelMap(projectTypeOptions);
export const purchaseTimelineLabels = buildLabelMap(purchaseTimelineOptions);
export const contactMethodLabels = buildLabelMap(contactMethodOptions);

export function labelFor(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "—";
  return map[value] || value;
}