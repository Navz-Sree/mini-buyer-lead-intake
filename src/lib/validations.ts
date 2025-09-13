import { z } from "zod";

// Enum definitions matching Prisma schema
export const CityEnum = z.enum([
  "CHANDIGARH",
  "MOHALI", 
  "ZIRAKPUR",
  "PANCHKULA",
  "OTHER"
]);

export const PropertyTypeEnum = z.enum([
  "APARTMENT",
  "INDEPENDENT_HOUSE",
  "VILLA",
  "PLOT",
  "COMMERCIAL"
]);

export const StatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "NOT_INTERESTED",
  "CONVERTED"
]);

export const PriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT"
]);

export const LeadSourceEnum = z.enum([
  "WEBSITE",
  "SOCIAL_MEDIA",
  "REFERRAL",
  "ADVERTISEMENT",
  "COLD_CALL",
  "EMAIL_CAMPAIGN",
  "TRADE_SHOW",
  "OTHER"
]);

export const PossessionTimelineEnum = z.enum([
  "IMMEDIATE",
  "WITHIN_3_MONTHS",
  "WITHIN_6_MONTHS",
  "WITHIN_1_YEAR",
  "AFTER_1_YEAR"
]);

// Type exports for easier use
export type City = z.infer<typeof CityEnum>;
export type PropertyType = z.infer<typeof PropertyTypeEnum>;
export type Status = z.infer<typeof StatusEnum>;
export type Priority = z.infer<typeof PriorityEnum>;
export type LeadSource = z.infer<typeof LeadSourceEnum>;
export type PossessionTimeline = z.infer<typeof PossessionTimelineEnum>;

// Phone validation - 10-15 digits
const phoneRegex = /^\d{10,15}$/;

// Base buyer schema with all validation rules
export const CreateBuyerSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .regex(phoneRegex, "Phone must be 10-15 digits")
    .transform(val => val.replace(/\D/g, "")), // Remove non-digits
  city: z.string().transform((val) => {
    const cityMap: Record<string, City> = {
      'Chandigarh': 'CHANDIGARH',
      'Mohali': 'MOHALI',
      'Zirakpur': 'ZIRAKPUR',
      'Panchkula': 'PANCHKULA',
      'Other': 'OTHER',
      // Also handle uppercase for safety
      'CHANDIGARH': 'CHANDIGARH',
      'MOHALI': 'MOHALI',
      'ZIRAKPUR': 'ZIRAKPUR',
      'PANCHKULA': 'PANCHKULA',
      'OTHER': 'OTHER',
    };
    if (cityMap[val]) {
      return cityMap[val];
    }
    throw new Error(`Invalid city: ${val}. Expected one of: ${Object.keys(cityMap).join(', ')}`);
  }),
  propertyType: z.string().transform((val) => {
    const propertyMap: Record<string, PropertyType> = {
      'Apartment': 'APARTMENT',
      'Villa': 'VILLA', 
      'Plot': 'PLOT',
      'Office': 'COMMERCIAL',
      'Retail': 'COMMERCIAL',
      // Also handle uppercase for safety
      'APARTMENT': 'APARTMENT',
      'VILLA': 'VILLA',
      'PLOT': 'PLOT',
      'COMMERCIAL': 'COMMERCIAL',
    };
    if (propertyMap[val]) {
      return propertyMap[val];
    }
    throw new Error(`Invalid property type: ${val}. Expected one of: ${Object.keys(propertyMap).join(', ')}`);
  }),
  budgetMin: z.number()
    .int("Budget must be a whole number")
    .min(0, "Budget cannot be negative")
    .optional(),
  budgetMax: z.number()
    .int("Budget must be a whole number") 
    .min(0, "Budget cannot be negative")
    .optional(),
  bhkRequirement: z.string()
    .max(50, "BHK requirement must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  possessionTimeline: z.string().transform((val) => {
    const timelineMap: Record<string, PossessionTimeline> = {
      'ZeroToThree': 'IMMEDIATE',
      'ThreeToSix': 'WITHIN_3_MONTHS', 
      'MoreThanSix': 'WITHIN_6_MONTHS',
      'Exploring': 'WITHIN_1_YEAR',
      // Also handle if raw values are sent
      'IMMEDIATE': 'IMMEDIATE',
      'WITHIN_3_MONTHS': 'WITHIN_3_MONTHS',
      'WITHIN_6_MONTHS': 'WITHIN_6_MONTHS', 
      'WITHIN_1_YEAR': 'WITHIN_1_YEAR',
      'AFTER_1_YEAR': 'AFTER_1_YEAR',
    };
    if (timelineMap[val]) {
      return timelineMap[val];
    }
    throw new Error(`Invalid possession timeline: ${val}. Expected one of: ${Object.keys(timelineMap).join(', ')}`);
  }),
  specificRequirements: z.string()
    .max(1000, "Specific requirements must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  leadSource: z.string().transform((val) => {
    const sourceMap: Record<string, LeadSource> = {
      'Website': 'WEBSITE',
      'Referral': 'REFERRAL',
      'WalkIn': 'OTHER', // Map walk-in to OTHER since it's not in schema
      'Call': 'COLD_CALL',
      'Other': 'OTHER',
      // Also handle if raw values are sent
      'WEBSITE': 'WEBSITE',
      'SOCIAL_MEDIA': 'SOCIAL_MEDIA',
      'REFERRAL': 'REFERRAL',
      'ADVERTISEMENT': 'ADVERTISEMENT',
      'COLD_CALL': 'COLD_CALL',
      'EMAIL_CAMPAIGN': 'EMAIL_CAMPAIGN',
      'TRADE_SHOW': 'TRADE_SHOW',
      'OTHER': 'OTHER',
    };
    if (sourceMap[val]) {
      return sourceMap[val];
    }
    throw new Error(`Invalid lead source: ${val}. Expected one of: ${Object.keys(sourceMap).join(', ')}`);
  }),
  status: StatusEnum.default("NEW"),
  priority: PriorityEnum.default("MEDIUM"),
  notes: z.string()
    .max(2000, "Notes must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  // Budget validation: max must be greater than min
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

// Export the type for use in components
export type CreateBuyerData = z.infer<typeof CreateBuyerSchema>;

// Filter schema for search/listing
export const BuyerFilterSchema = z.object({
  search: z.string().optional(),
  city: CityEnum.optional(),
  propertyType: PropertyTypeEnum.optional(),
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  leadSource: LeadSourceEnum.optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['fullName', 'createdAt', 'updatedAt', 'status', 'priority']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BuyerFilters = z.infer<typeof BuyerFilterSchema>;

// CSV Import Schema
export const CSVBuyerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  city: z.string().transform((val) => {
    const cityMap: Record<string, City> = {
      'Chandigarh': 'CHANDIGARH',
      'Mohali': 'MOHALI',
      'Zirakpur': 'ZIRAKPUR',
      'Panchkula': 'PANCHKULA',
      'Other': 'OTHER',
      // Also handle uppercase for safety
      'CHANDIGARH': 'CHANDIGARH',
      'MOHALI': 'MOHALI',
      'ZIRAKPUR': 'ZIRAKPUR',
      'PANCHKULA': 'PANCHKULA',
      'OTHER': 'OTHER',
    };
    if (cityMap[val]) {
      return cityMap[val];
    }
    throw new Error(`Invalid city: ${val}`);
  }),
  propertyType: z.string().transform((val) => {
    const propertyMap: Record<string, PropertyType> = {
      'Apartment': 'APARTMENT',
      'Villa': 'VILLA', 
      'Plot': 'PLOT',
      'Office': 'COMMERCIAL',
      'Retail': 'COMMERCIAL',
      // Also handle uppercase for safety
      'APARTMENT': 'APARTMENT',
      'VILLA': 'VILLA',
      'PLOT': 'PLOT',
      'COMMERCIAL': 'COMMERCIAL',
    };
    if (propertyMap[val]) {
      return propertyMap[val];
    }
    throw new Error(`Invalid property type: ${val}`);
  }),
  budgetMin: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  budgetMax: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  bhkRequirement: z.string().optional(),
  possessionTimeline: z.string().transform((val) => {
    const normalizedVal = val.toUpperCase().replace(/\s+/g, '_');
    const timelineMap: Record<string, PossessionTimeline> = {
      'IMMEDIATE': 'IMMEDIATE',
      'WITHIN_3_MONTHS': 'WITHIN_3_MONTHS',
      'WITHIN_6_MONTHS': 'WITHIN_6_MONTHS',
      'WITHIN_1_YEAR': 'WITHIN_1_YEAR',
      'AFTER_1_YEAR': 'AFTER_1_YEAR',
    };
    if (timelineMap[normalizedVal]) {
      return timelineMap[normalizedVal];
    }
    throw new Error(`Invalid possession timeline: ${val}`);
  }),
  specificRequirements: z.string().optional(),
  leadSource: z.string().transform((val) => {
    const normalizedVal = val.toUpperCase().replace(/\s+/g, '_');
    const sourceMap: Record<string, LeadSource> = {
      'WEBSITE': 'WEBSITE',
      'SOCIAL_MEDIA': 'SOCIAL_MEDIA',
      'REFERRAL': 'REFERRAL',
      'ADVERTISEMENT': 'ADVERTISEMENT',
      'COLD_CALL': 'COLD_CALL',
      'EMAIL_CAMPAIGN': 'EMAIL_CAMPAIGN',
      'TRADE_SHOW': 'TRADE_SHOW',
      'OTHER': 'OTHER',
    };
    if (sourceMap[normalizedVal]) {
      return sourceMap[normalizedVal];
    }
    throw new Error(`Invalid lead source: ${val}`);
  }),
  status: z.string().transform((val) => {
    const normalizedVal = val.toUpperCase().replace(/\s+/g, '_');
    const statusMap: Record<string, Status> = {
      'NEW': 'NEW',
      'CONTACTED': 'CONTACTED',
      'INTERESTED': 'INTERESTED',
      'NOT_INTERESTED': 'NOT_INTERESTED',
      'CONVERTED': 'CONVERTED',
    };
    if (statusMap[normalizedVal]) {
      return statusMap[normalizedVal];
    }
    return 'NEW'; // Default value
  }).optional(),
  priority: z.string().transform((val) => {
    const normalizedVal = val.toUpperCase();
    const priorityMap: Record<string, Priority> = {
      'LOW': 'LOW',
      'MEDIUM': 'MEDIUM',
      'HIGH': 'HIGH',
      'URGENT': 'URGENT',
    };
    if (priorityMap[normalizedVal]) {
      return priorityMap[normalizedVal];
    }
    return 'MEDIUM'; // Default value
  }).optional(),
  notes: z.string().optional(),
});

export type CSVBuyerData = z.infer<typeof CSVBuyerSchema>;