import BuyersClient from "./BuyersClient";
import { getBuyers } from "@/lib/buyerData";
import { requireAuth } from "@/lib/requireAuth";

// Server Component for SSR buyers list
export default async function BuyersPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
	await requireAuth();

	// Parse filters from URL
	const search = typeof searchParams.search === "string" ? searchParams.search : "";
	const city = typeof searchParams.city === "string" ? searchParams.city : "";
	const propertyType = typeof searchParams.propertyType === "string" ? searchParams.propertyType : "";
	const status = typeof searchParams.status === "string" ? searchParams.status : "";
	const timeline = typeof searchParams.timeline === "string" ? searchParams.timeline : "";
	const page = parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10);
	const PAGE_SIZE = 10;

	const { buyers, total } = await getBuyers({ search, city, propertyType, status, timeline, page, pageSize: PAGE_SIZE });

	return (
		   <BuyersClient
			   initialBuyers={buyers}
			   total={total}
			   pageSize={PAGE_SIZE}
		   />
	);
}
