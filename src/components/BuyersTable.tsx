"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastProvider";

// Buyers Table Component
export type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
  ownerId?: string; // Add ownerId for ownership checks
};

type SortKey = keyof Omit<Buyer, "id">;

type Props = {
  buyers: Buyer[];
  search?: string;
  onStatusChange?: (id: string, newStatus: string) => void;
  onBulkStatusChange?: (ids: string[], newStatus: string) => void;
};

const columns: { key: SortKey; label: string }[] = [
  { key: "fullName", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "propertyType", label: "Property Type" },
  { key: "budgetMin", label: "Budget Min" },
  { key: "budgetMax", label: "Budget Max" },
  { key: "timeline", label: "Timeline" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Updated At" },
];

const statusOptions = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function BuyersTable({
  buyers,
  search,
  onStatusChange,
  onBulkStatusChange,
}: Props) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const userId = session?.user?.email; // Use email as user id for demo
  const userRole = session?.user?.role;
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState<{ status: string } | null>(
    null
  );
  const [undoData, setUndoData] = useState<{
    ids: string[];
    prevStatus: Record<string, string>;
  } | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    setSelected(e.target.checked ? buyers.map((b) => b.id) : []);
  }
  function handleBulkStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (selected.length && e.target.value) {
      setConfirmBulk({ status: e.target.value });
      e.target.value = "";
    }
  }
  function confirmBulkUpdate() {
    if (onBulkStatusChange && confirmBulk) {
      // Save previous status for undo
      const prevStatus: Record<string, string> = {};
      buyers.forEach((b) => {
        if (selected.includes(b.id)) prevStatus[b.id] = b.status;
      });
      setUndoData({ ids: [...selected], prevStatus });
      onBulkStatusChange(selected, confirmBulk.status);
      setSelected([]);
      showToast(
        <span>
          Updated status for {selected.length} buyers.{" "}
          <button onClick={handleUndo} className="underline ml-2">
            Undo
          </button>
        </span>,
        "success"
      );
      setConfirmBulk(null);
    }
  }
  function cancelBulkUpdate() {
    setConfirmBulk(null);
  }
  function handleUndo() {
    if (undoData && onBulkStatusChange) {
      // Revert each buyer to previous status
      Object.entries(undoData.prevStatus).forEach(([id, prev]) => {
        onStatusChange?.(id, prev);
      });
      showToast("Bulk update undone.", "info");
      setUndoData(null);
    }
  }

  // Keyboard navigation: focus row, enter to view/edit
  function onRowKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      window.location.href = `/buyers/${id}`;
    }
  }

  return (
    <div className="overflow-x-auto w-full">
      {/* Bulk actions only for admin */}
      {userRole === "admin" && (
        <div style={{ marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={selected.length === buyers.length && buyers.length > 0}
            onChange={handleSelectAll}
            aria-label="Select all buyers"
          />
          <span style={{ marginLeft: 8, marginRight: 8 }}>Bulk status:</span>
          <select
            onChange={handleBulkStatusChange}
            value=""
            aria-label="Bulk update status for selected buyers"
            disabled={selected.length === 0}
          >
            <option value="">Update status...</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span style={{ marginLeft: 8, color: "#888" }}>
            {selected.length} selected
          </span>
        </div>
      )}
      {/* Confirmation dialog for bulk update */}
      {confirmBulk && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
        >
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg max-w-xs w-full">
            <div className="mb-4">
              Are you sure you want to update status for{" "}
              <b>{selected.length}</b> buyers to <b>{confirmBulk.status}</b>?
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelBulkUpdate}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkUpdate}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <table className="min-w-[700px] w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                tabIndex={0}
              >
                {col.label}
              </th>
            ))}
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buyers.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2}>No buyers found.</td>
            </tr>
          ) : (
            buyers.map((b, i) => {
              const canEdit = userRole === "admin" || b.ownerId === userId;
              return (
                <tr
                  key={b.id}
                  tabIndex={0}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onKeyDown={(e) => onRowKeyDown(e, b.id)}
                  className="even:bg-gray-50 dark:even:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                  aria-label={`View or edit buyer ${b.fullName}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                      {col.key === "fullName"
                        ? highlight(b.fullName, search || "")
                        : col.key === "phone"
                        ? highlight(b.phone, search || "")
                        : b[col.key] ?? ""}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <>
                        <a
                          href={`/buyers/${b.id}`}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </a>
                        <button
                          className="text-red-600 hover:underline"
                          aria-label="Delete buyer"
                          disabled
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">No access</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
