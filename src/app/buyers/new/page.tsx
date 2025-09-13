import { requireAuth } from "@/lib/requireAuth";
import NewBuyerClient from "./NewBuyerClient";

// Server Component for authentication
export default async function NewBuyerPage() {
  await requireAuth();
  return <NewBuyerClient />;
}
