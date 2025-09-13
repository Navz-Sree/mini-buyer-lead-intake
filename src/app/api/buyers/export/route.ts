import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBuyers } from '@/lib/db';

// Convert database enum values to display values
function getDisplayValue(value: string, field: string): string {
  const maps: Record<string, Record<string, string>> = {
    city: {
      'CHANDIGARH': 'Chandigarh',
      'MOHALI': 'Mohali',
      'ZIRAKPUR': 'Zirakpur', 
      'PANCHKULA': 'Panchkula',
      'OTHER': 'Other'
    },
    propertyType: {
      'APARTMENT': 'Apartment',
      'VILLA': 'Villa',
      'PLOT': 'Plot',
      'OFFICE': 'Office', 
      'RETAIL': 'Retail'
    },
    bhk: {
      'One': '1 BHK',
      'Two': '2 BHK',
      'Three': '3 BHK',
      'Four': '4 BHK',
      'Studio': 'Studio'
    },
    purpose: {
      'BUY': 'Buy',
      'RENT': 'Rent',
      'INVESTMENT': 'Investment'
    },
    possessionTimeline: {
      'WITHIN_3_MONTHS': '0-3 months',
      'WITHIN_6_MONTHS': '3-6 months',
      'AFTER_6_MONTHS': '6+ months', 
      'JUST_EXPLORING': 'Exploring'
    },
    leadSource: {
      'WEBSITE': 'Website',
      'REFERRAL': 'Referral',
      'WALK_IN': 'Walk-in',
      'SOCIAL_MEDIA': 'Social Media',
      'ADVERTISEMENT': 'Advertisement'
    },
    status: {
      'NEW': 'New',
      'CONTACTED': 'Contacted',
      'INTERESTED': 'Interested', 
      'NOT_INTERESTED': 'Not Interested',
      'CONVERTED': 'Converted'
    }
  };

  return maps[field]?.[value] || value;
}

function formatCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Get filters from query params
    const filters: any = {};
    if (searchParams.get('search')) filters.search = searchParams.get('search');
    if (searchParams.get('city') && searchParams.get('city') !== 'all') {
      filters.city = searchParams.get('city');
    }
    if (searchParams.get('propertyType') && searchParams.get('propertyType') !== 'all') {
      filters.propertyType = searchParams.get('propertyType');
    }
    if (searchParams.get('status') && searchParams.get('status') !== 'all') {
      filters.status = searchParams.get('status');
    }
    if (searchParams.get('timeline') && searchParams.get('timeline') !== 'all') {
      filters.timeline = searchParams.get('timeline');
    }

    // Get selected fields (default to all if not specified)
    const selectedFields = searchParams.get('fields')?.split(',') || [
      'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose',
      'budgetMin', 'budgetMax', 'possessionTimeline', 'specificRequirements',
      'leadSource', 'status', 'notes', 'createdAt', 'updatedAt'
    ];

    // Fetch all matching buyers (no pagination for export)
    const result = await getBuyers({
      ...filters,
      ownerId: session.user.id,
      page: 1,
      limit: 10000, // Large limit to get all records
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Create CSV headers
    const fieldLabels: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email', 
      phone: 'Phone',
      city: 'City',
      propertyType: 'Property Type',
      bhk: 'BHK',
      purpose: 'Purpose',
      budgetMin: 'Budget Min',
      budgetMax: 'Budget Max',
      possessionTimeline: 'Timeline',
      specificRequirements: 'Requirements', 
      leadSource: 'Lead Source',
      status: 'Status',
      notes: 'Notes',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date'
    };

    const headers = selectedFields.map(field => fieldLabels[field] || field);
    
    // Create CSV rows
    const rows = result.buyers.map(buyer => {
      return selectedFields.map(field => {
        let value = (buyer as any)[field];
        
        // Format dates
        if ((field === 'createdAt' || field === 'updatedAt') && value) {
          value = new Date(value).toISOString().split('T')[0];
        }
        
        // Convert enum values to display values for certain fields
        if (['city', 'propertyType', 'bhk', 'purpose', 'possessionTimeline', 'leadSource', 'status'].includes(field)) {
          value = getDisplayValue(value, field);
        }
        
        return formatCSVValue(value);
      });
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="buyers_export.csv"',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}