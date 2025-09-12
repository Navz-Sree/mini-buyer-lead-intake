
import BuyerForm from "../../../components/BuyerForm";
import { useState } from "react";
import type { BuyerFormValues } from "../../../components/BuyerForm";


// Server wrapper for auth
import { requireAuth } from "@/lib/requireAuth";
import { redirect } from "next/navigation";

export default async function NewBuyerPageWrapper() {
  try {
    await requireAuth();
    return <NewBuyerPageClient />;
  } catch {
    redirect("/login");
  }
}

// Client component
function NewBuyerPageClient() {
  const [result, setResult] = useState<string | null>(null);
  const handleSubmit = async (data: BuyerFormValues) => {
    setResult(null);
    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setResult("Lead created successfully!");
    } else {
      const err = await res.json();
      setResult(err.errors ? JSON.stringify(err.errors) : err.error || "Unknown error");
    }
  };
  return (
    <div>
      <h1>Create Buyer Lead</h1>
      <BuyerForm onSubmit={handleSubmit} />
      {result && <div>{result}</div>}
    </div>
  );
}
