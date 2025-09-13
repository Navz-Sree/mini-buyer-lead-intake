import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format budget range
export function formatBudgetRange(min?: number, max?: number): string {
  if (!min && !max) return "Not specified";
  if (min && !max) return `${formatCurrency(min)}+`;
  if (!min && max) return `Up to ${formatCurrency(max)}`;
  if (min && max && min === max) return formatCurrency(min);
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  return "Not specified";
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1-$2-$3-$4");
  }
  
  // Return as-is for other lengths
  return cleaned;
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Generate URL with search params
export function createUrlWithParams(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

// Parse search params to filter object
export function parseSearchParams(searchParams: URLSearchParams) {
  const filters: any = {};
  
  // Parse filter parameters
  const city = searchParams.get("city");
  if (city) filters.city = city;
  
  const propertyType = searchParams.get("propertyType");
  if (propertyType) filters.propertyType = propertyType;
  
  const status = searchParams.get("status");
  if (status) filters.status = status;
  
  const timeline = searchParams.get("timeline");
  if (timeline) filters.timeline = timeline;
  
  const search = searchParams.get("search");
  if (search) filters.search = search;
  
  // Parse pagination
  const page = searchParams.get("page");
  if (page) filters.page = parseInt(page, 10);
  
  const limit = searchParams.get("limit");
  if (limit) filters.limit = parseInt(limit, 10);
  
  // Parse sorting
  const sortBy = searchParams.get("sortBy");
  if (sortBy) filters.sortBy = sortBy;
  
  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder) filters.sortOrder = sortOrder;
  
  return filters;
}

// Convert tags array to comma-separated string for CSV export
export function tagsToString(tags: string[]): string {
  return tags.join(", ");
}

// Convert comma-separated string to tags array
export function stringToTags(str: string): string[] {
  return str
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);
}

// Generate unique filename for CSV export
export function generateExportFilename(prefix: string = "buyers"): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
  return `${prefix}-export-${timestamp}.csv`;
}

// Sanitize filename for download
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, "_");
}

// Calculate pagination info
export function calculatePagination(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  
  return {
    total,
    totalPages,
    currentPage: page,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    limit
  };
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

// Validate and clean phone number
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Check if string is valid email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate random string for demo purposes
export function generateRandomString(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}