
import { useState } from 'react';
import { useAppeals, useReviewAppeal } from '../api/appeals';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Loader2, Check, X, User, Building2, Eye, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import AppealDetailModal from './AppealDetailModal';

export default function AppealsTable() {
  const { data: appealsData, isLoading, refetch } = useAppeals({ status: 'all' });
  const resolveAppealMutation = useReviewAppeal();
  const queryClient = useQueryClient();
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewAppeal = (appeal: any) => {
    setSelectedAppeal(appeal);
    setIsModalOpen(true);
  };

  const handleResolveAppeal = async (appealId: string, status: 'APPROVED' | 'REJECTED', appealType: string) => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    const typeLabel = appealType === 'UNBAN_REQUEST' ? 'unban the user' : 
                      appealType === 'SUSPENSION_APPEAL' ? 'unsuspend the provider' : 
                      'process this appeal';
    
    if (!confirm(`Are you sure you want to ${action} this appeal? ${status === 'APPROVED' ? `This will ${typeLabel}.` : ''}`)) {
      return;
    }

    try {
      await resolveAppealMutation.mutateAsync({ 
        id: appealId, 
        status,
        adminNotes: status === 'APPROVED' ? 'Appeal approved by admin' : 'Appeal rejected by admin'
      });
      
      // Invalidate related queries for UI refresh
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      
      toast.success(`Appeal ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
      refetch();
    } catch (e) {
      console.error('Appeal resolution error:', e);
      toast.error('Failed to process appeal');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-400"/></div>;
  }

  const appeals = appealsData?.data || [];

  if (appeals.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No appeals found.</p>
      </div>
    );
  }

  const getAppealTypeIcon = (type: string) => {
    return type === 'SUSPENSION_APPEAL' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getAppealTypeLabel = (type: string) => {
    switch (type) {
      case 'UNBAN_REQUEST': return 'User Unban';
      case 'SUSPENSION_APPEAL': return 'Provider Unsuspend';
      case 'REJECTION_APPEAL': return 'Rejection Appeal';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {appeals.map((appeal: any) => (
          <div key={appeal.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {(appeal.user?.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{appeal.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{appeal.user?.email}</p>
                </div>
              </div>
              {getStatusBadge(appeal.status)}
            </div>
            
            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                {getAppealTypeIcon(appeal.type)}
                <span>{getAppealTypeLabel(appeal.type)}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{appeal.reason}</p>
              {appeal.details && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{appeal.details}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(appeal.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-3"
                  onClick={() => handleViewAppeal(appeal)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {appeal.status === 'PENDING' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 h-8 px-2"
                      onClick={() => handleResolveAppeal(appeal.id, 'REJECTED', appeal.type)}
                      disabled={resolveAppealMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                      onClick={() => handleResolveAppeal(appeal.id, 'APPROVED', appeal.type)}
                      disabled={resolveAppealMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appeals.map((appeal: any) => (
              <tr key={appeal.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {(appeal.user?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-900">{appeal.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{appeal.user?.email}</p>
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {getAppealTypeIcon(appeal.type)}
                    <span>{getAppealTypeLabel(appeal.type)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs" title={appeal.details}>
                  <span className="font-semibold block">{appeal.reason}</span>
                  <span className="text-xs text-gray-500 line-clamp-1">{appeal.details}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(appeal.status)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(appeal.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleViewAppeal(appeal)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {appeal.status === 'PENDING' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleResolveAppeal(appeal.id, 'REJECTED', appeal.type)}
                          disabled={resolveAppealMutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleResolveAppeal(appeal.id, 'APPROVED', appeal.type)}
                          disabled={resolveAppealMutation.isPending}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Appeal Detail Modal */}
      <AppealDetailModal
        appeal={selectedAppeal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppeal(null);
        }}
        onResolved={() => refetch()}
      />
    </>
  );
}
