import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getBuyerById } from '@/lib/db'
import BuyerEditFormWrapper from './BuyerEditFormWrapper'
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
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        <Card>
       
            {/* Use client wrapper for edit form */}
            <BuyerEditFormWrapper buyer={buyer} />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              {buyer.fullName}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-1 text-sm">
              <Target className="h-3 w-3 text-blue-500" />
              Lead ID: {buyer.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="bg-white border-gray-300 text-gray-900">
              <Link href="/buyers" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href={`/buyers/${buyer.id}?edit=true`} className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
                <User className="h-4 w-4 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{buyer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{buyer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{buyer.city}</span>
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
                <Home className="h-4 w-4 text-blue-600" />
                Property Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Home className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Property Type</span>
                  </div>
                  <span className="text-sm text-gray-900 capitalize">{buyer.propertyType.replace('_', ' ')}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Budget Range</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {buyer.budgetMin ? formatCurrency(buyer.budgetMin) : '₹0'} - {buyer.budgetMax ? formatCurrency(buyer.budgetMax) : '₹0'}
                  </span>
                </div>
                {(buyer as any).bhkRequirement && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Home className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">BHK Requirement</span>
                    </div>
                    <span className="text-sm text-gray-900">{(buyer as any).bhkRequirement}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Timeline</span>
                  </div>
                  <span className="text-sm text-gray-900 capitalize">{(buyer as any).possessionTimeline?.replace('_', ' ')}</span>
                </div>
              </div>
              {(buyer as any).specificRequirements && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Specific Requirements</span>
                  </div>
                  <span className="text-sm text-gray-700">{(buyer as any).specificRequirements}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(buyer as any).notes && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{(buyer as any).notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Priority */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
                <CheckCircle className="h-4 w-4 text-indigo-600" />
                Lead Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                </div>
                <Badge className={`${statusColorMap[buyer.status]} px-2 py-0.5 text-xs font-medium`}>
                  {buyer.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Priority Level</span>
                </div>
                <Badge className={`${(priorityColorMap as any)[(buyer as any).priority]} px-2 py-0.5 text-xs font-medium`}>
                  {(buyer as any).priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lead Source */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
                <Users className="h-4 w-4 text-emerald-600" />
                Lead Source
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Source Channel</span>
                </div>
                <span className="text-sm text-gray-900 capitalize">{(buyer as any).leadSource?.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
                <Calendar className="h-4 w-4 text-amber-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Created</span>
                </div>
                <span className="text-xs text-gray-600">{formatDate(buyer.createdAt)}</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                </div>
                <span className="text-xs text-gray-600">{formatDate(buyer.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change History */}
      {buyer.history && buyer.history.length > 0 && (
        <Card className="mt-6 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-1 text-gray-900 text-base font-semibold">
              <Clock className="h-4 w-4 text-gray-600" />
              Change History
            </CardTitle>
            <CardDescription>
              Track of all changes made to this lead
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {buyer.history.map((historyItem: any) => (
                <div key={historyItem.id} className="border-l-2 border-gray-200 pl-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900 text-sm">{historyItem.action || 'Updated'}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(historyItem.changedAt)}
                    </span>
                  </div>
                  {historyItem.changes && (
                    <p className="text-xs text-gray-700 mt-1 pl-4">{historyItem.changes}</p>
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