
import { useAppeals, useUnbanUser, useBanUser } from '../api/admin';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AppealsTable() {
  const { data: appealsData, isLoading } = useAppeals({ status: 'all' });
  const unbanUserMutation = useUnbanUser();

  const handleApproveAppeal = async (userId: string, appealId: string) => {
    if (confirm('Approve this appeal and unban the user?')) {
        try {
            await unbanUserMutation.mutateAsync({ id: userId, reason: 'Appeal Approved' });
            toast.success('Appeal approved and user unbanned');
        } catch (e) {
            toast.error('Failed to process appeal');
        }
    }
  };

  if (isLoading) {
      return <div className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-400"/></div>;
  }

  const appeals = appealsData?.data || [];

  if (appeals.length === 0) {
      return <div className="p-8 text-center text-gray-500">No appeals found.</div>;
  }

  return (
    <div className="overflow-x-auto">
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
              <td className="px-6 py-4 text-sm text-gray-600">{appeal.type}</td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={appeal.details}>
                <span className="font-semibold block">{appeal.reason}</span>
                <span className="text-xs text-gray-500">{appeal.details}</span>
              </td>
              <td className="px-6 py-4">
                <Badge variant={
                  appeal.status === 'APPROVED' ? 'default' : 
                  appeal.status === 'PENDING' ? 'secondary' : 
                  appeal.status === 'REJECTED' ? 'destructive' : 'outline'
                }>
                  {appeal.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(appeal.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {appeal.status === 'PENDING' && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApproveAppeal(appeal.user?.id, appeal.id)}
                  >
                    Approve (Unban)
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
