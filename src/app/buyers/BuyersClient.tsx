
"use client";
import BuyersTable from "../../components/BuyersTable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import type { Buyer } from "../../components/BuyersTable";

export default function BuyersClient({
  initialBuyers,
  total,
  pageSize,
}: {
  initialBuyers: Buyer[];
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buyers, setBuyers] = useState(initialBuyers);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([]);
  const [lastImportIds, setLastImportIds] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Filters from URL
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const status = searchParams.get("status") || "";
  const timeline = searchParams.get("timeline") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Update URL params
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1"); // reset page on filter change
    router.replace(`?${params.toString()}`);
  }

  // Toast helper
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // CSV Export (client-side, current page only)
  function handleExportCSV() {
    if (processing) return;
    setProcessing(true);
    const exportData = buyers.map(buyer => {
      const rest = { ...buyer } as Partial<Buyer>;
      delete rest.id;
      return rest;
    });
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Exported buyers to CSV");
    setProcessing(false);
  }

  // CSV Import (client-side, only updates local state for now)
  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Buyer>) => {
        const errors: { row: number; message: string }[] = [];
        const valid: Buyer[] = [];
        const newIds: string[] = [];
        const existingPhones = new Set(buyers.map(b => b.phone));
        results.data.slice(0, 200).forEach((row, i) => {
          // No Zod validation here, just demo
          if (!row.fullName || !row.phone) {
            errors.push({ row: i + 2, message: "Missing required fields" });
          } else if (existingPhones.has(row.phone)) {
            errors.push({ row: i + 2, message: `Duplicate phone: ${row.phone}` });
          } else {
            const id = Math.random().toString(36).slice(2);
            valid.push({ ...row, id, updatedAt: new Date().toISOString() });
            newIds.push(id);
            existingPhones.add(row.phone);
          }
        });
        if (valid.length) {
          setBuyers(bs => [...valid, ...bs]);
          setLastImportIds(newIds);
          showToast(`Imported ${valid.length} buyers (local only)`);
        }
        setImportErrors(errors);
        setProcessing(false);
        if (importInputRef.current) importInputRef.current.value = "";
      },
    });
  }

  function handleUndoImport() {
    if (!lastImportIds) return;
    setBuyers(bs => bs.filter(b => !lastImportIds.includes(b.id)));
    setLastImportIds(null);
    showToast("Last import undone (local only)");
  }

  function handleClearErrors() {
    setImportErrors([]);
  }

  // Simulate loading for demo (replace with real fetch if needed)
  useEffect(() => {
    setLoading(false);
  }, [initialBuyers]);

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, background: "#222", color: "#fff", padding: 12, borderRadius: 6, zIndex: 1000 }}>
          {toast}
        </div>
      )}
      <div style={{ marginBottom: 8, color: "#555" }}>
        Showing {buyers.length} of {total} buyers
        <button style={{ marginLeft: 16 }} onClick={handleExportCSV} disabled={processing}>
          Export CSV
        </button>
        <label style={{ marginLeft: 16, cursor: processing ? "not-allowed" : "pointer" }}>
          Import CSV
          <input ref={importInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleImportCSV} disabled={processing} />
        </label>
        {lastImportIds && (
          <button style={{ marginLeft: 16 }} onClick={handleUndoImport} disabled={processing}>
            Undo Last Import
          </button>
        )}
      </div>
      {importErrors.length > 0 && (
        <div style={{ color: "#b00", marginBottom: 8 }}>
          <strong>Import Errors:</strong>
          <button style={{ marginLeft: 8 }} onClick={handleClearErrors}>Clear Errors</button>
          <table style={{ background: "#fff0f0", marginTop: 4 }}>
            <thead><tr><th>Row</th><th>Message</th></tr></thead>
            <tbody>
              {importErrors.map(e => <tr key={e.row}><td>{e.row}</td><td>{e.message}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          id="search-input"
          placeholder="Search name or phone"
          value={search}
          onChange={e => setParam("search", e.target.value)}
          aria-label="Search name or phone"
        />
        <select
          id="city-select"
          value={city}
          onChange={e => setParam("city", e.target.value)}
          aria-label="City"
        >
          <option value="">All Cities</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Mohali">Mohali</option>
          <option value="Zirakpur">Zirakpur</option>
          <option value="Panchkula">Panchkula</option>
          <option value="Other">Other</option>
        </select>
        <select
          id="propertyType-select"
          value={propertyType}
          onChange={e => setParam("propertyType", e.target.value)}
          aria-label="Property Type"
        >
          <option value="">All Property Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Plot">Plot</option>
          <option value="Office">Office</option>
          <option value="Retail">Retail</option>
        </select>
        <select
          id="status-select"
          value={status}
          onChange={e => setParam("status", e.target.value)}
          aria-label="Status"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Contacted">Contacted</option>
          <option value="Visited">Visited</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Converted">Converted</option>
          <option value="Dropped">Dropped</option>
        </select>
        <select
          id="timeline-select"
          value={timeline}
          onChange={e => setParam("timeline", e.target.value)}
          aria-label="Timeline"
        >
          <option value="">All Timelines</option>
          <option value="0-3m">0-3m</option>
          <option value="3-6m">3-6m</option>
          <option value=">6m">&gt;6m</option>
          <option value="Exploring">Exploring</option>
        </select>
      </div>
      {loading ? (
        <div role="status" aria-live="polite" className="text-center py-8 text-gray-500">
          <span className="animate-spin inline-block mr-2">⏳</span> Loading buyers...
        </div>
      ) : buyers.length === 0 ? (
        <div role="status" aria-live="polite" className="text-center py-8 text-gray-500">
          No buyers found. Try adjusting your filters or add a new buyer.
        </div>
      ) : (
        <BuyersTable buyers={buyers} search={search} />
      )}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => setParam("page", String(page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          &lt; Prev
        </button>
        <span style={{ margin: "0 8px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setParam("page", String(page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}
