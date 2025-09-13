import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">Check your email</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            A sign in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to sign in to your account.
            </p>
            <p className="text-xs text-muted-foreground">
              If you don't see the email, check your spam folder.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}