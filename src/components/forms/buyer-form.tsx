"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateBuyerSchema, type CreateBuyerData } from "@/lib/validations";
import { Loader2, Plus } from "lucide-react";

interface BuyerFormProps {
  onSubmit: (data: CreateBuyerData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateBuyerData>;
}

export function BuyerForm({ onSubmit, isLoading = false, defaultValues }: BuyerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors
  } = useForm<any>({
    resolver: zodResolver(CreateBuyerSchema) as any,
    defaultValues: {
      status: "NEW",
      ...defaultValues
    }
  });

  const propertyType = watch("propertyType");
  const budgetMin = watch("budgetMin");
  const budgetMax = watch("budgetMax");

  const handleFormSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", errors);
    try {
      setError(null);
      await onSubmit(data);
      reset();
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Helper function to convert display values to enum values
  const getEnumValue = (value: string, type: 'bhk' | 'timeline' | 'source') => {
    const maps = {
      bhk: { '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', 'Studio': 'Studio' },
      timeline: { '0-3 months': 'ZeroToThree', '3-6 months': 'ThreeToSix', '6+ months': 'MoreThanSix', 'Exploring': 'Exploring' },
      source: { 'Website': 'Website', 'Referral': 'Referral', 'Walk-in': 'WalkIn', 'Call': 'Call', 'Other': 'Other' }
    };
    return (maps[type] as any)[value] || value;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Buyer Lead
        </CardTitle>
        <CardDescription>
          Fill in the details below to create a new buyer lead in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug: Show validation errors */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Validation Errors:</strong>
                <pre>{JSON.stringify(errors, null, 2)}</pre>
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter full name"
                  disabled={isLoading}
                  onFocus={() => clearErrors("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{(errors.fullName as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  onFocus={() => clearErrors("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{(errors.phone as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address (optional)"
                  disabled={isLoading}
                  onFocus={() => clearErrors("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{(errors.email as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("city", value as any);
                    clearErrors("city");
                  }} 
                  disabled={isLoading}
                  onOpenChange={() => clearErrors("city")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                    <SelectItem value="Mohali">Mohali</SelectItem>
                    <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                    <SelectItem value="Panchkula">Panchkula</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-sm text-red-600">{(errors.city as any)?.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("propertyType", value as any);
                    clearErrors("propertyType");
                  }} 
                  disabled={isLoading}
                  onOpenChange={() => clearErrors("propertyType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="text-sm text-red-600">{(errors.propertyType as any)?.message}</p>
                )}
              </div>

              {/* BHK - Only show for Apartment/Villa */}
              {(propertyType === "APARTMENT" || propertyType === "VILLA") && (
                <div className="space-y-2">
                  <Label htmlFor="bhk">BHK *</Label>
                  <Select 
                    onValueChange={(value) => {
                      setValue("bhk", getEnumValue(value, 'bhk') as any);
                      clearErrors("bhk");
                    }} 
                    disabled={isLoading}
                    onOpenChange={() => clearErrors("bhk")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4 BHK</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bhk && (
                    <p className="text-sm text-red-600">{(errors.bhk as any)?.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("purpose", value as any);
                    clearErrors("purpose");
                  }} 
                  disabled={isLoading}
                  onOpenChange={() => clearErrors("purpose")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purpose && (
                  <p className="text-sm text-red-600">{(errors.purpose as any)?.message}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum Budget (INR)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...register("budgetMin", { valueAsNumber: true })}
                  placeholder="Enter minimum budget"
                  disabled={isLoading}
                  onFocus={() => clearErrors("budgetMin")}
                />
                {errors.budgetMin && (
                  <p className="text-sm text-red-600">{(errors.budgetMin as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum Budget (INR)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register("budgetMax", { valueAsNumber: true })}
                  placeholder="Enter maximum budget"
                  disabled={isLoading}
                  onFocus={() => clearErrors("budgetMax")}
                />
                {errors.budgetMax && (
                  <p className="text-sm text-red-600">{(errors.budgetMax as any)?.message}</p>
                )}
                {budgetMin && budgetMax && budgetMax < budgetMin && (
                  <p className="text-sm text-red-600">Maximum budget must be greater than minimum budget</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("possessionTimeline", getEnumValue(value, 'timeline') as any);
                    clearErrors("possessionTimeline");
                  }} 
                  disabled={isLoading}
                  onOpenChange={() => clearErrors("possessionTimeline")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3 months">0-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                    <SelectItem value="Exploring">Exploring</SelectItem>
                  </SelectContent>
                </Select>
                {errors.possessionTimeline && (
                  <p className="text-sm text-red-600">{(errors.possessionTimeline as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("leadSource", getEnumValue(value, 'source') as any);
                    clearErrors("leadSource");
                  }} 
                  disabled={isLoading}
                  onOpenChange={() => clearErrors("leadSource")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.leadSource && (
                  <p className="text-sm text-red-600">{(errors.leadSource as any)?.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Enter any additional notes or comments"
                disabled={isLoading}
                rows={3}
                onFocus={() => clearErrors("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{(errors.notes as any)?.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Lead...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lead
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}