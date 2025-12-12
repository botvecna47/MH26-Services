import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useProviderDetails } from '../api/admin';
import { format } from 'date-fns';
import { 
    User, Mail, Phone, Calendar, Shield, History, MapPin, 
    Briefcase, Star, DollarSign, Image as ImageIcon, Map 
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface ProviderDetailModalProps {
  providerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProviderDetailModal({ providerId, isOpen, onClose }: ProviderDetailModalProps) {
  const { data: provider, isLoading } = useProviderDetails(providerId);

  if (!providerId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#ff6b35]" />
                Provider Details
            </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-gray-500">
            Loading provider details...
          </div>
        ) : provider ? (
          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-2 pb-0">
                <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 gap-6">
                    <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-[#ff6b35] data-[state=active]:text-[#ff6b35] rounded-none px-2 py-3">Overview</TabsTrigger>
                    <TabsTrigger value="services" className="border-b-2 border-transparent data-[state=active]:border-[#ff6b35] data-[state=active]:text-[#ff6b35] rounded-none px-2 py-3">Services</TabsTrigger>
                    <TabsTrigger value="gallery" className="border-b-2 border-transparent data-[state=active]:border-[#ff6b35] data-[state=active]:text-[#ff6b35] rounded-none px-2 py-3">Gallery</TabsTrigger>
                    <TabsTrigger value="history" className="border-b-2 border-transparent data-[state=active]:border-[#ff6b35] data-[state=active]:text-[#ff6b35] rounded-none px-2 py-3">History</TabsTrigger>
                </TabsList>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">
                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6 m-0">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="h-24 w-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                                {provider.user?.avatarUrl ? (
                                    <img src={provider.user.avatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-400">
                                        {provider.businessName.charAt(0)}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{provider.businessName}</h2>
                                        <p className="text-gray-500 flex items-center gap-1 text-sm mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {provider.address}, {provider.city} ({provider.pincode})
                                        </p>
                                    </div>
                                    <Badge variant={
                                        provider.status === 'APPROVED' ? 'default' :
                                        provider.status === 'SUSPENDED' ? 'destructive' : 'secondary'
                                    } className="text-sm px-3 py-1 capitalize">
                                        {provider.status.toLowerCase()}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Owner Name</p>
                                            <p className="font-medium text-sm">{provider.user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-sm">{provider.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-sm">{provider.user?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Joined</p>
                                            <p className="font-medium text-sm">
                                                {provider.createdAt ? format(new Date(provider.createdAt), 'MMM d, yyyy') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                <div className="flex justify-center mb-2"><Star className="h-5 w-5 text-blue-500" /></div>
                                <div className="text-2xl font-bold text-blue-700">{provider.averageRating?.toFixed(1) || '0.0'}</div>
                                <div className="text-xs text-blue-600 font-medium">Rating ({provider.totalRatings})</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                <div className="flex justify-center mb-2"><DollarSign className="h-5 w-5 text-green-500" /></div>
                                <div className="text-2xl font-bold text-green-700">₹{provider.totalRevenue}</div>
                                <div className="text-xs text-green-600 font-medium">Revenue</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                                <div className="flex justify-center mb-2"><Briefcase className="h-5 w-5 text-purple-500" /></div>
                                <div className="text-2xl font-bold text-purple-700">{provider._count?.bookings || 0}</div>
                                <div className="text-xs text-purple-600 font-medium">Bookings</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                                <div className="flex justify-center mb-2"><Map className="h-5 w-5 text-orange-500" /></div>
                                <div className="text-2xl font-bold text-orange-700">{provider.serviceRadius}km</div>
                                <div className="text-xs text-orange-600 font-medium">Radius</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">About Business</h3>
                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {provider.description || "No description provided."}
                            </p>
                        </div>
                    </TabsContent>

                    {/* SERVICES TAB */}
                    <TabsContent value="services" className="space-y-4 m-0">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="font-semibold text-gray-900">Offered Services ({provider.services?.length || 0})</h3>
                        </div>
                        {provider.services?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {provider.services.map((service: any) => (
                                    <div key={service.id} className="flex gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
                                        <div className="h-16 w-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                            {service.imageUrl ? (
                                                <img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Briefcase className="h-6 w-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900">{service.title}</h4>
                                                <span className="font-bold text-gray-900">₹{service.price}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                                                    {service.durationMin} mins
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No services listed.
                            </div>
                        )}
                    </TabsContent>

                    {/* GALLERY TAB */}
                    <TabsContent value="gallery" className="m-0">
                        <h3 className="font-semibold text-gray-900 mb-4">Portfolio Images</h3>
                        {provider.gallery?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {provider.gallery.map((url: string, index: number) => (
                                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                                        <img src={url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                No images in gallery.
                            </div>
                        )}
                    </TabsContent>

                    {/* HISTORY TAB */}
                    <TabsContent value="history" className="m-0">
                         <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Activity Log
                        </h3>
                        <div className="space-y-4">
                            {provider.history?.length > 0 ? (
                                <div className="border rounded-lg divide-y divide-gray-100 bg-white">
                                    {provider.history.map((log: any) => {
                                        const isSuspend = log.action === 'SUSPEND_PROVIDER';
                                        const isUnsuspend = log.action === 'UNSUSPEND_PROVIDER';
                                        const isReject = log.action === 'REJECT_PROVIDER';
                                        const reason = log.newData?.reason || log.newData?.adminNotes;

                                        return (
                                            <div key={log.id} className={`p-4 ${isSuspend || isReject ? 'bg-red-50' : 'bg-white'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                     <div className="flex items-center gap-2">
                                                        <Badge variant={isSuspend || isReject ? 'destructive' : 'outline'}
                                                               className={isUnsuspend ? 'text-green-700 border-green-200 bg-green-50' : ''}>
                                                            {log.action.replace('_PROVIDER', '')}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">
                                                            by {log.user?.name || 'Admin'}
                                                        </span>
                                                     </div>
                                                     <span className="text-xs text-gray-400">
                                                        {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                                                     </span>
                                                </div>
                                                {reason && (
                                                    <div className="mt-2 text-sm text-gray-700 pl-3 border-l-2 border-gray-300">
                                                        <span className="font-semibold text-gray-500 text-xs uppercase mr-1">Reason:</span>
                                                        "{reason}"
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                    No history recorded.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </ScrollArea>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center text-red-500">
            Failed to load provider details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
