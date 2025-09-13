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
import { Plus, Search, Filter } from "lucide-react";
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
      if (cityFilter) params.set("city", cityFilter);
      if (propTypeFilter) params.set("propertyType", propTypeFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (timelineFilter) params.set("timeline", timelineFilter);
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

  // Early returns after all hooks
  if (status === "loading") {
    return <PageLoadingSkeleton />;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Convert enum values to display values
  const getDisplayValue = (value: string, type: string) => {
    const maps: Record<string, Record<string, string>> = {
      bhk: { One: "1 BHK", Two: "2 BHK", Three: "3 BHK", Four: "4 BHK", Studio: "Studio" },
      timeline: { ZeroToThree: "0-3 months", ThreeToSix: "3-6 months", MoreThanSix: "6+ months", Exploring: "Exploring" },
      source: { WalkIn: "Walk-in" },
      status: { New: "New", Qualified: "Qualified", Contacted: "Contacted", Visited: "Visited", Negotiation: "Negotiation", Converted: "Converted", Dropped: "Dropped" }
    };
    return maps[type]?.[value] || value;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      New: "bg-blue-100 text-blue-800",
      Qualified: "bg-green-100 text-green-800",
      Contacted: "bg-yellow-100 text-yellow-800",
      Visited: "bg-purple-100 text-purple-800",
      Negotiation: "bg-orange-100 text-orange-800",
      Converted: "bg-green-100 text-green-800",
      Dropped: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
              <p className="mt-2 text-gray-600">
                Manage and track your buyer leads pipeline
              </p>
            </div>
            <div className="flex gap-3">
              <CSVImportDialog />
              <CSVExportDialog 
                currentFilters={{
                  search,
                  city,
                  propertyType,
                  status: status_filter,
                  timeline
                }}
              />
              <Button asChild>
                <Link href="/buyers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* City Filter */}
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Mohali">Mohali</SelectItem>
                  <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                  <SelectItem value="Panchkula">Panchkula</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Property Type Filter */}
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={status_filter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Visited">Visited</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>

              {/* Timeline Filter */}
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger>
                  <SelectValue placeholder="All Timelines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timelines</SelectItem>
                  <SelectItem value="ZeroToThree">0-3 months</SelectItem>
                  <SelectItem value="ThreeToSix">3-6 months</SelectItem>
                  <SelectItem value="MoreThanSix">6+ months</SelectItem>
                  <SelectItem value="Exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(search || city || propertyType || status_filter || timeline) && (
              <div className="mt-4">
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
                >
                  Clear All Filters
                </Button>
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
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No buyers found matching your criteria.</p>
              <Button asChild className="mt-4">
                <Link href="/buyers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Lead
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {data?.buyers.length || 0} of {data?.total || 0} results
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt-desc">Last Updated (Newest)</SelectItem>
                    <SelectItem value="updatedAt-asc">Last Updated (Oldest)</SelectItem>
                    <SelectItem value="fullName-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="fullName-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="createdAt-desc">Created (Newest)</SelectItem>
                    <SelectItem value="createdAt-asc">Created (Oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buyers Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.buyers.map((buyer) => (
                        <tr key={buyer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                              <div className="text-sm text-gray-500">{buyer.city}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{formatPhoneNumber(buyer.phone)}</div>
                              {buyer.email && <div className="text-sm text-gray-500">{buyer.email}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{buyer.propertyType}</div>
                              {buyer.bhk && <div className="text-sm text-gray-500">{getDisplayValue(buyer.bhk, "bhk")}</div>}
                              <div className="text-sm text-gray-500">{buyer.purpose}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatBudgetRange(buyer.budgetMin, buyer.budgetMax)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getDisplayValue(buyer.timeline, "timeline")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(buyer.status)}>
                              {getDisplayValue(buyer.status, "status")}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatRelativeTime(new Date(buyer.updatedAt))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/buyers/${buyer.id}`}>
                                View
                              </Link>
                            </Button>
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
              <div className="mt-6 flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        size="sm"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {data.totalPages > 5 && (
                    <>
                      <span className="px-2 py-2 text-sm text-gray-500">...</span>
                      <Button
                        variant={currentPage === data.totalPages ? "default" : "outline"}
                        onClick={() => setCurrentPage(data.totalPages)}
                        size="sm"
                      >
                        {data.totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                    disabled={currentPage === data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}