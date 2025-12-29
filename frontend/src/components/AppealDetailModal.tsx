import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  User, Building2, Calendar, Clock, FileText, 
  AlertTriangle, Check, X, MessageSquare, Loader2,
  Mail, Phone, MapPin, Briefcase
} from 'lucide-react';
import { useReviewAppeal } from '../api/appeals';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Appeal {
  id: string;
  type: 'UNBAN_REQUEST' | 'SUSPENSION_APPEAL' | 'REJECTION_APPEAL' | 'OTHER';
  reason: string;
  details?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isBanned?: boolean;
    banReason?: string;
    bannedAt?: string;
  };
  provider?: {
    id: string;
    businessName: string;
    status: string;
    primaryCategory?: string;
    city?: string;
    user?: {
      name: string;
      email: string;
    };
  };
  reviewer?: {
    id: string;
    name: string;
  };
  reviewedAt?: string;
}

interface AppealDetailModalProps {
  appeal: Appeal | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved?: () => void;
}

export default function AppealDetailModal({ appeal, isOpen, onClose, onResolved }: AppealDetailModalProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const resolveAppealMutation = useReviewAppeal();
  const queryClient = useQueryClient();

  if (!appeal) return null;

  const getAppealTypeInfo = (type: string) => {
    switch (type) {
      case 'UNBAN_REQUEST':
        return { label: 'User Unban Request', icon: User, color: 'text-red-600', bg: 'bg-red-50' };
      case 'SUSPENSION_APPEAL':
        return { label: 'Provider Suspension Appeal', icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'REJECTION_APPEAL':
        return { label: 'Rejection Appeal', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default:
        return { label: 'Other Appeal', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleResolve = async (status: 'APPROVED' | 'REJECTED') => {
    if (!adminNotes.trim() && status === 'REJECTED') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsResolving(true);
    try {
      await resolveAppealMutation.mutateAsync({
        id: appeal.id,
        status,
        adminNotes: adminNotes.trim() || (status === 'APPROVED' ? 'Appeal approved by admin' : 'Appeal rejected')
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });

      const actionLabel = appeal.type === 'UNBAN_REQUEST' ? 'unbanned' : 
                          appeal.type === 'SUSPENSION_APPEAL' ? 'unsuspended' : 
                          'processed';
      
      toast.success(
        status === 'APPROVED' 
          ? `Appeal approved! The user/provider has been ${actionLabel}.`
          : 'Appeal rejected.'
      );
      
      onResolved?.();
      onClose();
    } catch (error) {
      console.error('Appeal resolution error:', error);
      toast.error('Failed to process appeal');
    } finally {
      setIsResolving(false);
    }
  };

  const typeInfo = getAppealTypeInfo(appeal.type);
  const TypeIcon = typeInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            {typeInfo.label}
          </DialogTitle>
          <DialogDescription>
            Review the appeal details and decide whether to approve or reject.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current Status:</span>
            {getStatusBadge(appeal.status)}
          </div>

          {/* Appellant Information */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <User className="h-4 w-4" />
              Appellant Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{appeal.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{appeal.user?.email || 'N/A'}</span>
              </div>
              {appeal.user?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{appeal.user.phone}</span>
                </div>
              )}
            </div>

            {/* Show ban info for unban requests */}
            {appeal.type === 'UNBAN_REQUEST' && appeal.user?.banReason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800">Original Ban Reason:</p>
                <p className="text-sm text-red-700 mt-1">{appeal.user.banReason}</p>
                {appeal.user.bannedAt && (
                  <p className="text-xs text-red-500 mt-2">
                    Banned on: {new Date(appeal.user.bannedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Provider Information (for suspension appeals) */}
          {appeal.type === 'SUSPENSION_APPEAL' && appeal.provider && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Provider Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium">{appeal.provider.businessName}</span>
                </div>
                {appeal.provider.primaryCategory && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{appeal.provider.primaryCategory}</span>
                  </div>
                )}
                {appeal.provider.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{appeal.provider.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-orange-100 text-orange-800">{appeal.provider.status}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Appeal Content */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Appeal Content
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Reason:</p>
                <p className="font-medium text-gray-800">{appeal.reason}</p>
              </div>
              {appeal.details && (
                <div>
                  <p className="text-sm text-gray-600">Additional Details:</p>
                  <p className="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-blue-100">
                    {appeal.details}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Submitted: {new Date(appeal.createdAt).toLocaleString()}</span>
            </div>
            {appeal.reviewedAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Reviewed: {new Date(appeal.reviewedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Previous Admin Notes */}
          {appeal.adminNotes && (
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Previous Admin Notes:</p>
              <p className="text-sm text-gray-600">{appeal.adminNotes}</p>
              {appeal.reviewer && (
                <p className="text-xs text-gray-500 mt-2">— {appeal.reviewer.name}</p>
              )}
            </div>
          )}

          {/* Admin Response (only for pending appeals) */}
          {appeal.status === 'PENDING' && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold text-gray-800">Your Decision</h4>
              <Textarea
                placeholder="Add notes explaining your decision (required for rejection)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isResolving}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleResolve('REJECTED')}
                  disabled={isResolving}
                >
                  {isResolving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Reject Appeal
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleResolve('APPROVED')}
                  disabled={isResolving}
                >
                  {isResolving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Approve Appeal
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
