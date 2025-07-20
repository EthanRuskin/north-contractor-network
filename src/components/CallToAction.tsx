import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";

const benefits = [
  { icon: Shield, text: "Verified & Insured Contractors" },
  { icon: Clock, text: "Quick Response Times" },
  { icon: Users, text: "Thousands of Satisfied Customers" }
];

const CallToAction = () => {
  return (
    <section className="py-16 text-foreground" style={{ backgroundColor: '#D3D3D3' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of homeowners who have found their perfect contractor through Northern Contractor Network
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Find a Contractor
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Join as a Professional
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <p className="text-primary-foreground/90">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;