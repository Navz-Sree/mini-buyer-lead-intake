import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { CreateBuyerSchema } from '@/lib/validations';
import { createBuyer } from '@/lib/db';

// Parse CSV content
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];

  // Header mapping to convert CSV headers to expected field names
  const headerMapping: Record<string, string> = {
    'Full Name': 'fullName',
    'fullName': 'fullName',
    'Email': 'email',
    'email': 'email',
    'Phone': 'phone',
    'phone': 'phone',
    'City': 'city',
    'city': 'city',
    'Property Type': 'propertyType',
    'propertyType': 'propertyType',
    'BHK': 'bhkRequirement',
    'bhkRequirement': 'bhkRequirement',
    'bhk': 'bhkRequirement',
    'Purpose': 'purpose',
    'purpose': 'purpose',
    'Budget Min': 'budgetMin',
    'budgetMin': 'budgetMin',
    'Budget Max': 'budgetMax',
    'budgetMax': 'budgetMax',
    'Timeline': 'possessionTimeline',
    'possessionTimeline': 'possessionTimeline',
    'Requirements': 'specificRequirements',
    'specificRequirements': 'specificRequirements',
    'Lead Source': 'leadSource',
    'leadSource': 'leadSource',
    'Status': 'status',
    'status': 'status',
    'Notes': 'notes',
    'notes': 'notes',
    'Created Date': 'createdDate',
    'Updated Date': 'updatedDate'
  };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        const mappedHeader = headerMapping[header] || header;
        row[mappedHeader] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
}

// Convert display values to database enum values
function normalizeEnumValue(value: string, field: string): string {
  if (!value || value.trim() === '') {
    // Provide defaults for required fields
    const defaults: Record<string, string> = {
      'city': 'OTHER',
      'propertyType': 'APARTMENT',
      'possessionTimeline': 'WITHIN_1_YEAR',
      'leadSource': 'OTHER',
      'status': 'NEW'
    };
    return defaults[field] || value;
  }

  const maps: Record<string, Record<string, string>> = {
    city: {
      'Chandigarh': 'CHANDIGARH',
      'Mohali': 'MOHALI', 
      'Zirakpur': 'ZIRAKPUR',
      'Panchkula': 'PANCHKULA',
      'Other': 'OTHER'
    },
    propertyType: {
      'Apartment': 'APARTMENT',
      'Villa': 'VILLA', 
      'Plot': 'PLOT',
      'Office': 'COMMERCIAL',
      'Retail': 'COMMERCIAL'
    },
    possessionTimeline: {
      '0-3 months': 'WITHIN_3_MONTHS',
      '3-6 months': 'WITHIN_6_MONTHS', 
      '6+ months': 'WITHIN_1_YEAR',
      'Exploring': 'AFTER_1_YEAR',
      'Immediate': 'IMMEDIATE',
      'IMMEDIATE': 'IMMEDIATE',
      'WITHIN_3_MONTHS': 'WITHIN_3_MONTHS',
      'WITHIN_6_MONTHS': 'WITHIN_6_MONTHS', 
      'WITHIN_1_YEAR': 'WITHIN_1_YEAR',
      'AFTER_1_YEAR': 'AFTER_1_YEAR'
    },
    leadSource: {
      'Website': 'WEBSITE',
      'Referral': 'REFERRAL',
      'Walk-in': 'OTHER',
      'Social Media': 'SOCIAL_MEDIA',
      'Advertisement': 'ADVERTISEMENT',
      'Cold Call': 'COLD_CALL',
      'Email Campaign': 'EMAIL_CAMPAIGN',
      'Trade Show': 'TRADE_SHOW',
      'Other': 'OTHER',
      'OTHER': 'OTHER',
      'WEBSITE': 'WEBSITE',
      'REFERRAL': 'REFERRAL',
      'SOCIAL_MEDIA': 'SOCIAL_MEDIA',
      'ADVERTISEMENT': 'ADVERTISEMENT',
      'COLD_CALL': 'COLD_CALL',
      'EMAIL_CAMPAIGN': 'EMAIL_CAMPAIGN',
      'TRADE_SHOW': 'TRADE_SHOW'
    },
    status: {
      'New': 'NEW',
      'Contacted': 'CONTACTED',
      'Interested': 'INTERESTED',
      'Not Interested': 'NOT_INTERESTED',
      'Converted': 'CONVERTED',
      'NEW': 'NEW',
      'CONTACTED': 'CONTACTED',
      'INTERESTED': 'INTERESTED',
      'NOT_INTERESTED': 'NOT_INTERESTED',
      'CONVERTED': 'CONVERTED'
    }
  };

  const mappedValue = maps[field]?.[value];
  if (mappedValue) {
    return mappedValue;
  }

  // If no mapping found, try to find a case-insensitive match
  if (maps[field]) {
    const lowerValue = value.toLowerCase();
    for (const [key, val] of Object.entries(maps[field])) {
      if (key.toLowerCase() === lowerValue) {
        return val;
      }
    }
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to import data' },
        { status: 401 }
      );
    }

    console.log('Import request from user:', session.user.id);

    // Verify the user exists in the database
    const { prisma } = await import('@/lib/prisma');
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!userExists) {
      console.error('User not found in database:', session.user.id);
      return NextResponse.json(
        { error: 'User session invalid. Please sign out and sign in again.' },
        { status: 403 }
      );
    }

    console.log('User verified:', userExists.email);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const rows = parseCSV(content);

    const result = {
      success: 0,
      errors: [] as Array<{ row: number; field: string; message: string; data: any }>,
      total: rows.length
    };

    for (let i = 0; i < rows.length; i++) {
      const rowData = rows[i];
      const rowNumber = i + 2; // +2 because we skip header and arrays are 0-indexed

      try {
        // Transform the data to match our schema
        const transformedData = {
          fullName: rowData.fullName || '',
          email: rowData.email || '',
          phone: rowData.phone || '',
          city: normalizeEnumValue(rowData.city || '', 'city'),
          propertyType: normalizeEnumValue(rowData.propertyType || '', 'propertyType'),
          bhkRequirement: rowData.bhkRequirement || rowData.bhk || '',
          budgetMin: rowData.budgetMin ? parseInt(rowData.budgetMin) : undefined,
          budgetMax: rowData.budgetMax ? parseInt(rowData.budgetMax) : undefined,
          possessionTimeline: normalizeEnumValue(rowData.possessionTimeline || '', 'possessionTimeline'),
          specificRequirements: rowData.specificRequirements || '',
          leadSource: normalizeEnumValue(rowData.leadSource || '', 'leadSource'),
          status: normalizeEnumValue(rowData.status || 'New', 'status'),
          notes: rowData.notes || ''
        };

        // Validate the data
        const validatedData = CreateBuyerSchema.parse(transformedData);

        // Add the buyer to database
        console.log('Creating buyer with ownerId:', session.user.id, 'for user:', rowData.fullName);
        await createBuyer({
          ...validatedData,
          ownerId: session.user.id,
        });
        result.success++;

      } catch (error) {
        console.error('Error processing row', rowNumber, ':', error);
        if (error instanceof z.ZodError) {
          error.issues.forEach(err => {
            result.errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              message: err.message,
              data: rowData
            });
          });
        } else {
          // Log the full error for debugging
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Non-validation error:', errorMessage, 'Stack:', error instanceof Error ? error.stack : 'No stack');
          result.errors.push({
            row: rowNumber,
            field: 'general',
            message: error instanceof Error ? error.message : 'Unknown error',
            data: rowData
          });
        }
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}