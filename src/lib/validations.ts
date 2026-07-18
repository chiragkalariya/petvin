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
});
export type CompanyVisitValues = z.infer<typeof companyVisitSchema>;

export const costingRecordSchema = z.object({
  title: z.string().min(1, "Give this quote a name"),
  materialType: z.string().min(1),
  thicknessMm: z.coerce.number().min(0),
  weightKg: z.coerce.number().min(0),
  materialRatePerKg: z.coerce.number().min(0),
  cuttingLengthM: z.coerce.number().min(0),
  cuttingRatePerM: z.coerce.number().min(0),
  bendCount: z.coerce.number().int().min(0),
  bendRatePerBend: z.coerce.number().min(0),
  wastagePercent: z.coerce.number().min(0),
  marginPercent: z.coerce.number().min(0),
  gstPercent: z.coerce.number().min(0),
  inquiryId: z.string().optional().or(z.literal("")),
});
export type CostingRecordValues = z.infer<typeof costingRecordSchema>;

export const portfolioCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
});
export type PortfolioCategoryValues = z.infer<typeof portfolioCategorySchema>;

export const portfolioItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  material: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Choose a category"),
  featured: z.boolean().optional(),
});
export type PortfolioItemValues = z.infer<typeof portfolioItemSchema>;

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});
export type EmployeeValues = z.infer<typeof employeeSchema>;
