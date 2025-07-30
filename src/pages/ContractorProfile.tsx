import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import SearchHeader from '@/components/SearchHeader';

const ContractorProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/search')} 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>

        <Card>
          <CardContent className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Contractor Profile</h1>
            <p className="text-muted-foreground mb-4">
              This page is being updated with enhanced security features.
            </p>
            <Button onClick={() => navigate('/search')}>
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorProfile;