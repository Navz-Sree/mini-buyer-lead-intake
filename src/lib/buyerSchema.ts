import { z, RefinementCtx } from "zod";

export const cityEnum = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]);
export const propertyTypeEnum = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]);
export const bhkEnum = z.enum(["Studio", "1", "2", "3", "4"]);
export const purposeEnum = z.enum(["Buy", "Rent"]);
export const timelineEnum = z.enum(["0-3m", "3-6m", ">6m", "Exploring"]);
export const sourceEnum = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]);
export const statusEnum = z.enum([
  "New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"
]);

export const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional().superRefine((val, ctx: RefinementCtx) => {
    // @ts-expect-error: Zod type inference limitation for nested enums
    const type = ctx.parent?.propertyType;
    if (["Apartment", "Villa"].includes(type)) {
      if (val === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BHK is required for Apartment or Villa",
        });
      }
    }
  }),
  purpose: purposeEnum,
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional().superRefine((val, ctx: RefinementCtx) => {
    // @ts-expect-error: Zod type inference limitation for nested enums
    const min = ctx.parent?.budgetMin;
    if (val !== undefined && min !== undefined) {
      if (val < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "budgetMax must be greater than or equal to budgetMin",
        });
      }
    }
  }),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  status: statusEnum.optional(),
});

export type BuyerFormData = z.infer<typeof buyerSchema>;
