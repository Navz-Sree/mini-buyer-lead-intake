import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getBuyerById } from '@/lib/db'
import BuyerEditForm from '@/components/forms/buyer-edit-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, MapPinIcon, PhoneIcon, MailIcon, IndianRupeeIcon } from 'lucide-react'
import Link from 'next/link'

interface BuyerDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function BuyerDetailPage({
  params,
  searchParams,
}: BuyerDetailPageProps) {
  const { id } = await params
  const { edit } = await searchParams
  
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const buyer = await getBuyerById(id, session.user.email)
  if (!buyer) {
    notFound()
  }

  const isEditing = edit === 'true'

  const statusColorMap = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    INTERESTED: 'bg-green-100 text-green-800',
    NOT_INTERESTED: 'bg-red-100 text-red-800',
    CONVERTED: 'bg-purple-100 text-purple-800',
  }

  const priorityColorMap = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-orange-100 text-orange-800',
    HIGH: 'bg-red-100 text-red-800',
    URGENT: 'bg-red-600 text-white',
  }

  if (isEditing) {
    const handleUpdate = async (data: any) => {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          updatedAt: buyer.updatedAt.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update buyer')
      }

      // Redirect back to view mode
      window.location.href = `/buyers/${id}`
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Buyer Lead</h1>
          <p className="text-gray-600 mt-2">
            Update the information for this buyer lead
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Lead Information</CardTitle>
            <CardDescription>
              Make changes to the buyer lead details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BuyerEditForm buyer={buyer} onSubmit={handleUpdate} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{buyer.fullName}</h1>
          <p className="text-gray-600 mt-2">
            Lead ID: {buyer.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/buyers">← Back to Leads</Link>
          </Button>
          <Button asChild>
            <Link href={`/buyers/${buyer.id}?edit=true`}>Edit Lead</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                <span>{buyer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-gray-500" />
                <span>{buyer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-gray-500" />
                <span>{buyer.city}</span>
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Property Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Property Type</h4>
                  <p className="text-lg capitalize">{buyer.propertyType.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Budget Range</h4>
                  <div className="flex items-center gap-1">
                    <IndianRupeeIcon className="h-4 w-4" />
                    <span>
                      {buyer.budgetMin ? formatCurrency(buyer.budgetMin) : '₹0'} - {buyer.budgetMax ? formatCurrency(buyer.budgetMax) : '₹0'}
                    </span>
                  </div>
                </div>
                {(buyer as any).bhkRequirement && (
                  <div>
                    <h4 className="font-medium text-gray-700">BHK Requirement</h4>
                    <p className="text-lg">{(buyer as any).bhkRequirement}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-700">Possession Timeline</h4>
                  <p className="text-lg capitalize">{(buyer as any).possessionTimeline?.replace('_', ' ')}</p>
                </div>
              </div>
              
              {(buyer as any).specificRequirements && (
                <div>
                  <h4 className="font-medium text-gray-700">Specific Requirements</h4>
                  <p className="text-gray-600 mt-1">{(buyer as any).specificRequirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(buyer as any).notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{(buyer as any).notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                <Badge className={statusColorMap[buyer.status]}>
                  {buyer.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Priority</h4>
                <Badge className={(priorityColorMap as any)[(buyer as any).priority]}>
                  {(buyer as any).priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lead Source */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Source</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg capitalize">{(buyer as any).leadSource?.replace('_', ' ')}</p>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700">Created</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(buyer.createdAt)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Last Updated</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(buyer.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change History */}
      {buyer.history && buyer.history.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Change History</CardTitle>
            <CardDescription>
              Track of all changes made to this lead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buyer.history.map((historyItem: any) => (
                <div key={historyItem.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{historyItem.action || 'Updated'}</h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(historyItem.changedAt)}
                    </span>
                  </div>
                  {historyItem.changes && (
                    <p className="text-sm text-gray-600 mt-1">{historyItem.changes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}