"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, BarChart3, FileText } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to buyers page if already authenticated
    if (status === "authenticated") {
      router.push("/buyers");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-foreground">Buyer Lead CRM</h1>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
            Manage Your
            <span className="text-primary"> Buyer Leads</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Comprehensive buyer lead intake and management system. Capture, organize, and track your real estate leads with powerful filtering, search, and analytics.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/signin">
                Get Started
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Everything you need to manage leads
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built specifically for real estate professionals
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Lead Management */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-primary mr-3" />
                  <CardTitle className="text-foreground">Lead Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Create, edit, and track buyer leads with comprehensive property requirements, budgets, and timelines.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Detailed lead capture forms</li>
                  <li>• Property type & BHK filtering</li>
                  <li>• Budget range tracking</li>
                  <li>• Status progression</li>
                </ul>
              </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-primary mr-3" />
                  <CardTitle className="text-foreground">Smart Filtering</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Advanced search and filtering capabilities to find the right leads quickly and efficiently.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Real-time search</li>
                  <li>• Multi-criteria filtering</li>
                  <li>• URL-synced parameters</li>
                  <li>• Custom sorting options</li>
                </ul>
              </CardContent>
            </Card>

            {/* Import/Export */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary mr-3" />
                  <CardTitle className="text-foreground">Data Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Import existing leads from CSV files and export filtered data for analysis and reporting.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• CSV import with validation</li>
                  <li>• Filtered export options</li>
                  <li>• Error reporting</li>
                  <li>• Bulk operations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Ready to streamline your lead management?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Start managing your buyer leads more effectively today.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 bg-background hover:bg-background/90 text-foreground">
            <Link href="/auth/signin">
              Sign In to Get Started
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Buyer Lead CRM. Built with Next.js and modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
