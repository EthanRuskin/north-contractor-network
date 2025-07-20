import { useNavigate } from "react-router-dom";
import { Wrench, Zap, Hammer, Paintbrush, Home, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: Wrench, name: "Plumbing", description: "Repairs, installations, and maintenance" },
  { icon: Zap, name: "Electrical", description: "Wiring, outlets, and electrical repairs" },
  { icon: Hammer, name: "Construction", description: "Remodeling and construction projects" },
  { icon: Paintbrush, name: "Painting", description: "Interior and exterior painting services" },
  { icon: Home, name: "Roofing", description: "Roof repairs and installations" },
  { icon: Thermometer, name: "HVAC", description: "Heating and cooling services" },
];

const ServiceCategories = () => {
  const navigate = useNavigate();
  
  return (
    <section id="services" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Popular Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find qualified contractors for all your home improvement needs
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <div 
              key={service.name}
              className="text-center p-4 sm:p-6 rounded-xl border hover:border-primary hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate('/search')}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{service.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden lg:block">{service.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" onClick={() => navigate('/search')}>
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;