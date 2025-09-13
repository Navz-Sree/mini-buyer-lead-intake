import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { BuyerFilters } from "./validations";

export interface PaginatedBuyers {
  buyers: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BuyerHistoryEntry {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: Date;
  diff: any;
  user?: { email: string | null };
}

// Create a new buyer
export async function createBuyer(data: any) {
  const buyer = await prisma.buyer.create({
    data,
  });

  // Create history entry
  await createBuyerHistory(buyer.id, data.ownerId, "created", `Created new buyer lead for ${data.fullName}`);

  return buyer;
}

// Get buyer by ID
export async function getBuyerById(id: string, userId?: string) {
  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      owner: {
        select: { email: true, id: true }
      },
      history: {
        orderBy: { changedAt: 'desc' },
        take: 10 // Limit to latest 10 history entries
      }
    }
  });

  if (!buyer) return null;

  // Check ownership if userId provided
  if (userId && buyer.ownerId !== userId) {
    // Only allow read access, not edit
    return { ...buyer, canEdit: false };
  }

  return { ...buyer, canEdit: true };
}

// Update buyer
export async function updateBuyer(
  id: string, 
  data: any, 
  userId: string,
  currentUpdatedAt: Date
) {
  // Check if buyer exists and get current data
  const existingBuyer = await prisma.buyer.findUnique({
    where: { id }
  });

  if (!existingBuyer) {
    throw new Error("Buyer not found");
  }

  // Check ownership
  if (existingBuyer.ownerId !== userId) {
    throw new Error("Unauthorized: You can only edit your own leads");
  }

  // Check for concurrent updates
  if (existingBuyer.updatedAt.getTime() !== currentUpdatedAt.getTime()) {
    throw new Error("Record has been modified by another user. Please refresh and try again.");
  }

  // Update buyer
  const updatedBuyer = await prisma.buyer.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  // Create history entry
  await createBuyerHistory(id, userId, "updated", "Buyer information updated");

  return updatedBuyer;
}

// Delete buyer
export async function deleteBuyer(id: string, userId: string) {
  const buyer = await prisma.buyer.findUnique({
    where: { id }
  });

  if (!buyer) {
    throw new Error("Buyer not found");
  }

  if (buyer.ownerId !== userId) {
    throw new Error("Unauthorized: You can only delete your own leads");
  }

  // Delete buyer (history will be deleted by cascade)
  await prisma.buyer.delete({
    where: { id }
  });

  return true;
}

// Get buyers with filtering, pagination, and search
export async function getBuyers(filters: BuyerFilters): Promise<PaginatedBuyers> {
  const {
    city,
    propertyType,
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = "updatedAt",
    sortOrder = "desc"
  } = filters;

  // Build where clause
  const where: Prisma.BuyerWhereInput = {};

  if (city) where.city = city as any;
  if (propertyType) where.propertyType = propertyType as any;
  if (status) where.status = status as any;
  // Removed timeline filter

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Get total count
  const total = await prisma.buyer.count({ where });

  // Get buyers
  const buyers = await prisma.buyer.findMany({
    where,
    include: {
      owner: {
        select: { email: true }
      }
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    skip: offset,
    take: limit,
  });

  return {
    buyers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Create buyer history entry
export async function createBuyerHistory(
  buyerId: string,
  changedBy: string,
  action: string,
  changes?: string
) {
  await prisma.buyerHistory.create({
    data: {
      buyerId,
      changedBy,
      action,
      changes,
    },
  });
}

// Get buyer history
export async function getBuyerHistory(buyerId: string, limit: number = 5): Promise<BuyerHistoryEntry[]> {
  const history = await prisma.buyerHistory.findMany({
    where: { buyerId },
    include: {
      user: {
        select: { email: true }
      }
    },
    orderBy: { changedAt: "desc" },
    take: limit,
  });

  return history as any;
}

// Bulk create buyers (for CSV import)
export async function bulkCreateBuyers(
  buyersData: any[],
  ownerId: string
) {
  return await prisma.$transaction(async (tx) => {
    const createdBuyers = [];
    
    for (const buyerData of buyersData) {
      const buyer = await tx.buyer.create({
        data: {
          ...buyerData,
          ownerId,
          tags: buyerData.tags || [],
        },
      });

      // Create history entry
      await tx.buyerHistory.create({
        data: {
          buyerId: buyer.id,
          changedBy: ownerId,
          action: "CREATED",
          changes: `Imported buyer: ${buyerData.fullName} (${buyerData.phone})`,
        },
      });

      createdBuyers.push(buyer);
    }
    
    return createdBuyers;
  });
}

// Get buyers for export (with filters applied)
export async function getBuyersForExport(filters: Omit<BuyerFilters, "page" | "limit">) {
  const {
    city,
    propertyType,
    status,
    search,
    sortBy = "updatedAt",
    sortOrder = "desc"
  } = filters;

  // Build where clause
  const where: Prisma.BuyerWhereInput = {};

  if (city) where.city = city as any;
  if (propertyType) where.propertyType = propertyType as any;
  if (status) where.status = status as any;
  // Removed timeline filter

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return await prisma.buyer.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder
    },
  });
}

// Get buyer stats (for dashboard)
export async function getBuyerStats(ownerId?: string) {
  const where: Prisma.BuyerWhereInput = ownerId ? { ownerId } : {};

  const [
    total,
    newLeads,
    qualified,
    converted,
    dropped
  ] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.count({ where: { ...where, status: "NEW" } }),
    prisma.buyer.count({ where: { ...where, status: "CONTACTED" } }),
    prisma.buyer.count({ where: { ...where, status: "CONVERTED" } }),
    prisma.buyer.count({ where: { ...where, status: "NOT_INTERESTED" } }),
  ]);

  return {
    total,
    newLeads,
    qualified,
    converted,
    dropped,
    conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : "0",
  };
}
