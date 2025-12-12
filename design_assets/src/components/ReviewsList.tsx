import { Star, ThumbsUp, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner@2.0.3';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: Date;
  flagged: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  providerId: string;
}

export default function ReviewsList({ reviews, providerId }: ReviewsListProps) {
  const { isAuthenticated } = useUser();
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please write a review');
      return;
    }

    // In real app: POST /api/reviews
    toast.success('Review submitted successfully');
    setShowAddReview(false);
    setNewComment('');
    setNewRating(5);
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
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
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
      {/* Add Review */}
      {isAuthenticated && !showAddReview && (
        <Button
          onClick={() => setShowAddReview(true)}
          variant="outline"
          className="mb-4"
        >
          Write a Review
        </Button>
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
                    <span className="font-medium text-gray-900">{review.userName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-700 mb-2">{review.comment}</p>
              {review.photos.length > 0 && (
                <div className="flex gap-2">
                  {review.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 bg-gray-100 rounded overflow-hidden"
                    >
                      <img
                        src={photo}
                        alt={`Review ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
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
