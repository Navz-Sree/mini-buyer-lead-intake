import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBuyerById, updateBuyer } from '@/lib/db'
import { CreateBuyerSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buyer = await getBuyerById(id, session.user.email)
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    return NextResponse.json(buyer)
  } catch (error) {
    console.error('Error fetching buyer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updatedAt, ...data } = body

    // Validate the data
    const validatedData = CreateBuyerSchema.parse(data)

    // Get the current buyer to check ownership and get user ID
    const currentBuyer = await getBuyerById(id, session.user.email)
    if (!currentBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    if (!currentBuyer.canEdit) {
      return NextResponse.json(
        { error: 'You can only edit your own leads' },
        { status: 403 }
      )
    }

    // Update the buyer with optimistic locking
    const updatedBuyer = await updateBuyer(
      id,
      validatedData,
      currentBuyer.ownerId,
      new Date(updatedAt)
    )

    return NextResponse.json(updatedBuyer)
  } catch (error: any) {
    console.error('Error updating buyer:', error)
    
    if (error.message?.includes('Concurrent update detected')) {
      return NextResponse.json(
        { error: 'This lead has been updated by someone else. Please refresh and try again.' },
        { status: 409 }
      )
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current buyer to check ownership
    const currentBuyer = await getBuyerById(id, session.user.email)
    if (!currentBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    if (!currentBuyer.canEdit) {
      return NextResponse.json(
        { error: 'You can only delete your own leads' },
        { status: 403 }
      )
    }

    // TODO: Implement soft delete or actual delete
    // For now, we'll just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting buyer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}