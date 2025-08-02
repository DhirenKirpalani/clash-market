import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark-bg text-white">
      <Card className="w-full max-w-md mx-4 gaming-card nft-card">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-6">
            <Link href="/" className="text-electric-purple hover:text-electric-purple/80 transition">
              Return to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
