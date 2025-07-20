import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <div className="mb-8">
              <h1 className="text-6xl sm:text-8xl font-bold text-primary mb-4">404</h1>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Page not found</h2>
              <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
