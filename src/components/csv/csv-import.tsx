"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface ImportResult {
  success: number;
  errors: Array<{ row: number; field: string; message: string; data: any }>;
  total: number;
}

export function CSVImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
      toast.info(`Selected file: ${selectedFile.name}`);
    } else {
      toast.error('Please select a valid CSV file.');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const importResult = await response.json();
      setResult(importResult);
      
      if (importResult.success > 0) {
        toast.success(`Successfully imported ${importResult.success} buyers!`, {
          action: {
            label: 'View Buyers',
            onClick: () => {
              setIsOpen(false);
              window.location.reload();
            }
          }
        });
      }
      
      if (importResult.errors.length > 0) {
        toast.warning(`${importResult.errors.length} rows had errors. Check the results below.`);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);

    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Full Name,Email,Phone,City,Property Type,BHK,Budget Min,Budget Max,Timeline,Requirements,Lead Source,Status,Notes
John Doe,john@example.com,9876543210,Chandigarh,Apartment,2 BHK,5000000,7000000,0-3 months,Near metro station,Website,New,Looking for 2BHK apartment
Jane Smith,jane@example.com,9876543211,Mohali,Villa,3 BHK,8000000,12000000,3-6 months,With garden,Referral,New,Interested in independent villa`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'buyer_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Buyers from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Step 1: Download Template
              </CardTitle>
              <CardDescription className="text-blue-700">
                Download the CSV template to ensure your data is in the correct format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50">
                <FileText className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-gray-700" />
                Step 2: Upload CSV File
              </CardTitle>
              <CardDescription>
                Select your CSV file containing buyer data to import.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvFile" className="text-sm font-medium text-gray-900">CSV File</Label>
                  <Input
                    ref={fileInputRef}
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="mt-2 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max file size: 5MB. Supported format: CSV</p>
                </div>
                
                {file && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <span className="font-medium">File selected:</span> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleImport} 
                  disabled={!file || importing}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Buyers
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {result.errors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{result.success}</div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{result.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {result.errors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Row {error.row}:</strong> {error.field} - {error.message}
                              <br />
                              <small className="text-xs">Data: {JSON.stringify(error.data)}</small>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.success > 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully imported {result.success} buyers. The page will refresh to show the new data.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {result?.success > 0 && (
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}