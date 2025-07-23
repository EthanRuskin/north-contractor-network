import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MapPin, Users, Handshake } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import canadaMapSubtle from "@/assets/canada-map-subtle.png";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Canadian Map Background */}
      <div 
        className="fixed inset-0 opacity-5 bg-no-repeat bg-center bg-contain pointer-events-none z-0"
        style={{
          backgroundImage: `url(${canadaMapSubtle})`,
          backgroundSize: '80%',
        }}
      ></div>
      
      <div className="relative z-10">
        <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Northern Contractor Network is a non-profit directory dedicated to helping Canadian contractors 
            connect with homeowners while supporting Canadian families in need.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Created by Advertised Solutions</span>
          </div>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We believe in the power of community and giving back. As a non-profit organization, 
              we're committed to creating opportunities for Canadian contractors while making a 
              positive impact on families across Canada.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every interaction on our platform contributes to our mission of supporting 
              Canadian families through various charitable initiatives and community programs.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-primary">Proudly Canadian</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Supporting contractors and families from coast to coast across Canada.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* How We Help Section */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">How We Help</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Connecting Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We provide a trusted platform where Canadian homeowners can find qualified, 
                  local contractors for their projects, fostering strong community connections.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Handshake className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Supporting Contractors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We help Canadian contractors grow their businesses by providing them with 
                  a professional platform to showcase their work and connect with potential clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Giving Back</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All proceeds from our platform are allocated to programs that help Canadian 
                  families in need, creating a positive impact in communities across the country.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">The Process</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Contractors Join</h3>
              <p className="text-muted-foreground text-sm">
                Canadian contractors create profiles showcasing their services and expertise.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">Homeowners Search</h3>
              <p className="text-muted-foreground text-sm">
                Homeowners browse and find qualified contractors for their projects.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Connections Made</h3>
              <p className="text-muted-foreground text-sm">
                Quality matches are made between contractors and homeowners.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                4
              </div>
              <h3 className="font-semibold text-foreground mb-2">Families Benefit</h3>
              <p className="text-muted-foreground text-sm">
                Proceeds help support Canadian families through our charitable programs.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* CTA Section - Full Width */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Contractor?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of homeowners who have found reliable, verified contractors through our platform
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm">Verified & Insured Contractors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm">Quick Response Times</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm">Thousands of Satisfied Customers</span>
            </div>
          </div>
          
          <Button size="lg" variant="secondary" className="group">
            Get Started Today
            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default HowItWorks;