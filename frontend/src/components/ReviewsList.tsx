import { Star, ThumbsUp, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Review as ApiReview, useCreateReview } from '../api/reviews';

interface ReviewsListProps {
  reviews: ApiReview[];
  providerId: string;
}

export default function ReviewsList({ reviews, providerId }: ReviewsListProps) {
  const { isAuthenticated } = useUser();
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  
  const createReviewMutation = useCreateReview();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
        await createReviewMutation.mutateAsync({
            providerId,
            rating: newRating,
            comment: newComment
        });
        toast.success('Review submitted successfully');
        setShowAddReview(false);
        setNewComment('');
        setNewRating(5);
    } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setNewRating(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer' : 'cursor-default focus:outline-none'}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Add Review - Highlighted Call-to-Action */}
      {isAuthenticated && !showAddReview && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl text-center">
          <p className="text-gray-700 mb-3 text-sm">Have you used this service? Share your experience!</p>
          <Button
            onClick={() => setShowAddReview(true)}
            className="bg-[#ff6b35] hover:bg-[#ff5722] text-white font-bold px-6 py-3 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse"
            size="lg"
          >
            <Star className="h-5 w-5 mr-2 fill-white" />
            Write a Review
          </Button>
        </div>
      )}

      {showAddReview && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-gray-900 mb-3">Write Your Review</h3>
          
          <div className="mb-3">
            <label className="text-sm text-gray-600 mb-2 block">Rating</label>
            {renderStars(newRating, true)}
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-600 mb-2 block">Your Review</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this provider..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#ff6b35] hover:bg-[#ff5722]">
              Submit Review
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddReview(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-700 mb-2">{review.comment}</p>
              
              <div className="flex gap-4 mt-2">
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="h-3 w-3" />
                  Helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
