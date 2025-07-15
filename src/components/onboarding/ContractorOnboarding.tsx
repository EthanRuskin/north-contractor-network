import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Building2 } from 'lucide-react';
import BusinessSetupForm from '@/components/dashboard/BusinessSetupForm';

interface ContractorOnboardingProps {
  onComplete: () => void;
}

const ContractorOnboarding = ({ onComplete }: ContractorOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showBusinessForm, setShowBusinessForm] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Welcome to Northern Contractor Network",
      description: "Let's get your business listed and start connecting with homeowners",
      completed: false
    },
    {
      id: 2,
      title: "Create Your Business Profile",
      description: "Set up your business information and services",
      completed: false
    },
    {
      id: 3,
      title: "Go Live",
      description: "Your profile will be visible to all homeowners immediately",
      completed: false
    }
  ];

  if (showBusinessForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Setup Your Business Profile</h1>
          <p className="text-muted-foreground">
            Complete your business information to start receiving inquiries from homeowners
          </p>
        </div>
        <BusinessSetupForm 
          business={null}
          onComplete={onComplete}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Your Contractor Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Let's get your business set up and start connecting with customers
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card key={step.id} className={`transition-all duration-300 ${
            currentStep === step.id ? 'ring-2 ring-primary' : ''
          } ${currentStep > step.id ? 'bg-green-50 border-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {currentStep === step.id && (
              <CardContent>
                {step.id === 1 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Create your detailed business profile</li>
                        <li>• Select the services you offer</li>
                        <li>• Your profile goes live immediately for homeowners to find</li>
                        <li>• Start receiving inquiries and building your reputation</li>
                      </ul>
                    </div>
                    <Button onClick={() => setCurrentStep(2)} className="w-full gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {step.id === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-foreground">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Ready to create your business profile?</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Fill out your business information, contact details, and services. 
                      Once completed, your profile will be immediately visible to homeowners searching for contractors.
                    </p>
                    <Button onClick={() => setShowBusinessForm(true)} className="w-full gap-2">
                      Create Business Profile <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">🚀 Instant Visibility</h3>
        <p className="text-green-800 text-sm">
          Unlike other platforms, your business profile goes live immediately after creation. 
          No waiting for approval - start connecting with homeowners right away!
        </p>
      </div>
    </div>
  );
};

export default ContractorOnboarding;