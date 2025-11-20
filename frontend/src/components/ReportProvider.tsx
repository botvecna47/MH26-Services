import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { AlertTriangle, Flag, CheckCircle2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../context/UserContext';
import { motion } from 'motion/react';

interface ReportProviderProps {
  providerId: string;
  providerName: string;
  trigger?: React.ReactNode;
}

const REPORT_REASONS = [
  { id: 'fraud', label: 'Fraud / Scam', description: 'Provider took payment but didn\'t deliver service' },
  { id: 'poor_service', label: 'Poor Service Quality', description: 'Service was not up to expected standards' },
  { id: 'unprofessional', label: 'Unprofessional Behavior', description: 'Provider was rude or inappropriate' },
  { id: 'incorrect_pricing', label: 'Incorrect Pricing', description: 'Charged more than quoted price' },
  { id: 'no_show', label: 'No Show', description: 'Provider didn\'t show up for appointment' },
  { id: 'fake_profile', label: 'Fake Profile / Information', description: 'Profile contains false information' },
  { id: 'safety', label: 'Safety Concerns', description: 'Felt unsafe during service' },
  { id: 'other', label: 'Other', description: 'Issue not listed above' },
];

export default function ReportProvider({ providerId, providerName, trigger }: ReportProviderProps) {
  const { isAuthenticated } = useUser();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!details.trim()) {
      toast.error('Please provide details about the issue');
      return;
    }

    setIsSubmitting(true);

    // Upload files to server, then submit report
    await new Promise(resolve => setTimeout(resolve, 1500));

    // TODO: Replace with actual API call
    // await reportProvider(providerId, { reason: selectedReason, details, attachments });

    setIsSubmitting(false);
    setSubmitted(true);

    // Show success message after 2 seconds
    setTimeout(() => {
      toast.success('Report submitted successfully', {
        description: 'Our team will review your report within 24 hours',
      });
      setOpen(false);
      
      // Reset form after closing
      setTimeout(() => {
        setSubmitted(false);
        setSelectedReason('');
        setDetails('');
        setAttachments([]);
      }, 300);
    }, 2000);
  };

  if (!isAuthenticated) {
    return null; // Only show for authenticated users
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Flag className="w-4 h-4 mr-2" />
          Report Provider
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {!submitted ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Report Provider
                </DialogTitle>
                <DialogDescription>
                  Report an issue with <strong>{providerName}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Reason Selection */}
                <div className="space-y-3">
                  <Label>What's the issue? *</Label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => setSelectedReason(reason.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedReason === reason.id
                            ? 'border-[#ff6b35] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              selectedReason === reason.id
                                ? 'border-[#ff6b35] bg-[#ff6b35]'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedReason === reason.id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{reason.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{reason.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Please provide details *
                  </Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe what happened. Include dates, amounts, and any relevant information..."
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    {details.length} / 500 characters
                  </p>
                </div>

                {/* File Attachments */}
                <div className="space-y-2">
                  <Label>Attachments (optional)</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload screenshots, receipts, or other evidence (max 3 files)
                  </p>

                  {attachments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {attachments.length < 3 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="attachment-upload"
                      />
                      <label
                        htmlFor="attachment-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload files</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Images or PDFs (max 5MB each)
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Important:</strong> False reports may result in account suspension. 
                    Our team investigates all reports thoroughly. You'll receive an update within 24-48 hours.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedReason || !details.trim()}
                  className="flex-1 bg-[#ff6b35] hover:bg-[#ff5722]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            // Success Screen
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Report Submitted
                </DialogTitle>
                <DialogDescription>
                  Thank you for helping us maintain quality standards. Our admin team will review your report.
                </DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next?</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Our team will investigate within 24 hours</li>
                      <li>You'll receive an email update</li>
                      <li>If needed, we may contact you for more information</li>
                      <li>Appropriate action will be taken based on findings</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
