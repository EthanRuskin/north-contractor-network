import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Northern Contractor Network
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Find Contractors
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              For Contractors
            </a>
            <Button variant="outline" size="sm" asChild>
              <a href="/auth">Sign In</a>
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href="/auth">Join as Pro</a>
            </Button>
          </nav>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;