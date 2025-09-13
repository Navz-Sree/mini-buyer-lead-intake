"use client";

import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema, cityEnum, propertyTypeEnum, bhkEnum, purposeEnum, timelineEnum, sourceEnum, statusEnum } from "@/lib/buyerSchema";
import { z } from "zod";

// Infer the form values type from the Zod schema
export type BuyerFormValues = z.infer<typeof buyerSchema>;

export default function BuyerForm({ onSubmit, initialValues }: {
  onSubmit: (data: BuyerFormValues) => void;
  initialValues?: Partial<BuyerFormValues>;
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema) as Resolver<BuyerFormValues>,
    defaultValues: initialValues,
  });

  // Watch propertyType for conditional BHK field
  const propertyType = watch("propertyType");

  const handleFormSubmit: SubmitHandler<BuyerFormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label htmlFor="fullName" className="block font-medium mb-1">Full Name*</label>
        <input id="fullName" {...register("fullName")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.fullName} aria-describedby="fullName-error" />
        {errors.fullName && <span id="fullName-error" className="text-red-600 text-xs">{errors.fullName.message}</span>}
      </div>
      <div>
        <label htmlFor="email" className="block font-medium mb-1">Email</label>
        <input id="email" {...register("email")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.email} aria-describedby="email-error" />
        {errors.email && <span id="email-error" className="text-red-600 text-xs">{errors.email.message}</span>}
      </div>
      <div>
        <label htmlFor="phone" className="block font-medium mb-1">Phone*</label>
        <input id="phone" {...register("phone")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.phone} aria-describedby="phone-error" />
        {errors.phone && <span id="phone-error" className="text-red-600 text-xs">{errors.phone.message}</span>}
      </div>
      <div>
        <label htmlFor="city" className="block font-medium mb-1">City*</label>
        <select id="city" {...register("city")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.city} aria-describedby="city-error">
          {cityEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors.city && <span id="city-error" className="text-red-600 text-xs">{errors.city.message}</span>}
      </div>
      <div>
        <label htmlFor="propertyType" className="block font-medium mb-1">Property Type*</label>
        <select id="propertyType" {...register("propertyType")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.propertyType} aria-describedby="propertyType-error">
          {propertyTypeEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors.propertyType && <span id="propertyType-error" className="text-red-600 text-xs">{errors.propertyType.message}</span>}
      </div>
      {(propertyType === "Apartment" || propertyType === "Villa") && (
        <div>
          <label htmlFor="bhk" className="block font-medium mb-1">BHK*</label>
          <select id="bhk" {...register("bhk")}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.bhk} aria-describedby="bhk-error">
            <option value="">Select</option>
            {bhkEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {errors.bhk && <span id="bhk-error" className="text-red-600 text-xs">{errors.bhk.message}</span>}
        </div>
      )}
      <div>
        <label htmlFor="purpose" className="block font-medium mb-1">Purpose*</label>
        <select id="purpose" {...register("purpose")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.purpose} aria-describedby="purpose-error">
          {purposeEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors.purpose && <span id="purpose-error" className="text-red-600 text-xs">{errors.purpose.message}</span>}
      </div>
      <div>
        <label htmlFor="budgetMin" className="block font-medium mb-1">Budget Min</label>
        <input id="budgetMin" type="number" {...register("budgetMin")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.budgetMin} aria-describedby="budgetMin-error" />
        {errors.budgetMin && <span id="budgetMin-error" className="text-red-600 text-xs">{errors.budgetMin.message}</span>}
      </div>
      <div>
        <label htmlFor="budgetMax" className="block font-medium mb-1">Budget Max</label>
        <input id="budgetMax" type="number" {...register("budgetMax")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.budgetMax} aria-describedby="budgetMax-error" />
        {errors.budgetMax && <span id="budgetMax-error" className="text-red-600 text-xs">{errors.budgetMax.message}</span>}
      </div>
      <div>
        <label htmlFor="timeline" className="block font-medium mb-1">Timeline*</label>
        <select id="timeline" {...register("timeline")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.timeline} aria-describedby="timeline-error">
          {timelineEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors.timeline && <span id="timeline-error" className="text-red-600 text-xs">{errors.timeline.message}</span>}
      </div>
      <div>
        <label htmlFor="source" className="block font-medium mb-1">Source*</label>
        <select id="source" {...register("source")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.source} aria-describedby="source-error">
          {sourceEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors.source && <span id="source-error" className="text-red-600 text-xs">{errors.source.message}</span>}
      </div>
      <div>
        <label htmlFor="notes" className="block font-medium mb-1">Notes</label>
        <textarea id="notes" {...register("notes")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.notes} aria-describedby="notes-error" />
        {errors.notes && <span id="notes-error" className="text-red-600 text-xs">{errors.notes.message}</span>}
      </div>
      <div>
        <label htmlFor="tags" className="block font-medium mb-1">Tags (comma separated)</label>
        <input id="tags" {...register("tags", { setValueAs: v => v.split(",").map((s: string) => s.trim()).filter(Boolean) })}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.tags} aria-describedby="tags-error" />
        {errors.tags && <span id="tags-error" className="text-red-600 text-xs">{errors.tags.message}</span>}
      </div>
      <div>
        <label htmlFor="status" className="block font-medium mb-1">Status</label>
        <select id="status" {...register("status")}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={!!errors.status} aria-describedby="status-error">
          {statusEnum.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors.status && <span id="status-error" className="text-red-600 text-xs">{errors.status.message}</span>}
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500">Submit</button>
    </form>
  );
}
