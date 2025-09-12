"use client";
import { useRef } from "react";
import { useToast } from "./ToastProvider";
import Papa from "papaparse";

export default function ImportExport() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length) {
          showToast("Import failed: Invalid CSV format.", "error");
        } else {
          showToast(`Imported ${results.data.length} buyers.`, "success");
        }
      },
      error: () => showToast("Import failed.", "error"),
    });
    e.target.value = ""; // Reset file input
  }

  function handleExport() {
    // Demo: export empty CSV with headers
    const csv = Papa.unparse([
      {
        fullName: "",
        email: "",
        phone: "",
        city: "",
        propertyType: "",
        bhk: "",
        purpose: "",
        budgetMin: "",
        budgetMax: "",
        timeline: "",
        source: "",
        notes: "",
        tags: "",
        status: "",
      },
    ]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Exported buyers to CSV.", "success");
  }

  return (
    <div className="flex gap-4 items-center mt-4" aria-label="Import and export buyers">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label="Import buyers from CSV"
      />
      <button
        onClick={handleImportClick}
        className="px-4 py-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Import buyers from CSV"
      >
        Import CSV
      </button>
      <button
        onClick={handleExport}
        className="px-4 py-2 rounded bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Export buyers to CSV"
      >
        Export CSV
      </button>
    </div>
  );
}
