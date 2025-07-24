import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-background border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/331e323b-8177-4b3d-bae3-e5583eaaaf68.png" 
              alt="Northern Contractor Network" 
              className="h-8 sm:h-10 w-auto max-w-[200px] sm:max-w-[250px] object-contain"
            />
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-6">
            <button 
              onClick={() => navigate('/search')}
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              Find Contractors
            </button>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/industries" className="text-foreground hover:text-primary transition-colors">
              Industries
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button onClick={signOut} variant="ghost" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/auth">Join as Pro</Link>
                </Button>
              </div>
            )}
          </nav>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile & Tablet Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t">
            <nav className="mt-4 space-y-2">
              <button 
                onClick={() => {
                  navigate('/search');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-2 py-2 text-foreground hover:text-primary transition-colors"
              >
                Find Contractors
              </button>
              <Link to="/how-it-works" className="block px-2 py-2 text-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link to="/industries" className="block px-2 py-2 text-foreground hover:text-primary transition-colors">
                Industries
              </Link>
              
              {user ? (
                <div className="space-y-2 pt-2 border-t">
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button onClick={signOut} variant="ghost" className="w-full justify-start">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="default" asChild className="w-full">
                    <Link to="/auth">Join as Pro</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;