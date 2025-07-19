import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Star, MapPin, Phone, Mail, Globe, Calendar, Award, MessageSquare, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  years_experience: number;
  license_number: string;
  rating: number;
  review_count: number;
  logo_url: string;
  gallery_images: string[];
  created_at: string;
  contractor_services: {
    services: {
      name: string;
    };
  }[];
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

const ContractorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [contractor, setContractor] = useState<ContractorBusiness | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchContractorProfile();
      fetchReviews();
    }
  }, [id]);

  const fetchContractorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractor_businesses')
        .select(`
          *,
          contractor_services (
            services (
              name
            )
          )
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setContractor(data);
    } catch (error: any) {
      toast({
        title: "Error loading contractor",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('contractor_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // For now, set reviews without profile information since there's no FK relationship
      const reviewsWithProfiles = (data || []).map(review => ({
        ...review,
        profiles: { full_name: 'Anonymous User' }
      }));
      
      setReviews(reviewsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast({
        title: "Review incomplete",
        description: "Please provide both a title and comment",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          contractor_id: id!,
          reviewer_id: user.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
      fetchContractorProfile(); // Refresh to update rating
    } catch (error: any) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Contractor not found</p>
              <Button onClick={() => navigate('/dashboard')} className="mt-4">
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={contractor.logo_url || ''} />
                    <AvatarFallback className="text-lg">
                      {contractor.business_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">{contractor.business_name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                      {contractor.city && contractor.province && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {contractor.city}, {contractor.province}
                        </div>
                      )}
                      {contractor.rating > 0 && (
                        <div className="flex items-center gap-2">
                          {renderStars(contractor.rating)}
                          <span className="font-medium">{contractor.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({contractor.review_count} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractor.description && (
                  <p className="text-muted-foreground">{contractor.description}</p>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  {contractor.years_experience > 0 && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {contractor.years_experience} years of experience
                      </span>
                    </div>
                  )}
                  {contractor.license_number && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">License: {contractor.license_number}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {contractor.contractor_services.map((cs, index) => (
                      <Badge key={index} variant="secondary">
                        {cs.services.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                  {user && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Write Review</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Write a Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Rating</label>
                            {renderStars(reviewRating, true, setReviewRating)}
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Title</label>
                            <input
                              className="w-full p-2 border rounded-md"
                              value={reviewTitle}
                              onChange={(e) => setReviewTitle(e.target.value)}
                              placeholder="Review title"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Comment</label>
                            <Textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share your experience..."
                              rows={4}
                            />
                          </div>
                          <Button
                            onClick={submitReview}
                            disabled={submittingReview}
                            className="w-full"
                          >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to leave a review!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {renderStars(review.rating)}
                              <span className="font-medium">{review.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              by {review.profiles?.full_name || 'Anonymous'} • {' '}
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contractor.phone && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={`tel:${contractor.phone}`}>
                      <Phone className="h-4 w-4" />
                      {contractor.phone}
                    </a>
                  </Button>
                )}
                {contractor.email && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={`mailto:${contractor.email}`}>
                      <Mail className="h-4 w-4" />
                      {contractor.email}
                    </a>
                  </Button>
                )}
                {contractor.website && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={contractor.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                {contractor.address && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {contractor.address}
                      {contractor.city && contractor.province && (
                        <>
                          <br />
                          {contractor.city}, {contractor.province}
                        </>
                      )}
                      {contractor.postal_code && (
                        <>
                          <br />
                          {contractor.postal_code}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            {contractor.gallery_images && contractor.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Work Gallery ({contractor.gallery_images.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {contractor.gallery_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${contractor.business_name} work ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(image)}
                      />
                    ))}
                  </div>
                  {contractor.gallery_images.length > 4 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => setSelectedImage(contractor.gallery_images[0])}
                    >
                      View All Photos ({contractor.gallery_images.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Gallery Image</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={selectedImage}
                  alt="Gallery image"
                  className="max-w-full max-h-[70vh] object-contain rounded-md"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ContractorProfile;