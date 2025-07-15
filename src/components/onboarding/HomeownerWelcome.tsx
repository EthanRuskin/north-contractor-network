import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Star, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeownerWelcomeProps {
  onComplete: () => void;
}

const HomeownerWelcome = ({ onComplete }: HomeownerWelcomeProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Northern Contractor Network
        </h1>
        <p className="text-xl text-muted-foreground">
          Find trusted contractors for your home improvement projects
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Search className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Find Contractors</CardTitle>
            <CardDescription>
              Search by service type, location, or specific needs
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Star className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Read Reviews</CardTitle>
            <CardDescription>
              See what other homeowners say about their experience
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Connect Directly</CardTitle>
            <CardDescription>
              Contact contractors and get quotes for your project
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Ready to Start Your Project?</h3>
            <p className="text-muted-foreground">
              Browse our network of verified contractors and find the perfect match for your needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/search">
                  Browse Contractors <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={onComplete}>
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/services/plumbing" className="block text-sm text-primary hover:underline">
                • Plumbing & Heating
              </Link>
              <Link to="/services/electrical" className="block text-sm text-primary hover:underline">
                • Electrical Services
              </Link>
              <Link to="/services/roofing" className="block text-sm text-primary hover:underline">
                • Roofing & Gutters
              </Link>
              <Link to="/services/flooring" className="block text-sm text-primary hover:underline">
                • Flooring Installation
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Search for contractors in your area</p>
              <p>2. Read reviews and compare profiles</p>
              <p>3. Contact contractors directly</p>
              <p>4. Get quotes and hire the best fit</p>
              <p>5. Leave a review after completion</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeownerWelcome;