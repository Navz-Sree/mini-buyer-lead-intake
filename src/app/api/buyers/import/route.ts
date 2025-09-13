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

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
}

// Convert display values to database enum values
function normalizeEnumValue(value: string, field: string): string {
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
      'Office': 'OFFICE',
      'Retail': 'RETAIL'
    },
    bhk: {
      '1 BHK': 'One',
      '2 BHK': 'Two',
      '3 BHK': 'Three', 
      '4 BHK': 'Four',
      'Studio': 'Studio',
      'One': 'One',
      'Two': 'Two', 
      'Three': 'Three',
      'Four': 'Four'
    },
    purpose: {
      'Buy': 'BUY',
      'Rent': 'RENT',
      'Investment': 'INVESTMENT'
    },
    possessionTimeline: {
      '0-3 months': 'WITHIN_3_MONTHS',
      '3-6 months': 'WITHIN_6_MONTHS', 
      '6+ months': 'AFTER_6_MONTHS',
      'Exploring': 'JUST_EXPLORING',
      'IMMEDIATE': 'WITHIN_3_MONTHS',
      'WITHIN_3_MONTHS': 'WITHIN_3_MONTHS',
      'WITHIN_6_MONTHS': 'WITHIN_6_MONTHS', 
      'AFTER_6_MONTHS': 'AFTER_6_MONTHS',
      'JUST_EXPLORING': 'JUST_EXPLORING'
    },
    leadSource: {
      'Website': 'WEBSITE',
      'Referral': 'REFERRAL',
      'Walk-in': 'WALK_IN',
      'Social Media': 'SOCIAL_MEDIA',
      'Advertisement': 'ADVERTISEMENT',
      'WEBSITE': 'WEBSITE',
      'REFERRAL': 'REFERRAL',
      'WALK_IN': 'WALK_IN', 
      'SOCIAL_MEDIA': 'SOCIAL_MEDIA',
      'ADVERTISEMENT': 'ADVERTISEMENT'
    }
  };

  return maps[field]?.[value] || value;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
          bhk: rowData.bhk ? normalizeEnumValue(rowData.bhk, 'bhk') : undefined,
          purpose: normalizeEnumValue(rowData.purpose || '', 'purpose'),
          budgetMin: rowData.budgetMin ? parseInt(rowData.budgetMin) : undefined,
          budgetMax: rowData.budgetMax ? parseInt(rowData.budgetMax) : undefined,
          possessionTimeline: normalizeEnumValue(rowData.possessionTimeline || '', 'possessionTimeline'),
          specificRequirements: rowData.specificRequirements || '',
          leadSource: normalizeEnumValue(rowData.leadSource || '', 'leadSource'),
          notes: rowData.notes || ''
        };

        // Validate the data
        const validatedData = CreateBuyerSchema.parse(transformedData);

        // Add the buyer to database
        await createBuyer({
          ...validatedData,
          ownerId: session.user.id,
        });
        result.success++;

      } catch (error) {
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