"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BuyerForm } from "@/components/forms/buyer-form";
import { CreateBuyerData } from "@/lib/validations";

export default function NewBuyerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (data: CreateBuyerData) => {
    console.log("Page handleSubmit called with:", data);
    setIsLoading(true);
    try {
      console.log("Making API call to /api/buyers");
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("API Response:", response.status, response.statusText);

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
        throw new Error(error.message || "Failed to create buyer");
      }

      const buyer = await response.json();
      console.log("Created buyer:", buyer);
      router.push(`/buyers/${buyer.id}`);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      

        <BuyerForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}