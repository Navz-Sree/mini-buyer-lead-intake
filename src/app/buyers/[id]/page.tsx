import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getBuyerById } from '@/lib/db'
import BuyerEditForm from '@/components/forms/buyer-edit-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Edit, Home, DollarSign, Clock, Users, Phone, Mail, MapPin, IndianRupee, Calendar, Target, ArrowLeft, Building, CheckCircle, FileText, TrendingUp } from 'lucide-react'
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
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const buyer = await getBuyerById(id, session.user.id)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 mr-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              {buyer.fullName}
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Lead ID: {buyer.id}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="bg-white border-gray-300">
              <Link href="/buyers" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href={`/buyers/${buyer.id}?edit=true`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Lead
              </Link>
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <p className="text-lg text-gray-900">{buyer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-lg text-gray-900">{buyer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-lg text-gray-900">{buyer.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Building className="h-5 w-5 text-green-600" />
                Property Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800">Property Type</h4>
                  </div>
                  <p className="text-lg font-medium text-gray-900 capitalize">{buyer.propertyType.replace('_', ' ')}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">Budget Range</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-medium text-gray-900">
                      {buyer.budgetMin ? formatCurrency(buyer.budgetMin) : '₹0'} - {buyer.budgetMax ? formatCurrency(buyer.budgetMax) : '₹0'}
                    </span>
                  </div>
                </div>
                {(buyer as any).bhkRequirement && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-800">BHK Requirement</h4>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{(buyer as any).bhkRequirement}</p>
                  </div>
                )}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-800">Timeline</h4>
                  </div>
                  <p className="text-lg font-medium text-gray-900 capitalize">{(buyer as any).possessionTimeline?.replace('_', ' ')}</p>
                </div>
              </div>
              
              {(buyer as any).specificRequirements && (
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-800">Specific Requirements</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{(buyer as any).specificRequirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(buyer as any).notes && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{(buyer as any).notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Lead Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-800">Current Status</h4>
                </div>
                <Badge className={`${statusColorMap[buyer.status]} px-3 py-1 text-sm font-medium`}>
                  {buyer.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-800">Priority Level</h4>
                </div>
                <Badge className={`${(priorityColorMap as any)[(buyer as any).priority]} px-3 py-1 text-sm font-medium`}>
                  {(buyer as any).priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lead Source */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Users className="h-5 w-5 text-emerald-600" />
                Lead Source
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-800">Source Channel</h4>
                </div>
                <p className="text-lg font-medium text-gray-900 capitalize">{(buyer as any).leadSource?.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-amber-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-800">Created</h4>
                </div>
                <p className="text-sm text-gray-600">{formatDate(buyer.createdAt)}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-800">Last Updated</h4>
                </div>
                <p className="text-sm text-gray-600">{formatDate(buyer.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change History */}
      {buyer.history && buyer.history.length > 0 && (
        <Card className="mt-8 shadow-sm border-gray-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Clock className="h-5 w-5 text-slate-600" />
              Change History
            </CardTitle>
            <CardDescription>
              Track of all changes made to this lead
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {buyer.history.map((historyItem: any) => (
                <div key={historyItem.id} className="border-l-4 border-blue-200 pl-6 pb-4 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{historyItem.action || 'Updated'}</h4>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                      {formatDate(historyItem.changedAt)}
                    </span>
                  </div>
                  {historyItem.changes && (
                    <p className="text-sm text-gray-700 mt-2 pl-6">{historyItem.changes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}