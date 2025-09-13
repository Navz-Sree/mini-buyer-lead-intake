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
import { Loader2, Plus, User, Phone, Mail, MapPin, Home, DollarSign, Calendar, Users, Target, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface BuyerFormProps {
  onSubmit: (data: CreateBuyerData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateBuyerData>;
}

export function BuyerForm({ onSubmit, isLoading = false, defaultValues }: BuyerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

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
    try {
      setError(null);
      await onSubmit(data);
      reset();
      toast.success("Buyer created successfully!");
    } catch (err) {
      console.error("Form submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
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
    <Card className="w-full max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Plus className="h-5 w-5 text-blue-600" />
          Create New Buyer Lead
        </CardTitle>
        <CardDescription className="text-blue-700">
          Fill in the details below to create a new buyer lead in the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-gray-500" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter full name"
                  disabled={isLoading}
                  onFocus={() => clearErrors("fullName")}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{(errors.fullName as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4 text-gray-500" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  onFocus={() => clearErrors("phone")}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{(errors.phone as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address (optional)"
                  disabled={isLoading}
                  onFocus={() => clearErrors("email")}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{(errors.email as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  City *
                </Label>
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Home className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Property Requirements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Home className="h-4 w-4 text-gray-500" />
                  Property Type *
                </Label>
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
                <Label htmlFor="purpose" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Target className="h-4 w-4 text-gray-500" />
                  Purpose *
                </Label>
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
                <Label htmlFor="budgetMin" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Minimum Budget (INR)
                </Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...register("budgetMin", { 
                    setValueAs: (value) => value === "" ? undefined : Number(value)
                  })}
                  placeholder="Enter minimum budget"
                  disabled={isLoading}
                  onFocus={() => clearErrors("budgetMin")}
                />
                {errors.budgetMin && (
                  <p className="text-sm text-red-600">{(errors.budgetMin as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Maximum Budget (INR)
                </Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register("budgetMax", { 
                    setValueAs: (value) => value === "" ? undefined : Number(value)
                  })}
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Timeline *
                </Label>
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
                <Label htmlFor="source" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  Source *
                </Label>
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
              <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-gray-500" />
                Notes
              </Label>
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
          <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="sm:order-first"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white sm:order-last"
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}