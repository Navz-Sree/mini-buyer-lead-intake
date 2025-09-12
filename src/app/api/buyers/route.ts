import { NextRequest, NextResponse } from "next/server";
import { buyerSchema } from "../../../lib/buyerSchema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = buyerSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }
    // TODO: Save to database
    // const buyer = await prisma.buyer.create({ data: parsed.data });
    return NextResponse.json({ success: true, buyer: parsed.data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
