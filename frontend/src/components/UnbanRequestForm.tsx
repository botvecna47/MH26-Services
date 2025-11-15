import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCreateAppeal } from '../api/appeals';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface UnbanRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  providerStatus?: string;
}

export default function UnbanRequestForm({ isOpen, onClose, providerStatus }: UnbanRequestFormProps) {
  const createAppealMutation = useCreateAppeal();
  const [formData, setFormData] = useState({
    type: 'UNBAN_REQUEST' as 'UNBAN_REQUEST' | 'REJECTION_APPEAL' | 'SUSPENSION_APPEAL' | 'OTHER',
    reason: '',
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for your appeal');
      return;
    }

    try {
      await createAppealMutation.mutateAsync(formData);
      toast.success('Appeal submitted successfully. We will review it soon.');
      setFormData({ type: 'UNBAN_REQUEST', reason: '', details: '' });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit appeal');
    }
  };

  // Determine appeal type based on provider status
  const getAppealType = () => {
    if (providerStatus === 'SUSPENDED') return 'SUSPENSION_APPEAL';
    if (providerStatus === 'REJECTED') return 'REJECTION_APPEAL';
    return 'UNBAN_REQUEST';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Unban / Appeal</DialogTitle>
          <DialogDescription>
            Submit an appeal to request unbanning or review of your provider account status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Appeal Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNBAN_REQUEST">Unban Request</SelectItem>
                <SelectItem value="SUSPENSION_APPEAL">Suspension Appeal</SelectItem>
                <SelectItem value="REJECTION_APPEAL">Rejection Appeal</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              placeholder="Brief reason for your appeal"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              placeholder="Provide any additional information that might help us review your appeal..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAppealMutation.isPending || !formData.reason.trim()}
            >
              {createAppealMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Appeal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

