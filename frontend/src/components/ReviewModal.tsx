
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { useCreateReview } from '../api/reviews';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  providerId: string;
  providerName: string;
}

export default function ReviewModal({ isOpen, onClose, bookingId, providerId, providerName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const createReviewMutation = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        bookingId,
        providerId,
        rating,
        comment
      });
      toast.success('Review submitted successfully');
      onClose();
    } catch (error: any) {
      if (error?.response?.data?.error === 'Review already exists') {
          toast.error('You have already reviewed this booking');
      } else {
          toast.error('Failed to submit review');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {providerName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-600">
            {rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' :
             rating === 5 ? 'Excellent' : 'Select a rating'}
          </p>

          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-gray-700">Share your experience (optional)</label>
            <Textarea
              placeholder="Tell us about the service provided..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createReviewMutation.isPending || rating === 0}>
            {createReviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
