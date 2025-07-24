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
import { ArrowLeft, Star, MapPin, Phone, Mail, Globe, Calendar, Award, MessageSquare, X, Users, FolderOpen, Instagram, Facebook, Linkedin, Video, Music, Heart, Shield, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';
import BusinessHours from '@/components/BusinessHours';
import GoogleVerificationBadge from '@/components/GoogleVerificationBadge';
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
  google_business_verified: boolean;
  google_place_id: string;
  google_verification_date: string;
  google_business_url: string;
  instagram_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  x_url?: string;
  youtube_url?: string;
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
interface ContractorProject {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  created_at: string;
}
const ContractorProfile = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<ContractorBusiness | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [projects, setProjects] = useState<ContractorProject[]>([]);
  const [suggestedContractors, setSuggestedContractors] = useState<ContractorBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ContractorProject | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingContractor, setSavingContractor] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    user_type: string;
  } | null>(null);
  useEffect(() => {
    if (id) {
      fetchContractorProfile();
      fetchReviews();
      fetchProjects();
      if (user) {
        checkIfSaved();
        fetchUserProfile();
      }
    }
  }, [id, user]);
  useEffect(() => {
    if (contractor) {
      fetchSuggestedContractors();
    }
  }, [contractor]);
  const fetchContractorProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('contractor_businesses').select(`
          *,
          contractor_services (
            services (
              name
            )
          )
        `).eq('id', id).eq('status', 'approved').single();
      if (error) throw error;
      setContractor(data);
    } catch (error: any) {
      toast({
        title: "Error loading contractor",
        description: error.message,
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  const fetchReviews = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('reviews').select('*').eq('contractor_id', id).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // For now, set reviews without profile information since there's no FK relationship
      const reviewsWithProfiles = (data || []).map(review => ({
        ...review,
        profiles: {
          full_name: 'Anonymous User'
        }
      }));
      setReviews(reviewsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    }
  };
  const fetchProjects = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('contractor_projects').select('*').eq('contractor_id', id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    }
  };
  const fetchSuggestedContractors = async () => {
    if (!contractor) return;
    try {
      // Get service names from current contractor
      const currentServices = contractor.contractor_services.map(cs => cs.services.name);

      // Fetch contractors with similar services (excluding current contractor)
      const {
        data,
        error
      } = await supabase.from('contractor_businesses').select(`
          *,
          contractor_services (
            services (
              name
            )
          )
        `).eq('status', 'approved').neq('id', contractor.id).limit(4);
      if (error) throw error;

      // Filter and sort by relevance (contractors with matching services first)
      const suggested = (data || []).map(business => ({
        ...business,
        relevanceScore: business.contractor_services.reduce((score, cs) => {
          return currentServices.includes(cs.services.name) ? score + 1 : score;
        }, 0)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore || b.rating - a.rating).slice(0, 6);
      setSuggestedContractors(suggested);
    } catch (error: any) {
      console.error('Error fetching suggested contractors:', error);
    }
  };
  const submitReview = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (!userProfile || userProfile.user_type !== 'homeowner') {
      toast({
        title: "Access denied",
        description: "Only homeowners can write reviews.",
        variant: "destructive"
      });
      return;
    }

    // Input validation and sanitization
    const sanitizedComment = reviewComment.trim().slice(0, 1000);
    const sanitizedTitle = reviewTitle.trim().slice(0, 200);
    if (sanitizedComment.length < 10) {
      toast({
        title: "Review too short",
        description: "Please write a review with at least 10 characters.",
        variant: "destructive"
      });
      return;
    }
    setSubmittingReview(true);
    try {
      // Check for rate limiting
      const {
        data: rateLimitData
      } = await supabase.from('review_rate_limits').select('*').eq('user_id', user.id).gte('last_review_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).maybeSingle();
      if (rateLimitData && rateLimitData.review_count_today >= 5) {
        toast({
          title: "Daily limit reached",
          description: "You can only submit 5 reviews per day. Please try again tomorrow.",
          variant: "destructive"
        });
        return;
      }

      // Check for existing review
      const {
        data: existingReview
      } = await supabase.from('reviews').select('id').eq('contractor_id', id!).eq('reviewer_id', user.id).maybeSingle();
      if (existingReview) {
        toast({
          title: "Review already exists",
          description: "You have already reviewed this contractor.",
          variant: "destructive"
        });
        return;
      }
      const {
        error
      } = await supabase.from('reviews').insert({
        contractor_id: id!,
        reviewer_id: user.id,
        rating: reviewRating,
        title: sanitizedTitle || null,
        comment: sanitizedComment
      });
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Review already exists",
            description: "You have already reviewed this contractor.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      // Update rate limiting
      await supabase.from('review_rate_limits').upsert({
        user_id: user.id,
        last_review_at: new Date().toISOString(),
        review_count_today: (rateLimitData?.review_count_today || 0) + 1
      }, {
        onConflict: 'user_id'
      });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
      fetchContractorProfile(); // Refresh to update rating
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Unable to submit review. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSubmittingReview(false);
    }
  };
  const checkIfSaved = async () => {
    if (!user || !id) return;
    try {
      const {
        data,
        error
      } = await supabase.from('saved_contractors').select('id').eq('user_id', user.id).eq('contractor_id', id).maybeSingle();
      if (error) throw error;
      setIsSaved(!!data);
    } catch (error: any) {
      console.error('Error checking if contractor is saved:', error);
    }
  };
  const toggleSaveContractor = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save contractors",
        variant: "destructive"
      });
      return;
    }
    setSavingContractor(true);
    try {
      if (isSaved) {
        // Unsave contractor
        const {
          error
        } = await supabase.from('saved_contractors').delete().eq('user_id', user.id).eq('contractor_id', id!);
        if (error) throw error;
        setIsSaved(false);
        toast({
          title: "Contractor removed",
          description: "Contractor removed from your saved list"
        });
      } else {
        // Save contractor
        const {
          error
        } = await supabase.from('saved_contractors').insert({
          user_id: user.id,
          contractor_id: id!
        });
        if (error) throw error;
        setIsSaved(true);
        toast({
          title: "Contractor saved",
          description: "Contractor added to your saved list"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingContractor(false);
    }
  };
  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('user_type').eq('user_id', user.id).single();
      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };
  const handleWriteReviewClick = () => {
    if (!user) {
      setShowAuthDialog(true);
    }
    // If user is logged in, the dialog will open automatically via DialogTrigger
  };
  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`} onClick={() => interactive && onRate?.(star)} />)}
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>;
  }
  if (!contractor) {
    return <div className="min-h-screen bg-background">
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
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/search')} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 order-last lg:order-first">
            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                 <div className="flex flex-col sm:flex-row items-start gap-4">
                   <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                     <AvatarImage src={contractor.logo_url || ''} />
                     <AvatarFallback className="text-lg">
                       {contractor.business_name.slice(0, 2).toUpperCase()}
                     </AvatarFallback>
                   </Avatar>
                   <div className="flex-1 text-center sm:text-left">
                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                       <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                         <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{contractor.business_name}</h1>
                        <GoogleVerificationBadge isVerified={contractor.google_business_verified} verificationDate={contractor.google_verification_date} size="md" />
                      </div>
                      {user && <Button variant="ghost" size="icon" onClick={toggleSaveContractor} disabled={savingContractor} className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                          <Heart className={`h-5 w-5 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </Button>}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {contractor.city && contractor.province && <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {contractor.city}, {contractor.province}
                        </div>}
                      {contractor.rating > 0 && <div className="flex items-center gap-2">
                          {renderStars(contractor.rating)}
                          <span className="font-medium">{contractor.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({contractor.review_count} reviews)
                          </span>
                        </div>}
                    </div>
                  </div>
                </div>
                
                 {/* Gallery Images */}
                 {contractor.gallery_images && contractor.gallery_images.length > 0 && <div className="mt-6">
                     
                   </div>}
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractor.description && <p className="text-muted-foreground">{contractor.description}</p>}
                
                <div className="grid gap-4 md:grid-cols-2">
                  {contractor.years_experience > 0 && <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {contractor.years_experience} years of experience
                      </span>
                    </div>}
                  {contractor.license_number && <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">License: {contractor.license_number}</span>
                    </div>}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {contractor.contractor_services.map((cs, index) => <Badge key={index} variant="secondary">
                        {cs.services.name}
                      </Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            {projects.length > 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Projects ({projects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => <div key={project.id} className="relative group cursor-pointer" onClick={() => setSelectedProject(project)}>
                        <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                          {project.images.length > 0 ? <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <FolderOpen className="h-12 w-12 text-gray-400" />
                            </div>}
                          
                          {/* Image count badge */}
                          {project.images.length > 0 && <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                              <span>{project.images.length}</span>
                            </div>}
                          
                          {/* Title overlay */}
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3">
                            <h3 className="text-white font-semibold text-sm leading-tight">{project.title}</h3>
                          </div>
                        </div>
                        
                        {/* Project info */}
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            {/* Project Gallery Dialog */}
            <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                {selectedProject && <>
                    <DialogHeader>
                      <DialogTitle>{selectedProject.title}</DialogTitle>
                      {selectedProject.description && <p className="text-muted-foreground">{selectedProject.description}</p>}
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[70vh]">
                      {selectedProject.images.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProject.images.map((image, index) => <img key={index} src={image} alt={`${selectedProject.title} ${index + 1}`} className="w-full h-64 object-cover rounded-lg" />)}
                        </div> : <div className="flex items-center justify-center h-32 text-muted-foreground">
                          <FolderOpen className="h-8 w-8 mr-2" />
                          No images in this project
                        </div>}
                    </div>
                  </>}
              </DialogContent>
            </Dialog>


            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                  {(!user || userProfile?.user_type === 'homeowner') && <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={handleWriteReviewClick}>Write Review</Button>
                      </DialogTrigger>
                      {user && userProfile?.user_type === 'homeowner' && <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Write a Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Rating</label>
                            {renderStars(reviewRating, true, setReviewRating)}
                          </div>
                           <div>
                             <label className="text-sm font-medium mb-2 block">Title (optional)</label>
                             <input className="w-full p-2 border rounded-md" value={reviewTitle} onChange={e => setReviewTitle(e.target.value.slice(0, 200))} placeholder="Review title" maxLength={200} />
                             <p className="text-xs text-muted-foreground mt-1">
                               {reviewTitle.length}/200 characters
                             </p>
                           </div>
                           <div>
                             <label className="text-sm font-medium mb-2 block">Comment</label>
                             <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value.slice(0, 1000))} placeholder="Share your experience... (minimum 10 characters)" rows={4} maxLength={1000} />
                             <p className="text-xs text-muted-foreground mt-1">
                               {reviewComment.length}/1000 characters (minimum 10)
                             </p>
                           </div>
                           <Button onClick={submitReview} disabled={submittingReview || reviewComment.trim().length < 10} className="w-full">
                             {submittingReview ? 'Submitting...' : 'Submit Review'}
                           </Button>
                        </div>
                      </DialogContent>}
                    </Dialog>}
                </div>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to leave a review!
                  </p> : <div className="space-y-4">
                    {reviews.map(review => <div key={review.id} className="border-b pb-4 last:border-b-0">
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
                      </div>)}
                  </div>}
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
                {contractor.phone && <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={`tel:${contractor.phone}`}>
                      <Phone className="h-4 w-4" />
                      {contractor.phone}
                    </a>
                  </Button>}
                {contractor.email && <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={`mailto:${contractor.email}`}>
                      <Mail className="h-4 w-4" />
                      {contractor.email}
                    </a>
                  </Button>}
                {contractor.website && <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={contractor.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>}
                {contractor.address && <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {contractor.address}
                      {contractor.city && contractor.province && <>
                          <br />
                          {contractor.city}, {contractor.province}
                        </>}
                      {contractor.postal_code && <>
                          <br />
                          {contractor.postal_code}
                        </>}
                    </p>
                  </div>}
              </CardContent>
            </Card>

            {/* Social Profiles */}
            {(contractor.instagram_url || contractor.facebook_url || contractor.linkedin_url || contractor.tiktok_url || contractor.x_url || contractor.youtube_url) && <Card>
                <CardHeader>
                  <CardTitle>Social Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {contractor.instagram_url && <Button asChild variant="outline" size="icon">
                        <a href={contractor.instagram_url} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>}
                    {contractor.facebook_url && <Button asChild variant="outline" size="icon">
                        <a href={contractor.facebook_url} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>}
                    {contractor.linkedin_url && <Button asChild variant="outline" size="icon">
                        <a href={contractor.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>}
                    {contractor.tiktok_url && <Button asChild variant="outline" size="icon">
                        <a href={contractor.tiktok_url} target="_blank" rel="noopener noreferrer">
                          <Music className="h-4 w-4" />
                        </a>
                      </Button>}
                    {contractor.x_url && <Button asChild variant="outline" size="icon">
                        <a href={contractor.x_url} target="_blank" rel="noopener noreferrer">
                          <X className="h-4 w-4" />
                        </a>
                      </Button>}
                    {contractor.youtube_url && <Button asChild variant="outline" size="icon">
                        <a href={contractor.youtube_url} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4" />
                        </a>
                      </Button>}
                  </div>
                </CardContent>
              </Card>}

            {/* Location & Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleMap address={contractor.address || contractor.city || ""} businessName={contractor.business_name} city={contractor.city} province={contractor.province} />
              </CardContent>
            </Card>

            <BusinessHours businessName={contractor.business_name} />

          </div>
        </div>

        {/* Suggested Contractors - Full Width Section */}
        {suggestedContractors.length > 0 && <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Similar Contractors You Might Like
                </CardTitle>
                <CardDescription>
                  Other trusted contractors offering related services in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {suggestedContractors.map(suggestedContractor => <Card key={suggestedContractor.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/contractor/${suggestedContractor.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={suggestedContractor.logo_url || ''} />
                            <AvatarFallback className="text-sm">
                              {suggestedContractor.business_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {suggestedContractor.business_name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              {suggestedContractor.rating > 0 && <>
                                  {renderStars(suggestedContractor.rating)}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {suggestedContractor.rating.toFixed(1)} ({suggestedContractor.review_count})
                                  </span>
                                </>}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {suggestedContractor.city}, {suggestedContractor.province}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {suggestedContractor.contractor_services.slice(0, 2).map((cs, index) => <Badge key={index} variant="outline" className="text-xs">
                                  {cs.services.name}
                                </Badge>)}
                              {suggestedContractor.contractor_services.length > 2 && <Badge variant="outline" className="text-xs">
                                  +{suggestedContractor.contractor_services.length - 2}
                                </Badge>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/search')}>
                  Browse All Contractors
                </Button>
              </CardContent>
            </Card>
          </div>}

        {/* Image Modal */}
        {selectedImage && <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Gallery Image</DialogTitle>
                <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={() => setSelectedImage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <div className="flex justify-center">
                <img src={selectedImage} alt="Gallery image" className="max-w-full max-h-[70vh] object-contain rounded-md" />
              </div>
            </DialogContent>
          </Dialog>}

      </div>

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
              <Shield className="h-5 w-5" />
              <span className="text-sm">Verified & Insured Contractors</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Quick Response Times</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Thousands of Satisfied Customers</span>
            </div>
          </div>
          
          <Button size="lg" variant="secondary" className="group">
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You need to be signed in as a homeowner to write reviews for contractors.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In / Sign Up as Homeowner
              </Button>
              <Button variant="outline" onClick={() => setShowAuthDialog(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>;
};
export default ContractorProfile;