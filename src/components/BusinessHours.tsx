import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface BusinessHoursProps {
  businessName: string;
}

const BusinessHours = ({ businessName }: BusinessHoursProps) => {
  // Default business hours - you could extend this to be dynamic from the database
  const businessHours = [
    { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {businessHours.map((schedule) => (
            <div
              key={schedule.day}
              className={`flex justify-between items-center py-1 ${
                schedule.day === currentDay 
                  ? 'bg-primary/10 rounded px-2 font-medium' 
                  : ''
              }`}
            >
              <span className="text-sm">{schedule.day}</span>
              <span className={`text-sm ${
                schedule.hours === 'Closed' 
                  ? 'text-muted-foreground' 
                  : 'text-foreground'
              }`}>
                {schedule.hours}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Hours may vary on holidays. Please call ahead to confirm availability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessHours;