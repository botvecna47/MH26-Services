import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAdminUser, useAuditLogs } from '../api/admin';
import { format } from 'date-fns';
import { User, Mail, Phone, Calendar, Shield, History, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const { data: user, isLoading: userLoading } = useAdminUser(userId);
  const { data: auditLogs, isLoading: logsLoading } = useAuditLogs({
    entityId: userId || '',
    entityType: 'User',
    limit: 20,
  });

  if (!userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] max-w-none max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {userLoading ? (
          <div className="py-8 text-center text-gray-500">Loading user details...</div>
        ) : user ? (
          <div className="space-y-8">
            {/* Header / Profile Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-0.5">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                 </Badge>
                 {user.isBanned ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Banned
                    </Badge>
                 ) : (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Active
                    </Badge>
                 )}
              </div>
            </div>

            {/* Provider Info (if applicable) */}
            {user.provider && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Provider Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-blue-700 block text-xs">Business Name</span>
                            <span className="font-medium">{user.provider.businessName}</span>
                        </div>
                        <div>
                            <span className="text-blue-700 block text-xs">Category</span>
                            <span className="font-medium">{user.provider.primaryCategory}</span>
                        </div>
                        <div>
                             <span className="text-blue-700 block text-xs">Status</span>
                             <span className="font-medium">{user.provider.status}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Log / History */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Account History
              </h4>
              
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {logsLoading ? (
                    <div className="p-8 text-center text-sm text-gray-500 animate-pulse">Loading history...</div>
                ) : auditLogs?.data?.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500 bg-gray-50">No history records found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {auditLogs?.data?.map((log: any) => {
                             const isBanAction = log.action === 'BAN_USER';
                             const isUnbanAction = log.action === 'UNBAN_USER';
                             const reason = log.newData?.reason;
                             
                             return (
                            <div key={log.id} className={`p-4 transition-colors ${isBanAction ? 'bg-red-50 hover:bg-red-100' : isUnbanAction ? 'bg-green-50 hover:bg-green-100' : 'bg-white hover:bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={isBanAction ? 'destructive' : isUnbanAction ? 'outline' : 'secondary'} 
                                               className={isUnbanAction ? 'text-green-700 border-green-200 bg-green-100' : ''}>
                                            {log.action.replace(/_/g, ' ')}
                                        </Badge>
                                        <span className="text-xs text-gray-400">
                                            by Admin {log.userId?.slice(0, 8)}...
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>
                                
                                {/* Primary Content - Reason/Remarks */}
                                {reason && (
                                    <div className="mb-2 pl-1">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Remark:</span>
                                        <p className="text-sm text-gray-800 mt-1 pl-2 border-l-2 border-gray-300 italic">
                                            "{reason}"
                                        </p>
                                    </div>
                                )}

                                {/* Other Data Details */}
                                {log.newData && (typeof log.newData === 'object') && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        {Object.entries(log.newData)
                                            .filter(([k]) => k !== 'reason') // Hide reason as it's shown above
                                            .map(([k, v]) => (
                                            <div key={k} className="inline-flex mr-4 gap-1 items-center">
                                                <span className="font-medium text-gray-600">{k}:</span>
                                                <span className="font-mono bg-gray-100 px-1 rounded">
                                                    {typeof v === 'string' ? v.replace(/"/g, '') : JSON.stringify(v)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )})}
                    </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500 text-center py-4">Failed to load user info</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
