import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CreateBuyerSchema, BuyerFilterSchema } from "@/lib/validations";
import { createBuyer, getBuyers } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateBuyerSchema.parse(body);

    // Create buyer with owner ID
    const buyer = await createBuyer({
      ...validatedData,
      ownerId: session.user.id,
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating buyer:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters: any = Object.fromEntries(searchParams.entries());
    
    // Convert string numbers to actual numbers
    if (filters.page) filters.page = parseInt(filters.page, 10);
    if (filters.limit) filters.limit = parseInt(filters.limit, 10);

    const validatedFilters = BuyerFilterSchema.parse(filters);
    const result = await getBuyers(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching buyers:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid filters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}