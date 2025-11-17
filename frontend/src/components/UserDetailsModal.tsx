import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Calendar, Mail, Phone, Shield, User, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAdminUser } from '../api/admin';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const { data: fullUser, isLoading } = useAdminUser(user?.id || '');

  if (!user) return null;

  const displayUser = fullUser || user;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user account
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <ImageWithFallback
                src={displayUser.avatarUrl}
                alt={displayUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{displayUser.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{displayUser.email}</span>
                </div>
                {displayUser.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{displayUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={displayUser.role === 'ADMIN' ? 'default' : displayUser.role === 'PROVIDER' ? 'secondary' : 'outline'}>
                    <Shield className="h-3 w-3 mr-1" />
                    {displayUser.role}
                  </Badge>
                  {displayUser.emailVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Email Verified
                    </Badge>
                  )}
                  {displayUser.phoneVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Phone Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Account Status</p>
              <p className="font-medium text-gray-900">
                {displayUser.isBanned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                )}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-medium text-gray-900">
                {displayUser.createdAt ? format(new Date(displayUser.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Provider Info (if provider) */}
          {displayUser.provider && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Provider Information</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="font-medium text-gray-900">{displayUser.provider.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">
                    {displayUser.provider.primaryCategory}
                    {displayUser.provider.secondaryCategory && `, ${displayUser.provider.secondaryCategory}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">
                    {displayUser.provider.address}, {displayUser.provider.city}, {displayUser.provider.pincode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    variant={
                      displayUser.provider.status === 'APPROVED'
                        ? 'default'
                        : displayUser.provider.status === 'PENDING'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {displayUser.provider.status}
                  </Badge>
                </div>
                {displayUser.provider.averageRating > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-medium text-gray-900">
                      {displayUser.provider.averageRating.toFixed(1)} / 5.0 ({displayUser.provider.totalRatings} reviews)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {displayUser._count?.bookings || 0}
              </p>
              <p className="text-sm text-gray-600">Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {displayUser._count?.reviews || 0}
              </p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {displayUser._count?.reports || 0}
              </p>
              <p className="text-sm text-gray-600">Reports</p>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

