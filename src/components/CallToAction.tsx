import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";
const benefits = [{
  icon: Shield,
  text: "Verified & Insured Contractors"
}, {
  icon: Clock,
  text: "Quick Response Times"
}, {
  icon: Users,
  text: "Thousands of Satisfied Customers"
}];
const CallToAction = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Find Your Perfect Contractor?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of homeowners who have found reliable, verified contractors through our platform
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <benefit.icon className="h-5 w-5" />
              <span className="text-sm">{benefit.text}</span>
            </div>
          ))}
        </div>
        
        <Button size="lg" variant="secondary" className="group">
          Get Started Today
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};
export default CallToAction;