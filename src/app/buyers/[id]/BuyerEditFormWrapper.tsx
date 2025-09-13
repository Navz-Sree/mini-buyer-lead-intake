"use client";

import { useRouter } from "next/navigation";
import BuyerEditForm from "@/components/forms/buyer-edit-form";

export default function BuyerEditFormWrapper({ buyer }: { buyer: any }) {
  const router = useRouter();

  const handleUpdate = async (data: any) => {
    const response = await fetch(`/api/buyers/${buyer.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        updatedAt: buyer.updatedAt?.toISOString?.() || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update buyer");
    }

    router.push(`/buyers/${buyer.id}`);
  };

  return <BuyerEditForm buyer={buyer} onSubmit={handleUpdate} />;
}
