import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail } from "lucide-react";
import contractor1 from "@/assets/contractor-1.jpg";
import contractor2 from "@/assets/contractor-2.jpg";
import contractor3 from "@/assets/contractor-3.jpg";

const contractors = [
  {
    id: 1,
    name: "Mike Johnson",
    profession: "Licensed Electrician",
    rating: 4.9,
    reviews: 127,
    location: "Downtown Area",
    image: contractor1,
    specialties: ["Residential Wiring", "Commercial Electrical", "Emergency Repairs"],
    yearsExperience: 12
  },
  {
    id: 2,
    name: "Sarah Williams",
    profession: "Master Plumber",
    rating: 4.8,
    reviews: 203,
    location: "Northside",
    image: contractor2,
    specialties: ["Pipe Installation", "Drain Cleaning", "Water Heaters"],
    yearsExperience: 8
  },
  {
    id: 3,
    name: "David Chen",
    profession: "General Contractor",
    rating: 5.0,
    reviews: 89,
    location: "West End",
    image: contractor3,
    specialties: ["Kitchen Remodeling", "Bathroom Renovation", "Custom Carpentry"],
    yearsExperience: 15
  }
];

const FeaturedContractors = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Top-Rated Contractors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet some of our highest-rated professionals ready to help with your project
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contractors.map((contractor, index) => (
            <div 
              key={contractor.id}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border group hover:border-primary/20"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-center mb-6">
                <img 
                  src={contractor.image}
                  alt={contractor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all"
                />
                <h3 className="text-xl font-semibold text-card-foreground mb-1">
                  {contractor.name}
                </h3>
                <p className="text-primary font-medium mb-2">{contractor.profession}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {contractor.location}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(contractor.rating) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{contractor.rating}</span>
                    <span className="text-muted-foreground">({contractor.reviews} reviews)</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Specializes in:</p>
                  <div className="flex flex-wrap gap-2">
                    {contractor.specialties.slice(0, 2).map((specialty) => (
                      <span 
                        key={specialty}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                    {contractor.specialties.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{contractor.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{contractor.yearsExperience} years experience</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    View Profile
                  </Button>
                  <Button className="flex-1" size="sm">
                    Get Quote
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            View All Contractors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedContractors;