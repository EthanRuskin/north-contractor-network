import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Wrench, Zap, Home, Droplets, Hammer, Paintbrush, TreePine, Car, Flame, Send, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Industry {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  contractorCount: number;
  avgRating: number;
  featured?: boolean;
}

const Industries = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newIndustryName, setNewIndustryName] = useState('');
  const [newIndustryDescription, setNewIndustryDescription] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Comprehensive list of contractor industries
  const industries: Industry[] = [
    // Construction & Building
    { id: 'general-contracting', name: 'General Contracting', description: 'Full-service construction and renovation projects', icon: Hammer, category: 'Construction', contractorCount: 324, avgRating: 4.7, featured: true },
    { id: 'electrical', name: 'Electrical Services', description: 'Electrical installation, repair, and maintenance', icon: Zap, category: 'Construction', contractorCount: 298, avgRating: 4.8, featured: true },
    { id: 'plumbing', name: 'Plumbing & Heating', description: 'Plumbing systems, heating, and water services', icon: Droplets, category: 'Construction', contractorCount: 267, avgRating: 4.6, featured: true },
    { id: 'roofing', name: 'Roofing & Gutters', description: 'Roof installation, repair, and gutter systems', icon: Home, category: 'Construction', contractorCount: 189, avgRating: 4.5 },
    { id: 'flooring', name: 'Flooring Installation', description: 'Hardwood, tile, carpet, and specialty flooring', icon: Home, category: 'Construction', contractorCount: 156, avgRating: 4.7 },
    { id: 'painting', name: 'Painting & Decorating', description: 'Interior and exterior painting services', icon: Paintbrush, category: 'Construction', contractorCount: 134, avgRating: 4.4 },
    { id: 'hvac', name: 'HVAC Services', description: 'Heating, ventilation, and air conditioning', icon: Flame, category: 'Construction', contractorCount: 178, avgRating: 4.6 },
    { id: 'insulation', name: 'Insulation Services', description: 'Thermal and acoustic insulation installation', icon: Home, category: 'Construction', contractorCount: 87, avgRating: 4.5 },
    { id: 'drywall', name: 'Drywall & Plastering', description: 'Drywall installation, repair, and finishing', icon: Hammer, category: 'Construction', contractorCount: 145, avgRating: 4.3 },
    { id: 'windows-doors', name: 'Windows & Doors', description: 'Window and door installation and replacement', icon: Home, category: 'Construction', contractorCount: 123, avgRating: 4.6 },
    
    // Home Improvement
    { id: 'kitchen-renovation', name: 'Kitchen Renovation', description: 'Complete kitchen remodeling and upgrades', icon: Home, category: 'Home Improvement', contractorCount: 201, avgRating: 4.8 },
    { id: 'bathroom-renovation', name: 'Bathroom Renovation', description: 'Bathroom remodeling and fixture installation', icon: Droplets, category: 'Home Improvement', contractorCount: 167, avgRating: 4.7 },
    { id: 'basement-finishing', name: 'Basement Finishing', description: 'Basement conversion and finishing services', icon: Home, category: 'Home Improvement', contractorCount: 98, avgRating: 4.5 },
    { id: 'home-additions', name: 'Home Additions', description: 'Room additions and home expansions', icon: Hammer, category: 'Home Improvement', contractorCount: 76, avgRating: 4.6 },
    { id: 'deck-patio', name: 'Decks & Patios', description: 'Outdoor deck and patio construction', icon: Home, category: 'Home Improvement', contractorCount: 89, avgRating: 4.4 },
    
    // Landscaping & Outdoor
    { id: 'landscaping', name: 'Landscaping', description: 'Garden design, planting, and outdoor beautification', icon: TreePine, category: 'Landscaping', contractorCount: 234, avgRating: 4.5, featured: true },
    { id: 'lawn-care', name: 'Lawn Care & Maintenance', description: 'Grass cutting, fertilization, and lawn health', icon: TreePine, category: 'Landscaping', contractorCount: 189, avgRating: 4.3 },
    { id: 'tree-services', name: 'Tree Services', description: 'Tree removal, trimming, and arborist services', icon: TreePine, category: 'Landscaping', contractorCount: 145, avgRating: 4.6 },
    { id: 'fence-installation', name: 'Fence Installation', description: 'Residential and commercial fencing solutions', icon: Home, category: 'Landscaping', contractorCount: 112, avgRating: 4.4 },
    { id: 'irrigation', name: 'Irrigation Systems', description: 'Sprinkler systems and water management', icon: Droplets, category: 'Landscaping', contractorCount: 67, avgRating: 4.5 },
    { id: 'hardscaping', name: 'Hardscaping', description: 'Stone work, retaining walls, and walkways', icon: Hammer, category: 'Landscaping', contractorCount: 89, avgRating: 4.6 },
    
    // Specialty Services
    { id: 'pool-services', name: 'Pool Services', description: 'Pool installation, maintenance, and repair', icon: Droplets, category: 'Specialty', contractorCount: 54, avgRating: 4.7 },
    { id: 'solar-installation', name: 'Solar Installation', description: 'Solar panel installation and renewable energy', icon: Zap, category: 'Specialty', contractorCount: 43, avgRating: 4.8 },
    { id: 'security-systems', name: 'Security Systems', description: 'Home security and surveillance installation', icon: Home, category: 'Specialty', contractorCount: 67, avgRating: 4.6 },
    { id: 'smart-home', name: 'Smart Home Automation', description: 'Home automation and smart device installation', icon: Zap, category: 'Specialty', contractorCount: 34, avgRating: 4.7 },
    { id: 'pest-control', name: 'Pest Control', description: 'Extermination and pest prevention services', icon: Home, category: 'Specialty', contractorCount: 78, avgRating: 4.4 },
    
    // Automotive & Vehicle
    { id: 'garage-doors', name: 'Garage Door Services', description: 'Garage door installation, repair, and automation', icon: Car, category: 'Automotive', contractorCount: 89, avgRating: 4.5 },
    { id: 'driveway-paving', name: 'Driveway Paving', description: 'Asphalt and concrete driveway installation', icon: Car, category: 'Automotive', contractorCount: 67, avgRating: 4.3 },
    
    // Cleaning & Maintenance
    { id: 'power-washing', name: 'Power Washing', description: 'Exterior cleaning and pressure washing services', icon: Droplets, category: 'Cleaning', contractorCount: 123, avgRating: 4.4 },
    { id: 'gutter-cleaning', name: 'Gutter Cleaning', description: 'Gutter maintenance and cleaning services', icon: Home, category: 'Cleaning', contractorCount: 89, avgRating: 4.3 },
    { id: 'window-cleaning', name: 'Window Cleaning', description: 'Professional window cleaning services', icon: Home, category: 'Cleaning', contractorCount: 67, avgRating: 4.2 },
    
    // Commercial Services
    { id: 'commercial-construction', name: 'Commercial Construction', description: 'Large-scale commercial building projects', icon: Hammer, category: 'Commercial', contractorCount: 45, avgRating: 4.7 },
    { id: 'facility-maintenance', name: 'Facility Maintenance', description: 'Commercial building maintenance services', icon: Wrench, category: 'Commercial', contractorCount: 56, avgRating: 4.5 },
    { id: 'office-renovation', name: 'Office Renovation', description: 'Commercial office space renovation', icon: Home, category: 'Commercial', contractorCount: 34, avgRating: 4.6 }
  ];

  const categories = Array.from(new Set(industries.map(industry => industry.category)));

  const filteredIndustries = industries.filter(industry => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || industry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredIndustries = industries.filter(industry => industry.featured);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndustryName.trim()) {
      toast({
        title: "Please enter an industry name",
        variant: "destructive",
      });
      return;
    }

    setSubmittingRequest(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Industry request submitted!",
        description: "We'll review your request and add the industry if it meets our criteria.",
      });
      setNewIndustryName('');
      setNewIndustryDescription('');
      setSubmittingRequest(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contractor Industries
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive directory of contractor industries. Find trusted professionals 
            for every type of home improvement, construction, and maintenance project.
          </p>
        </div>

        {/* Featured Industries */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Industries</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredIndustries.map((industry) => (
              <Card key={industry.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <industry.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{industry.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">{industry.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{industry.contractorCount} contractors</span>
                    <span>★ {industry.avgRating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Industry
            </CardTitle>
            <CardDescription>
              Search through {industries.length} contractor industries to find the perfect match for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search industries (e.g., plumbing, electrical, landscaping...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredIndustries.length} industries matching "{searchTerm}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Industries Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {filteredIndustries.map((industry) => (
            <Card key={industry.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <industry.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {industry.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {industry.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {industry.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{industry.contractorCount} contractors</span>
                      <div className="flex items-center gap-1">
                        <span>★ {industry.avgRating}</span>
                        <span className="text-yellow-500">rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIndustries.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No industries found matching your search criteria.
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms or request a new industry below.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Request New Industry Form */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Request a New Industry</CardTitle>
            <CardDescription>
              Don't see your industry listed? Fill out this form and we'll consider adding it to our directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="industry-name">Industry Name *</Label>
                  <Input
                    id="industry-name"
                    placeholder="e.g., Pool Maintenance, Solar Installation"
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry-category">Suggested Category</Label>
                  <select
                    id="industry-category"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="industry-description">Description</Label>
                <Textarea
                  id="industry-description"
                  placeholder="Describe the services and work involved in this industry..."
                  value={newIndustryDescription}
                  onChange={(e) => setNewIndustryDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submittingRequest} className="gap-2">
                  {submittingRequest ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Industries;