"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";

interface CSVExportDialogProps {
  currentFilters?: {
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
  };
}

export function CSVExportDialog({ currentFilters }: CSVExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [includeFiltered, setIncludeFiltered] = useState(true);
  const [selectedFields, setSelectedFields] = useState({
    fullName: true,
    email: true,
    phone: true,
    city: true,
    propertyType: true,
    bhk: true,
    purpose: true,
    budgetMin: true,
    budgetMax: true,
    possessionTimeline: true,
    specificRequirements: true,
    leadSource: true,
    status: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
  });

  const fieldLabels = {
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    city: "City",
    propertyType: "Property Type",
    bhk: "BHK",
    purpose: "Purpose",
    budgetMin: "Budget Min",
    budgetMax: "Budget Max",
    possessionTimeline: "Timeline",
    specificRequirements: "Requirements",
    leadSource: "Lead Source",
    status: "Status",
    notes: "Notes",
    createdAt: "Created Date",
    updatedAt: "Updated Date",
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = new URLSearchParams();
      
      // Include filters if selected
      if (includeFiltered && currentFilters) {
        if (currentFilters.search) params.set("search", currentFilters.search);
        if (currentFilters.city && currentFilters.city !== "all") params.set("city", currentFilters.city);
        if (currentFilters.propertyType && currentFilters.propertyType !== "all") params.set("propertyType", currentFilters.propertyType);
        if (currentFilters.status && currentFilters.status !== "all") params.set("status", currentFilters.status);
        if (currentFilters.timeline && currentFilters.timeline !== "all") params.set("timeline", currentFilters.timeline);
      }

      // Include selected fields
      const fields = Object.entries(selectedFields)
        .filter(([_, selected]) => selected)
        .map(([field, _]) => field);
      
      params.set("fields", fields.join(","));

      const response = await fetch(`/api/buyers/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filterSuffix = includeFiltered ? '_filtered' : '';
      link.download = `buyers_export_${timestamp}${filterSuffix}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const toggleAllFields = (checked: boolean) => {
    const newSelectedFields = { ...selectedFields };
    Object.keys(newSelectedFields).forEach(field => {
      newSelectedFields[field as keyof typeof selectedFields] = checked;
    });
    setSelectedFields(newSelectedFields);
  };

  const selectedFieldCount = Object.values(selectedFields).filter(Boolean).length;
  const hasActiveFilters = currentFilters && Object.values(currentFilters).some(value => value && value !== "all");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Buyers to CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
              <CardDescription>
                Choose what data to include in your export.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFiltered"
                  checked={includeFiltered}
                  onCheckedChange={(checked) => setIncludeFiltered(checked === true)}
                />
                <Label htmlFor="includeFiltered" className="text-sm">
                  Export only filtered results
                  {hasActiveFilters ? (
                    <span className="text-blue-600 ml-1">(filters active)</span>
                  ) : (
                    <span className="text-gray-500 ml-1">(no filters active - will export all)</span>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Fields</CardTitle>
              <CardDescription>
                Choose which fields to include in the export. ({selectedFieldCount} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Select All/None */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllFields(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllFields(false)}
                  >
                    Select None
                  </Button>
                </div>

                {/* Field Checkboxes */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(fieldLabels).map(([field, label]) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields[field as keyof typeof selectedFields]}
                        onCheckedChange={(checked) =>
                          setSelectedFields(prev => ({
                            ...prev,
                            [field]: checked === true
                          }))
                        }
                      />
                      <Label htmlFor={field} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exporting || selectedFieldCount === 0}
          >
            {exporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}