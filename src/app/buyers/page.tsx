"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, Filter, Download, Upload, RotateCcw, Eye, TrendingUp, TrendingDown, Clock, MapPin, Home, Phone, Mail, Calendar, Target } from "lucide-react";
import { debounce } from "@/lib/utils";
import { formatBudgetRange, formatRelativeTime, formatPhoneNumber } from "@/lib/utils";
import { BuyersPageSkeleton, PageLoadingSkeleton, BuyersListSkeleton } from "@/components/ui/skeletons";
import { CSVImportDialog } from "@/components/csv/csv-import";
import { CSVExportDialog } from "@/components/csv/csv-export";

interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status: string;
  updatedAt: string;
  owner: { email: string };
}

interface PaginatedBuyers {
  buyers: Buyer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BuyersPage() {
  return (
    <Suspense fallback={<BuyersPageSkeleton />}>
      <BuyersPageContent />
    </Suspense>
  );
}

function BuyersPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<PaginatedBuyers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [status_filter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [timeline, setTimeline] = useState(searchParams.get("timeline") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "updatedAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Search function - defined early to ensure consistent hook order  
  const handleSearch = useCallback((searchTerm: string) => {
    setCurrentPage(1);
    setSearch(searchTerm);
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  // Transform frontend values to backend format
  const transformToBackendFormat = (value: string, type: string) => {
    if (!value || value === "all") return "";
    
    const transformMaps: Record<string, Record<string, string>> = {
      city: {
        "Chandigarh": "CHANDIGARH",
        "Mohali": "MOHALI",
        "Zirakpur": "ZIRAKPUR",
        "Panchkula": "PANCHKULA",
        "Other": "OTHER"
      },
      propertyType: {
        "Apartment": "APARTMENT",
        "Villa": "VILLA",
        "Plot": "PLOT",
        "Office": "COMMERCIAL",
        "Retail": "COMMERCIAL"
      },
      status: {
        "New": "NEW",
        "Qualified": "CONTACTED",
        "Contacted": "CONTACTED",
        "Visited": "INTERESTED",
        "Negotiation": "INTERESTED",
        "Converted": "CONVERTED",
        "Dropped": "NOT_INTERESTED"
      },
      timeline: {
        "ZeroToThree": "IMMEDIATE",
        "ThreeToSix": "WITHIN_3_MONTHS",
        "MoreThanSix": "WITHIN_6_MONTHS",
        "Exploring": "WITHIN_1_YEAR"
      }
    };
    
    return transformMaps[type]?.[value] || value;
  };

  // Fetch buyers function
  const fetchBuyers = async (
    searchTerm = search,
    cityFilter = city,
    propTypeFilter = propertyType,
    statusFilter = status_filter,
    timelineFilter = timeline,
    page = currentPage,
    sort = sortBy,
    order = sortOrder
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      
      // Transform values to backend format
      const backendCity = transformToBackendFormat(cityFilter, "city");
      const backendPropertyType = transformToBackendFormat(propTypeFilter, "propertyType");
      const backendStatus = transformToBackendFormat(statusFilter, "status");
      const backendTimeline = transformToBackendFormat(timelineFilter, "timeline");
      
      if (backendCity) params.set("city", backendCity);
      if (backendPropertyType) params.set("propertyType", backendPropertyType);
      if (backendStatus) params.set("status", backendStatus);
      if (backendTimeline) params.set("timeline", backendTimeline);
      params.set("page", page.toString());
      params.set("limit", "10");
      params.set("sortBy", sort);
      params.set("sortOrder", order);

      // Update URL
      const newUrl = `/buyers?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);

      const response = await fetch(`/api/buyers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch buyers");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update the debounced search to use fetchBuyers

  // Initial load and when filters change
  useEffect(() => {
    fetchBuyers();
  }, [search, city, propertyType, status_filter, timeline, currentPage, sortBy, sortOrder]);

  // Handle authentication state changes
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Early returns after all hooks
  if (status === "loading") {
    return <PageLoadingSkeleton />;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return <PageLoadingSkeleton />; // Show loading while redirecting
  }

  if (!session?.user?.id) {
    router.push("/auth/signin");
    return <PageLoadingSkeleton />; // Show loading while redirecting
  }

  // Convert enum values to display values
  const getDisplayValue = (value: string, type: string) => {
    const maps: Record<string, Record<string, string>> = {
      bhk: { One: "1 BHK", Two: "2 BHK", Three: "3 BHK", Four: "4 BHK", Studio: "Studio" },
      timeline: { 
        IMMEDIATE: "Immediate", 
        WITHIN_3_MONTHS: "0-3 months", 
        WITHIN_6_MONTHS: "3-6 months", 
        WITHIN_1_YEAR: "6+ months",
        AFTER_1_YEAR: "After 1 year"
      },
      source: { 
        WEBSITE: "Website",
        SOCIAL_MEDIA: "Social Media",
        REFERRAL: "Referral",
        ADVERTISEMENT: "Advertisement",
        COLD_CALL: "Cold Call",
        EMAIL_CAMPAIGN: "Email Campaign",
        TRADE_SHOW: "Trade Show",
        OTHER: "Other"
      },
      status: { 
        NEW: "New", 
        CONTACTED: "Contacted", 
        INTERESTED: "Interested", 
        NOT_INTERESTED: "Not Interested", 
        CONVERTED: "Converted"
      }
    };
    return maps[type]?.[value] || value;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800",
      CONTACTED: "bg-yellow-100 text-yellow-800",
      INTERESTED: "bg-green-100 text-green-800",
      NOT_INTERESTED: "bg-red-100 text-red-800",
      CONVERTED: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                Buyer Leads
              </h1>
              <p className="mt-2 text-gray-600 flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-500" />
                Manage and track your buyer leads pipeline
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CSVImportDialog />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Import leads from CSV file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CSVExportDialog 
                        currentFilters={{
                          search,
                          city,
                          propertyType,
                          status: status_filter,
                          timeline
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export filtered leads to CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Link href="/buyers/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Lead
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Filter className="h-5 w-5 text-gray-600" />
              Filters & Search
            </CardTitle>
            <CardDescription className="text-gray-600">
              Filter and search through your buyer leads
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Search Leads
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    className="pl-10 bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  City
                </label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                    <SelectItem value="Mohali">Mohali</SelectItem>
                    <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                    <SelectItem value="Panchkula">Panchkula</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Property Type
                </label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Badge className="h-3 w-3" />
                  Status
                </label>
                <Select value={status_filter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Visited">Interested</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Dropped">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timeline
                </label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="All Timelines" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Timelines</SelectItem>
                    <SelectItem value="ZeroToThree">0-3 months</SelectItem>
                    <SelectItem value="ThreeToSix">3-6 months</SelectItem>
                    <SelectItem value="MoreThanSix">6+ months</SelectItem>
                    <SelectItem value="Exploring">Exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters & Clear */}
            {(search || city || propertyType || status_filter || timeline) && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">Active filters:</span>
                  {search && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-900">
                      Search: {search}
                    </Badge>
                  )}
                  {city && city !== "all" && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-900 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {city}
                    </Badge>
                  )}
                  {propertyType && propertyType !== "all" && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-900 flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      {propertyType}
                    </Badge>
                  )}
                  {status_filter && status_filter !== "all" && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-900">
                      Status: {status_filter}
                    </Badge>
                  )}
                  {timeline && timeline !== "all" && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeline.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setCity("");
                      setPropertyType("");
                      setStatusFilter("");
                      setTimeline("");
                      setCurrentPage(1);
                    }}
                    size="sm"
                    className="ml-auto flex items-center gap-1 bg-white text-gray-900 border-gray-300"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {loading ? (
          <BuyersListSkeleton />
        ) : data?.buyers.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No buyer leads found</h3>
                  <p className="text-gray-500 mb-6">
                    {(search || city || propertyType || status_filter || timeline) 
                      ? "Try adjusting your filters or search terms" 
                      : "Get started by adding your first buyer lead"
                    }
                  </p>
                </div>
                <div className="flex gap-3">
                  {(search || city || propertyType || status_filter || timeline) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearch("");
                        setCity("");
                        setPropertyType("");
                        setStatusFilter("");
                        setTimeline("");
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-2 bg-white border-gray-300 text-gray-900"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/buyers/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Lead
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-semibold text-gray-900">{data?.buyers.length || 0}</span> of <span className="font-semibold text-gray-900">{data?.total || 0}</span> results
                    </p>
                  </div>
                  {data && data.total > 0 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-900 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(((data?.buyers.length || 0) / (data?.total || 1)) * 100)}% shown
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="updatedAt-desc">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-3 w-3" />
                          Last Updated (Newest)
                        </div>
                      </SelectItem>
                      <SelectItem value="updatedAt-asc">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Last Updated (Oldest)
                        </div>
                      </SelectItem>
                      <SelectItem value="fullName-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="fullName-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="createdAt-desc">Created (Newest)</SelectItem>
                      <SelectItem value="createdAt-asc">Created (Oldest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Buyers Table */}
            <Card className="bg-white border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Contact
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Details
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Property
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Timeline
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Updated
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.buyers.map((buyer) => (
                        <tr key={buyer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900 text-sm">{buyer.fullName}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {buyer.city}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-900">
                                <Phone className="h-3 w-3" />
                                {formatPhoneNumber(buyer.phone)}
                              </div>
                              {buyer.email && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  {buyer.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white border-gray-300 text-gray-900">
                                  {buyer.propertyType}
                                </Badge>
                                <span className="text-xs text-gray-500">{buyer.purpose}</span>
                              </div>
                              {buyer.bhk && (
                                <div className="text-xs text-gray-500">
                                  {getDisplayValue(buyer.bhk, "bhk")}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatBudgetRange(buyer.budgetMin, buyer.budgetMax)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-900">
                              {getDisplayValue(buyer.timeline, "timeline")}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${getStatusColor(buyer.status)} font-medium`}>
                              {getDisplayValue(buyer.status, "status")}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-500">
                              {formatRelativeTime(new Date(buyer.updatedAt))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button asChild variant="outline" size="sm" className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50">
                                    <Link href={`/buyers/${buyer.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View and edit lead</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{data.totalPages}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          size="sm"
                          className="flex items-center gap-1 bg-white border-gray-300 text-gray-900"
                        >
                          <TrendingUp className="h-3 w-3 rotate-180" />
                          Previous
                        </Button>
                        
                        {/* Page numbers */}
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={page === currentPage ? "primary" : "outline"}
                                onClick={() => setCurrentPage(page)}
                                size="sm"
                                className={`min-w-[36px] ${page !== currentPage ? 'bg-white border-gray-300 text-gray-900' : ''}`}
                              >
                                {page}
                              </Button>
                            );
                          })}
                          
                          {data.totalPages > 5 && (
                            <>
                              <span className="px-2 py-2 text-sm text-gray-500">...</span>
                              <Button
                                variant={currentPage === data.totalPages ? "primary" : "outline"}
                                onClick={() => setCurrentPage(data.totalPages)}
                                size="sm"
                                className={`min-w-[36px] ${currentPage !== data.totalPages ? 'bg-white border-gray-300 text-gray-900' : ''}`}
                              >
                                {data.totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                          disabled={currentPage === data.totalPages}
                          size="sm"
                          className="flex items-center gap-1 bg-white border-gray-300 text-gray-900"
                        >
                          Next
                          <TrendingUp className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}