"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Save, User, Phone, Mail, MapPin, Home, DollarSign, Calendar, Users, CheckCircle, FileText, Edit } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface BuyerEditFormProps {
  buyer: any;
  onSubmit: (data: CreateBuyerData) => Promise<void>;
  isLoading?: boolean;
}

export default function BuyerEditForm({ buyer, onSubmit, isLoading = false }: BuyerEditFormProps) {
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
      fullName: buyer?.fullName || "",
      phone: buyer?.phone || "",
      email: buyer?.email || "",
      city: buyer?.city || "",
      propertyType: buyer?.propertyType || "",
      bhk: buyer?.bhk || "",
      purpose: buyer?.purpose || "",
      budgetMin: buyer?.budgetMin || "",
      budgetMax: buyer?.budgetMax || "",
      timeline: buyer?.timeline || "",
      source: buyer?.source || "",
      notes: buyer?.notes || "",
      status: buyer?.status || "NEW"
    }
  });

  const propertyType = watch("propertyType");
  const budgetMin = watch("budgetMin");
  const budgetMax = watch("budgetMax");

  // Set default values when buyer data loads
  useEffect(() => {
    if (buyer) {
      reset({
        fullName: buyer.fullName || "",
        phone: buyer.phone || "",
        email: buyer.email || "",
        city: buyer.city || "",
        propertyType: buyer.propertyType || "",
        bhk: buyer.bhk || "",
        purpose: buyer.purpose || "",
        budgetMin: buyer.budgetMin || "",
        budgetMax: buyer.budgetMax || "",
        timeline: buyer.timeline || "",
        source: buyer.source || "",
        notes: buyer.notes || "",
        status: buyer.status || "NEW"
      });
    }
  }, [buyer, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      setError(null);
      await onSubmit(data);
      toast.success("Buyer updated successfully!");
    } catch (err) {
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

  // Helper function to get display value from enum
  const getDisplayValue = (value: string, type: 'bhk' | 'timeline' | 'source') => {
    const maps = {
      bhk: { 'One': '1', 'Two': '2', 'Three': '3', 'Four': '4', 'Studio': 'Studio' },
      timeline: { 'ZeroToThree': '0-3 months', 'ThreeToSix': '3-6 months', 'MoreThanSix': '6+ months', 'Exploring': 'Exploring' },
      source: { 'Website': 'Website', 'Referral': 'Referral', 'WalkIn': 'Walk-in', 'Call': 'Call', 'Other': 'Other' }
    };
    return (maps[type] as any)[value] || value;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Edit className="h-5 w-5 text-green-600" />
          Edit Buyer Lead
        </CardTitle>
        <CardDescription className="text-green-700">
          Update the buyer lead information below.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
                  onValueChange={(value) => setValue("city", value as any)} 
                  disabled={isLoading}
                  defaultValue={buyer?.city}
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
                  onValueChange={(value) => setValue("propertyType", value as any)} 
                  disabled={isLoading}
                  defaultValue={buyer?.propertyType}
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
                  <Label htmlFor="bhk" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Home className="h-4 w-4 text-gray-500" />
                    BHK *
                  </Label>
                  <Select 
                    onValueChange={(value) => setValue("bhk", getEnumValue(value, 'bhk') as any)} 
                    disabled={isLoading}
                    defaultValue={getDisplayValue(buyer?.bhk || "", 'bhk')}
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
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Purpose *
                </Label>
                <Select 
                  onValueChange={(value) => setValue("purpose", value as any)} 
                  disabled={isLoading}
                  defaultValue={buyer?.purpose}
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
                  onValueChange={(value) => setValue("timeline", getEnumValue(value, 'timeline') as any)} 
                  disabled={isLoading}
                  defaultValue={getDisplayValue(buyer?.timeline || "", 'timeline')}
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
                {errors.timeline && (
                  <p className="text-sm text-red-600">{(errors.timeline as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  Source *
                </Label>
                <Select 
                  onValueChange={(value) => setValue("source", getEnumValue(value, 'source') as any)} 
                  disabled={isLoading}
                  defaultValue={getDisplayValue(buyer?.source || "", 'source')}
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
                {errors.source && (
                  <p className="text-sm text-red-600">{(errors.source as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  Status *
                </Label>
                <Select 
                  onValueChange={(value) => setValue("status", value as any)} 
                  disabled={isLoading}
                  defaultValue={buyer?.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{(errors.status as any)?.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 text-gray-500" />
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Enter any additional notes or comments"
                disabled={isLoading}
                rows={3}
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
              className="bg-green-600 hover:bg-green-700 text-white sm:order-last"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}