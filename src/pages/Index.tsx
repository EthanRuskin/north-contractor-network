import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedContractors from "@/components/FeaturedContractors";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      
      <Header />
      <Hero />
      <ServiceCategories />
      <HowItWorks />
      <FeaturedContractors />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
