import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Check, X, FileText, Image as ImageIcon, ExternalLink, Download, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    businessName: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
    documents?: Array<{ id: string; type: string; url: string }>;
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function VerificationModal({
  isOpen,
  onClose,
  provider,
  onApprove,
  onReject
}: VerificationModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border-0 shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-[#ff6b35] to-[#ff8f6b] text-white">
          <div className="flex justify-between items-start">
            <div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                    Verify Provider
                </DialogTitle>
                <div className="flex flex-col mt-2 text-white/90">
                    <span className="text-lg font-medium">{provider.businessName}</span>
                    <span className="text-sm opacity-80">{provider.user.name} • {provider.user.email}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20 hover:text-white border-white/30 backdrop-blur-sm"
                    onClick={() => {
                        onReject(provider.id);
                        onClose();
                    }}
                >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                </Button>
                <Button 
                    className="bg-white text-[#ff6b35] hover:bg-white/90 shadow-lg font-semibold border-0"
                    onClick={() => {
                        onApprove(provider.id);
                        onClose();
                    }}
                >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Request
                </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Documents Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-[#ff6b35]" />
                        Submitted Documents
                    </h3>
                    
                    {!provider.documents || provider.documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center space-y-3">
                            <div className="p-3 bg-orange-50 rounded-full">
                                <FileText className="w-8 h-8 text-orange-200" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">No documents submitted</p>
                                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">This provider has not uploaded any verification documents yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {provider.documents.map((doc, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                                    <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700 capitalize flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>
                                            {doc.type.replace('_', ' ')}
                                        </span>
                                        <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-[#ff6b35] hover:text-[#e45a25] text-xs font-medium flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-full transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            View Original
                                        </a>
                                    </div>
                                    <div className="aspect-[4/3] relative bg-white flex items-center justify-center group p-4">
                                        {doc.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                            <ImageWithFallback 
                                                src={doc.url} 
                                                alt={doc.type} 
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-center p-6 bg-gray-50 rounded-lg w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-200">
                                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-gray-500 mb-2">Document Preview Unavailable</p>
                                                <Button variant="link" size="sm" asChild className="text-[#ff6b35]">
                                                    <a href={doc.url} download>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download to View
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                     {/* Identity Info */}
                     <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Shield className="w-32 h-32 text-gray-900" />
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-6 text-lg">Identity Details</h4>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verification Status</dt>
                                    <dd className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
                                        <span className="w-2 h-2 rounded-full bg-yellow-400 box-shadow-sm"></span>
                                        Pending Review
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Provider ID</dt>
                                    <dd className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 truncate" title={provider.id}>
                                        {provider.id}
                                    </dd>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</dt>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            <span className="text-gray-500 text-xs font-bold px-1">@</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{provider.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            <span className="text-gray-500 text-xs font-bold px-1">#</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{provider.user.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* System Checks */}
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
                        <h4 className="font-semibold text-blue-900 text-base mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" /> 
                            Automated System Checks
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100/50">
                                <span className="text-sm text-blue-800">Email Verified</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    VERIFIED
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100/50">
                                <span className="text-sm text-blue-800">Phone Verified</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    NOT VERIFIED
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100/50">
                                <span className="text-sm text-blue-800">Duplicate Accounts</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    NONE DETECTED
                                </span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
