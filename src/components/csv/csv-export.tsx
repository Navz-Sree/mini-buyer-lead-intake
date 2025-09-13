"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

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
  const toast = useToast();
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

      toast.success(`Successfully exported ${includeFiltered ? 'filtered ' : ''}buyers to CSV!`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-5 w-5 text-green-600" />
            Export Buyers to CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Options */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Export Options
              </CardTitle>
              <CardDescription className="text-green-700">
                Choose what data to include in your export.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter Option */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-200">
                <Checkbox
                  id="includeFiltered"
                  checked={includeFiltered}
                  onCheckedChange={(checked) => setIncludeFiltered(checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="includeFiltered" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Export only filtered results
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    {hasActiveFilters ? (
                      <span className="text-green-600 font-medium">✓ Filters are active - will export filtered data</span>
                    ) : (
                      <span className="text-gray-500">No filters active - will export all records</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-700" />
                Select Fields
              </CardTitle>
              <CardDescription>
                Choose which fields to include in the export. ({selectedFieldCount} of {Object.keys(selectedFields).length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Select All/None */}
                <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllFields(true)}
                    className="bg-white border-gray-300"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllFields(false)}
                    className="bg-white border-gray-300"
                  >
                    Select None
                  </Button>
                  <div className="ml-auto text-xs text-gray-600 flex items-center">
                    {selectedFieldCount} of {Object.keys(selectedFields).length} fields selected
                  </div>
                </div>

                {/* Field Checkboxes */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(fieldLabels).map(([field, label]) => (
                    <div key={field} className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
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
                      <Label htmlFor={field} className="text-sm font-medium text-gray-900 cursor-pointer flex-1">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Ready to export {selectedFieldCount} fields
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={exporting || selectedFieldCount === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}