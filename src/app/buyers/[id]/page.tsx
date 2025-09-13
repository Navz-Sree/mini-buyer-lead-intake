"use client";
import React, { useState } from "react";
import BuyerForm from "../../../components/BuyerForm";
import { useSession } from "next-auth/react";
import type { BuyerFormValues } from "../../../components/BuyerForm";

// Mock buyer data (replace with DB fetch later)
const mockBuyer = {
  id: "1",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  city: "Chandigarh",
  propertyType: "Apartment",
  bhk: "2",
  purpose: "Buy",
  budgetMin: 5000000,
  budgetMax: 7000000,
  timeline: "0-3m",
  source: "Website",
  notes: "Looking for a 2BHK in city center.",
  tags: ["hot", "priority"],
  status: "New",
  updatedAt: new Date().toISOString(),
  ownerId: "demo@admin.com", // Mock owner
};

const mockHistory = [
  { changedAt: "2024-06-01T10:00:00Z", changedBy: "admin@demo.com", diff: { status: "Contacted" } },
  { changedAt: "2024-06-02T12:00:00Z", changedBy: "admin@demo.com", diff: { notes: "Followed up by phone." } },
];

// View & Edit Buyer Page
export default function BuyerDetailPage() {
  // Remove 'async' and use client-side hooks
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [buyer, setBuyer] = useState(mockBuyer);
  const [concurrencyError, setConcurrencyError] = useState<string | null>(null);

  function handleEdit(data: BuyerFormValues) {
    // Mock concurrency check: if updatedAt changed, show error
    if (buyer.updatedAt !== mockBuyer.updatedAt) {
      setConcurrencyError("This record was updated elsewhere. Please reload.");
      return;
    }
    setBuyer({ ...buyer, ...data, updatedAt: new Date().toISOString() });
    setEditing(false);
    setConcurrencyError(null);
  }

  // Role/ownership check
  const userId = session?.user?.email;
  const userRole = session?.user?.role;
  const canEdit = userRole === "admin" || buyer.ownerId === userId;

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Buyer Detail & Edit</h1>
      {editing ? (
        <div>
          <BuyerForm onSubmit={handleEdit} />
          <button className="mt-2" onClick={() => setEditing(false)}>Cancel</button>
          {concurrencyError && <div className="text-red-600 mt-2">{concurrencyError}</div>}
        </div>
      ) : (
        <div className="space-y-2">
          <div><b>Name:</b> {buyer.fullName}</div>
          <div><b>Email:</b> {buyer.email}</div>
          <div><b>Phone:</b> {buyer.phone}</div>
          <div><b>City:</b> {buyer.city}</div>
          <div><b>Property Type:</b> {buyer.propertyType}</div>
          <div><b>BHK:</b> {buyer.bhk}</div>
          <div><b>Purpose:</b> {buyer.purpose}</div>
          <div><b>Budget:</b> ₹{buyer.budgetMin?.toLocaleString()} - ₹{buyer.budgetMax?.toLocaleString()}</div>
          <div><b>Timeline:</b> {buyer.timeline}</div>
          <div><b>Source:</b> {buyer.source}</div>
          <div><b>Status:</b> {buyer.status}</div>
          <div><b>Notes:</b> {buyer.notes}</div>
          <div><b>Tags:</b> {buyer.tags?.join(", ")}</div>
          <div><b>Last Updated:</b> {new Date(buyer.updatedAt).toLocaleString()}</div>
          {canEdit ? (
            <button className="mt-4" onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <span className="text-gray-400 mt-4 block">No edit access</span>
          )}
        </div>
      )}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">History</h2>
        <ul className="text-sm">
          {mockHistory.map((h, i) => (
            <li key={i} className="mb-1">
              <b>{new Date(h.changedAt).toLocaleString()}</b> by {h.changedBy}: {Object.entries(h.diff).map(([k, v]) => `${k}: ${v}`).join(", ")}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
