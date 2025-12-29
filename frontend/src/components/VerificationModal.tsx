import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { 
  Check, X, FileText, Image as ImageIcon, ExternalLink, Download, 
  Shield, AlertTriangle, Link as LinkIcon, Instagram, Facebook, Globe,
  Briefcase, MoreHorizontal, User as UserIcon, Mail, Phone
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Textarea } from './ui/textarea';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    businessName: string;
    primaryCategory?: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
    documents?: Array<{ id: string; type: string; url: string }>;
    gallery?: string[];
    aadharPanUrl?: string;
    portfolioUrls?: string[];
    socialMediaLinks?: {
      instagram?: string;
      facebook?: string;
      website?: string;
    };
  };
  onApprove: (id: string, category?: string) => void;
  onReject: (id: string, reason: string) => void;
  isCustomCategory?: boolean; // Whether the provider's category is not in the system
}

export default function VerificationModal({
  isOpen,
  onClose,
  provider,
  onApprove,
  onReject,
  isCustomCategory = false
}: VerificationModalProps) {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen) return null;

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onReject(provider.id, rejectReason);
    setShowRejectReason(false);
    setRejectReason('');
    onClose();
  };

  const hasIdProof = !!(provider.aadharPanUrl || provider.documents?.some(d => d.type === 'IDENTITY_PROOF' || d.type === 'AADHAR_PAN'));

  const hasAnyLinks = !!(
    provider.aadharPanUrl || 
    (provider.portfolioUrls && provider.portfolioUrls.length > 0) ||
    (provider.socialMediaLinks?.instagram || provider.socialMediaLinks?.facebook || provider.socialMediaLinks?.website)
  );

  const totalDocsCount = (provider.documents?.length || 0) + (provider.gallery?.length || 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setShowRejectReason(false);
            setRejectReason('');
        }
        onClose();
    }}>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-full max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
        {/* Top Navigation / Header */}
        <DialogHeader className="px-8 py-5 border-b bg-white flex-row justify-between items-center space-y-0 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900 leading-none mb-1">
                Verify Service Provider
              </DialogTitle>
              <DialogDescription className="sr-only">
                Review and verify service provider application, documents, and business details.
              </DialogDescription>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400 capitalize">{provider.businessName}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">Manual Review Required</span>
              </div>
            </div>
          </div>

          {!showRejectReason && (
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 h-11 px-6 rounded-xl font-bold transition-all"
                onClick={() => setShowRejectReason(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Decline Application
              </Button>
              {isCustomCategory ? (
                <Button 
                  variant="outline"
                  className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 h-11 px-6 rounded-xl font-bold transition-all"
                  onClick={onClose}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Close & Decide from Card
                </Button>
              ) : (
                <div className="relative group">
                  {!hasIdProof && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                      IDENTITY PROOF MISSING
                    </div>
                  )}
                  <Button 
                    className={`${!hasIdProof ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} text-white h-11 px-10 rounded-xl font-black shadow-lg transition-all hover:-translate-y-0.5`}
                    disabled={!hasIdProof}
                    onClick={() => {
                        if (hasIdProof) {
                            onApprove(provider.id);
                            onClose();
                        }
                    }}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Approve & Activate
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-x divide-gray-100">
          {showRejectReason ? (
            <div className="flex-1 overflow-y-auto bg-gray-50/50 flex items-center justify-center p-8">
              <div className="max-w-xl w-full bg-white rounded-3xl p-10 border border-red-100 shadow-xl">
                <div className="flex items-center gap-4 text-red-600 mb-8 font-black text-2xl uppercase tracking-tight">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  Rejection Basis
                </div>
                <p className="text-gray-500 mb-6 font-medium">Please specify why the application couldn't be approved. This helps the provider resubmit with correct information.</p>
                <Textarea 
                  placeholder="e.g. Identity documents are blurry, please re-upload clear copies." 
                  className="min-h-[180px] mb-8 p-6 rounded-2xl border-gray-100 bg-gray-50 focus:ring-orange-500 focus:border-orange-500 text-lg shadow-inner"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end gap-4">
                  <Button variant="ghost" className="h-12 px-6 rounded-xl font-bold" onClick={() => setShowRejectReason(false)}>Back to Review</Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white font-black h-12 px-10 rounded-xl shadow-lg shadow-red-100"
                    disabled={!rejectReason.trim()}
                    onClick={handleConfirmReject}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Left Column: Extensive Profile Data */}
              <div className="w-full lg:w-[45%] overflow-y-auto p-10 space-y-12 bg-gray-50/20">
                {/* Identity & Basic Stats */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                      <UserIcon className="w-4 h-4" />
                      Applicant Identity
                    </h3>
                    <span className="text-[10px] font-mono text-gray-300 bg-white border border-gray-100 px-3 py-1 rounded-lg">ID: {provider.id}</span>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Legal Representative</p>
                      <p className="text-xl font-black text-gray-900">{provider.user.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Email Address</p>
                          <p className="text-sm font-bold text-gray-700 truncate">{provider.user.email}</p>
                        </div>
                      </div>
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Phone Number</p>
                          <p className="text-sm font-bold text-gray-700">{provider.user.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Digital Presence & Proofs */}
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <LinkIcon className="w-4 h-4" />
                    Portfolio & Social Authority
                  </h3>
                  
                  {!hasAnyLinks ? (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <LinkIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 font-bold">No external social or portfolio links provided</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* High Priority: Identity Proof */}
                      {provider.aadharPanUrl ? (
                        <a href={provider.aadharPanUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-white border-2 border-green-200 rounded-2xl hover:border-green-400 hover:shadow-lg transition-all group shadow-sm bg-green-50/10">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
                              <Shield className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="block text-[10px] font-black uppercase text-green-500 tracking-widest leading-none mb-1">Identity Verified</span>
                              <span className="text-base font-black text-gray-900">Aadhar / PAN Card Proof</span>
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-green-500" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-between p-6 bg-red-50 border-2 border-red-100 border-dashed rounded-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                               <AlertTriangle className="w-12 h-12 text-red-600" />
                           </div>
                           <div className="flex items-center gap-5">
                            <div className="w-12 h-12 flex items-center justify-center bg-white text-red-600 rounded-xl shadow-sm">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="block text-[10px] font-black uppercase text-red-500 tracking-widest leading-none mb-1">Critical Missing</span>
                              <span className="text-base font-black text-gray-900">Identity Document (Mandatory)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Social Badges */}
                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Social Accounts</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.socialMediaLinks?.instagram ? (
                              <a href={provider.socialMediaLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-xl text-xs font-black hover:bg-pink-100 transition-colors">
                                <Instagram className="w-4 h-4" /> Instagram
                              </a>
                            ) : null}
                            {provider.socialMediaLinks?.facebook ? (
                              <a href={provider.socialMediaLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors">
                                <Facebook className="w-4 h-4" /> Facebook
                              </a>
                            ) : null}
                            {provider.socialMediaLinks?.website ? (
                              <a href={provider.socialMediaLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors">
                                <Globe className="w-4 h-4" /> Website
                              </a>
                            ) : null}
                            {!provider.socialMediaLinks?.instagram && !provider.socialMediaLinks?.facebook && !provider.socialMediaLinks?.website && (
                              <p className="text-xs text-gray-400 italic font-medium">No accounts linked</p>
                            )}
                          </div>
                        </div>

                        {/* Portfolio Links */}
                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">External Portfolios</p>
                          {provider.portfolioUrls && provider.portfolioUrls.length > 0 ? (
                            <div className="space-y-2">
                              {provider.portfolioUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors group">
                                  <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{url}</span>
                                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-orange-500" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic font-medium">No links provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Platform Verification Status */}
                <section className="p-10 bg-white rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12 translate-x-8 -translate-y-8">
                    <Shield className="w-48 h-48 text-slate-900" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col gap-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Platform Verification Status</h4>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">
                        {provider.businessName}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Email Verified</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <X className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone Verified</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Identity Check</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <X className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">API Fraud Scan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: High Performance Document Viewer */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    Uploaded Evidence ({totalDocsCount})
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-full uppercase">Review Primary Files First</span>
                  </div>
                </div>

                {totalDocsCount === 0 ? (
                  <div className="flex flex-col items-center justify-center p-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                    <ImageIcon className="w-16 h-16 text-gray-200 mb-6" />
                    <h4 className="text-xl font-black text-gray-900 leading-none mb-2">Evidence Missing</h4>
                    <p className="text-gray-400 font-medium">This provider has not submitted any visual verification files.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Official Documents Cluster */}
                    {provider.documents?.map((doc, idx) => (
                      <div key={`doc-${idx}`} className="group bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:border-orange-200 hover:shadow-xl transition-all flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                          <div>
                            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Official Document</span>
                            <span className="text-xs font-black text-gray-700 uppercase">
                              {doc.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-white text-orange-600 border border-gray-200 rounded-lg shadow-sm hover:bg-orange-600 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="flex-1 aspect-video relative bg-white flex items-center justify-center p-3 text-center">
                          {doc.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                            <ImageWithFallback 
                              src={doc.url} 
                              alt={doc.type} 
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 group-hover:bg-slate-50 transition-colors">
                              <FileText className="w-12 h-12 text-slate-200 mb-4" />
                              <p className="text-sm font-black text-slate-800 uppercase mb-4 tracking-tighter">Document Link Provided</p>
                              <Button asChild className="bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-200 shadow-sm rounded-xl font-black px-6">
                                <a href={doc.url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  VIEW DOCUMENT
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Registration Assets / Gallery Proofs */}
                    {provider.gallery?.map((url, idx) => {
                      // Map index to proper name from onboarding form
                      let proofName = "Registration Proof";
                      if (idx === 0) proofName = "Business Card Image";
                      else if (idx === 1) proofName = "Work Sample Image";
                      else if (idx === 2) proofName = "Professional Certificate";

                      return (
                        <div key={`gallery-${idx}`} className="group bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all flex flex-col">
                          <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/10 flex items-center justify-between">
                            <div>
                              <span className="block text-[8px] font-black text-orange-400 uppercase tracking-[0.2em] leading-none mb-1">Onboarding Asset</span>
                              <span className="text-xs font-black text-gray-700 uppercase">{proofName}</span>
                            </div>
                            <a href={url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-white text-orange-600 border border-orange-100 rounded-lg shadow-sm hover:bg-orange-600 hover:text-white transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <div className="flex-1 aspect-video relative bg-white flex items-center justify-center p-3 text-center">
                            {url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <ImageWithFallback 
                                  src={url} 
                                  alt={proofName} 
                                  className="w-full h-full object-contain rounded-xl"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-orange-50/20 rounded-2xl border border-dashed border-orange-100 group-hover:bg-orange-50 transition-colors">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                  <ImageIcon className="w-7 h-7 text-orange-600" />
                                </div>
                                <p className="text-sm font-black text-slate-800 uppercase mb-4 tracking-tighter">{proofName}</p>
                                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100 rounded-xl font-black px-8">
                                  <a href={url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    VERIFY DOCUMENT
                                  </a>
                                </Button>
                                {url.includes('drive.google.com') && (
                                  <p className="text-[10px] font-bold text-orange-400/80 mt-3 uppercase tracking-widest">Google Drive Asset</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
