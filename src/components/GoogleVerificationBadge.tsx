import { Shield, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GoogleVerificationBadgeProps {
  isVerified: boolean;
  verificationDate?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const GoogleVerificationBadge = ({ 
  isVerified, 
  verificationDate, 
  size = 'md',
  showTooltip = true 
}: GoogleVerificationBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const badgeContent = (
    <Badge 
      variant="secondary"
      className={`
        bg-blue-50 text-blue-700 border-blue-200 
        hover:bg-blue-100 transition-colors
        flex items-center gap-1.5
        ${sizeClasses[size]}
      `}
    >
      <Shield className={`${iconSizes[size]} text-blue-600`} />
      <span className="font-medium">Verified by Google</span>
      <Check className={`${iconSizes[size]} text-green-600`} />
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">Google Business Profile Verified</p>
            <p className="text-xs text-muted-foreground">
              This business has been verified through Google Business Profile
            </p>
            {verificationDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Verified: {new Date(verificationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GoogleVerificationBadge;