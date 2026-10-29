import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  company: z.string().optional(),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  message: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal("")),
  fileName: z.string().optional(),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const inquiryStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "CLOSED"]),
  assignedToId: z.string().nullable().optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
});

export const prospectCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  location: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  contactPerson: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  potentialParts: z.string().optional().or(z.literal("")),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  remarks: z.string().optional().or(z.literal("")),
});
export type ProspectCompanyValues = z.infer<typeof prospectCompanySchema>;

export const companyVisitSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  visitDate: z.string().min(1, "Visit date is required"),
  purpose: z.string().optional(),
  requirement: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["INTERESTED", "NOT_INTERESTED", "CONVERTED", "ON_HOLD"]),
  followUpDate: z.string().optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  prospectId: z.string().optional().or(z.literal("")),
  // For inline new company creation
  newProspect: prospectCompanySchema.optional(),
});
export type CompanyVisitValues = z.infer<typeof companyVisitSchema>;

export const costingRecordSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  deliveryTime: z.string().optional().or(z.literal("")),
  itemsJson: z.any().optional(),
  materialType: z.string().min(1),
  thicknessMm: z.coerce.number().min(0),
  weightKg: z.coerce.number().min(0),
  materialRatePerKg: z.coerce.number().min(0),
  cuttingLengthM: z.coerce.number().min(0),
  cuttingRatePerM: z.coerce.number().min(0),
  bendCount: z.coerce.number().min(0),
  bendRatePerBend: z.coerce.number().min(0),
  wastagePercent: z.coerce.number().min(0).default(0),
  marginPercent: z.coerce.number().min(0).default(0),
  gstPercent: z.coerce.number().min(0).default(18),
  inquiryId: z.string().optional().or(z.literal("")),
});
export type CostingRecordValues = z.infer<typeof costingRecordSchema>;

export const portfolioCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});
export type PortfolioCategoryValues = z.infer<typeof portfolioCategorySchema>;

export const portfolioItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  slug: z.string().optional(),
  categoryId: z.string().min(1, "Choose a category"),
  industry: z.string().min(1, "Industry is required"),
  processes: z.string().min(1, "Process is required"),
  materials: z.string().min(1, "Material is required"),
  material: z.string().optional(),
  applicationType: z.enum([
    "Job Work",
    "OEM Component",
    "Standard Product",
    "Custom Fabrication",
  ]).default("Job Work"),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  displayOrder: z.coerce.number().optional().default(0),
});
export type PortfolioItemValues = z.infer<typeof portfolioItemSchema>;

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});
export type EmployeeValues = z.infer<typeof employeeSchema>;

export const materialSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  ratePerKg: z.coerce.number().min(0).optional().nullable(),
  cuttingCostHourly: z.coerce.number().min(0).optional().nullable(),
  bendingCostHourly: z.coerce.number().min(0).optional().nullable(),
});
export type MaterialValues = z.infer<typeof materialSchema>;

export const machineSchema = z.object({
  name: z.string().min(1, "Machine name is required"),
  type: z.enum(["CUTTING", "BENDING"]),
});
export type MachineValues = z.infer<typeof machineSchema>;

export const jobworkLineItemSchema = z.object({
  id: z.string(),
  partName: z.string().min(1, "Part / process description is required"),
  processType: z.string().default("Laser Cutting"),
  material: z.string().optional().or(z.literal("")),
  thicknessMm: z.coerce.number().optional().default(0),
  hsnSac: z.string().default("9988"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().default("Pcs"),
  unitPrice: z.coerce.number().min(0, "Rate must be 0 or higher"),
  total: z.coerce.number().min(0),
});
export type JobworkLineItem = z.infer<typeof jobworkLineItemSchema>;

export const jobworkSaleSchema = z.object({
  invoiceNumber: z.string().optional().or(z.literal("")),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional().or(z.literal("")),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().optional().or(z.literal("")),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerGst: z.string().optional().or(z.literal("")),
  customerAddress: z.string().optional().or(z.literal("")),
  placeOfSupply: z.string().optional().default("Ahmedabad"),
  shipToName: z.string().optional().or(z.literal("")),
  shipToAddress: z.string().optional().or(z.literal("")),
  shipToPhone: z.string().optional().or(z.literal("")),
  shipToGst: z.string().optional().or(z.literal("")),
  challanNumber: z.string().optional().or(z.literal("")),
  jobDescription: z.string().optional().or(z.literal("")),
  items: z.array(jobworkLineItemSchema).min(1, "Please add at least one line item"),
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRatePercent: z.coerce.number().min(0).default(18),
  taxAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0).default(0),
  balanceAmount: z.coerce.number().default(0),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).default("PENDING"),
  paymentMethod: z.string().optional().or(z.literal("")),
  jobStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
});
export type JobworkSaleValues = z.infer<typeof jobworkSaleSchema>;

export const siteSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  pincode: z.string().min(1, "Pincode is required"),
  gstNo: z.string().min(1, "GST number is required"),
  panNo: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  bankBranch: z.string().optional().or(z.literal("")),
  bankAccountNo: z.string().optional().or(z.literal("")),
  bankIfsc: z.string().optional().or(z.literal("")),
  termsAndConditions: z.string().optional().or(z.literal("")),
  authorisedSignature: z.string().optional().or(z.literal("")),
  signatureDesignation: z.string().optional().or(z.literal("")),
  signatureImageUrl: z.string().optional().nullable().or(z.literal("")),
});
export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
