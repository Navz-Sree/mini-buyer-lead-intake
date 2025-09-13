"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BuyerForm } from "@/components/forms/buyer-form";
import { CreateBuyerData } from "@/lib/validations";
import { useToast } from "@/components/ui/toast";
import { Loader2, UserPlus, LogIn } from "lucide-react";

export default function NewBuyerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Application</h2>
          <p className="text-gray-600">Please wait while we authenticate your session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.id) {
    router.push("/auth/signin");
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LogIn className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Redirecting to Sign In</h2>
          <p className="text-gray-600">Please wait while we redirect you to the authentication page...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateBuyerData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create buyer");
      }

      const buyer = await response.json();
      toast.success("Buyer created successfully!", {
        action: {
          label: "View Buyer",
          onClick: () => router.push(`/buyers/${buyer.id}`)
        }
      });
      router.push(`/buyers/${buyer.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create buyer";
      toast.error(errorMessage);
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BuyerForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}