import { Search, Users, Star, Shield, Clock, CheckCircle, Award, TrendingUp, Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Search & Post",
    description: "Tell us about your project and get matched with qualified contractors in your area",
    details: "Our smart matching system connects you with pre-screened professionals"
  },
  {
    icon: Users,
    title: "Compare & Connect",
    description: "Review profiles, portfolios, and get detailed quotes from multiple contractors",
    details: "See real reviews, past work, and transparent pricing"
  },
  {
    icon: Star,
    title: "Hire & Complete",
    description: "Choose your contractor and track progress from start to finish",
    details: "Built-in project management and satisfaction guarantee"
  }
];

const benefits = [
  {
    icon: Shield,
    title: "Verified Contractors",
    description: "All contractors are background-checked and licensed"
  },
  {
    icon: Clock,
    title: "Fast Matching",
    description: "Get matched with contractors within 24 hours"
  },
  {
    icon: CheckCircle,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee on all projects"
  }
];

const stats = [
  { number: "50,000+", label: "Projects Completed" },
  { number: "15,000+", label: "Verified Contractors" },
  { number: "98%", label: "Customer Satisfaction" },
  { number: "24/7", label: "Support Available" }
];

const HowItWorks = () => {
  return (
    <>
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From project posting to completion, we make hiring contractors simple, safe, and successful
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="relative group"
              >
                <Card className="h-full border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <step.icon className="w-12 h-12 text-primary-foreground" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="hidden lg:block absolute top-12 left-1/2 transform translate-x-12 w-24 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                      )}
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-accent-foreground shadow-md">
                        {index + 1}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground text-center italic">{step.details}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're committed to connecting homeowners with the best contractors
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join the growing community of satisfied homeowners and contractors
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;