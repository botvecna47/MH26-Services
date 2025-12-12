// Payment gateway component with multiple payment methods and security
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Smartphone,
  Banknote,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Clock,
  DollarSign,
  Zap,
  QrCode,
  Building,
  Wallet
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  processingTime: string;
  fees: string;
  popular?: boolean;
  secure?: boolean;
}

interface PaymentDetails {
  amount: number;
  currency: string;
  bookingId: string;
  serviceTitle: string;
  providerName: string;
  description: string;
  taxes?: number;
  fees?: number;
  discount?: number;
}

interface PaymentGatewayProps {
  paymentDetails: PaymentDetails;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: string) => void;
  onCancel: () => void;
  className?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    icon: QrCode,
    description: 'Pay using any UPI app like GPay, PhonePe, Paytm',
    processingTime: 'Instant',
    fees: 'Free',
    popular: true,
    secure: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, RuPay, American Express',
    processingTime: 'Instant',
    fees: '2% + GST',
    secure: true,
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Building,
    description: 'All major banks supported',
    processingTime: 'Instant',
    fees: 'Free',
    secure: true,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'Paytm, Mobikwik, Amazon Pay, etc.',
    processingTime: 'Instant',
    fees: 'Free',
    secure: true,
  },
  {
    id: 'cash',
    name: 'Cash on Service',
    icon: Banknote,
    description: 'Pay when service is completed',
    processingTime: 'On completion',
    fees: 'Free',
  },
];

const popularBanks = [
  'SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'BOB', 'Kotak', 'IndusInd'
];

const upiApps = [
  { id: 'gpay', name: 'Google Pay', logo: '🔵' },
  { id: 'phonepe', name: 'PhonePe', logo: '🟣' },
  { id: 'paytm', name: 'Paytm', logo: '🔵' },
  { id: 'bhim', name: 'BHIM', logo: '🟢' },
];

export function PaymentGateway({
  paymentDetails,
  onPaymentSuccess,
  onPaymentFailure,
  onCancel,
  className = '',
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success' | 'failure'>('method');
  const [paymentData, setPaymentData] = useState<any>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [saveCard, setSaveCard] = useState(false);

  // Timer for payment timeout
  useEffect(() => {
    if (paymentStep === 'details' || paymentStep === 'processing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            toast.error('Payment session expired. Please try again.');
            onCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStep, onCancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotal = () => {
    const { amount, taxes = 0, fees = 0, discount = 0 } = paymentDetails;
    return amount + taxes + fees - discount;
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId === 'cash') {
      // Cash on service doesn't need payment processing
      handleCashPayment();
    } else {
      setPaymentStep('details');
    }
  };

  const handleCashPayment = () => {
    onPaymentSuccess({
      paymentId: `cash_${Date.now()}`,
      method: 'cash',
      amount: calculateTotal(),
      status: 'pending',
      timestamp: new Date().toISOString(),
    });
  };

  const processPayment = async () => {
    setProcessing(true);
    setPaymentStep('processing');
    setProgress(0);

    // Simulate payment processing
    const steps = [
      { message: 'Validating payment details...', progress: 20 },
      { message: 'Connecting to payment gateway...', progress: 40 },
      { message: 'Processing payment...', progress: 60 },
      { message: 'Verifying transaction...', progress: 80 },
      { message: 'Payment completed!', progress: 100 },
    ];

    try {
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(step.progress);
      }

      // Simulate success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        setPaymentStep('success');
        const paymentResult = {
          paymentId: `pay_${Date.now()}`,
          method: selectedMethod,
          amount: calculateTotal(),
          status: 'completed',
          timestamp: new Date().toISOString(),
          transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
          ...paymentData,
        };
        
        setTimeout(() => {
          onPaymentSuccess(paymentResult);
        }, 2000);
      } else {
        setPaymentStep('failure');
        setTimeout(() => {
          onPaymentFailure('Payment failed due to insufficient funds or network error');
        }, 2000);
      }
    } catch (error) {
      setPaymentStep('failure');
      onPaymentFailure('An unexpected error occurred during payment');
    } finally {
      setProcessing(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Choose Payment Method</h3>
        <p className="text-muted-foreground mt-1">
          Select your preferred payment option
        </p>
      </div>

      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                selectedMethod === method.id
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedMethod === method.id ? 'bg-primary text-white' : 'bg-muted'
                    }`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{method.name}</h4>
                        {method.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                        {method.secure && (
                          <Shield className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{method.processingTime}</p>
                    <p className="text-xs text-muted-foreground">{method.fees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPaymentDetails = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setPaymentStep('method')}
            className="p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to methods
          </Button>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-primary text-white`}>
            <method.icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold">{method.name}</h3>
          <p className="text-muted-foreground">{method.description}</p>
        </div>

        {selectedMethod === 'upi' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="yourname@upi"
                value={paymentData.upiId || ''}
                onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Or choose UPI app</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {upiApps.map((app) => (
                  <Button
                    key={app.id}
                    variant="outline"
                    onClick={() => setPaymentData({ ...paymentData, upiApp: app.id })}
                    className={`justify-start ${paymentData.upiApp === app.id ? 'border-primary' : ''}`}
                  >
                    <span className="mr-2">{app.logo}</span>
                    {app.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber || ''}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={paymentData.expiry || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={paymentData.cvv || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="Name as on card"
                value={paymentData.cardName || ''}
                onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-card"
                checked={saveCard}
                onCheckedChange={setSaveCard}
              />
              <Label htmlFor="save-card" className="text-sm">
                Save card for future payments
              </Label>
            </div>
          </div>
        )}

        {selectedMethod === 'netbanking' && (
          <div className="space-y-4">
            <div>
              <Label>Select your bank</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {popularBanks.map((bank) => (
                  <Button
                    key={bank}
                    variant="outline"
                    onClick={() => setPaymentData({ ...paymentData, bank })}
                    className={`justify-start ${paymentData.bank === bank ? 'border-primary' : ''}`}
                  >
                    {bank}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'wallet' && (
          <div className="space-y-4">
            <div>
              <Label>Select wallet</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {['Paytm', 'Mobikwik', 'Amazon Pay', 'Freecharge'].map((wallet) => (
                  <Button
                    key={wallet}
                    variant="outline"
                    onClick={() => setPaymentData({ ...paymentData, wallet })}
                    className={`justify-start ${paymentData.wallet === wallet ? 'border-primary' : ''}`}
                  >
                    {wallet}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={processPayment}
          disabled={processing}
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/80"
        >
          <Lock className="w-4 h-4 mr-2" />
          Pay ₹{calculateTotal()}
        </Button>

        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
      </div>
    );
  };

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center"
      >
        <Zap className="w-8 h-8 text-white" />
      </motion.div>
      
      <div>
        <h3 className="text-xl font-semibold">Processing Payment</h3>
        <p className="text-muted-foreground">Please don't close this window</p>
      </div>
      
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">{progress}% complete</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-8 h-8 text-white" />
      </motion.div>
      
      <div>
        <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
        <p className="text-muted-foreground">Your booking has been confirmed</p>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Transaction ID: txn_{Math.random().toString(36).substr(2, 9)}
      </div>
    </div>
  );

  const renderFailure = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center"
      >
        <AlertCircle className="w-8 h-8 text-white" />
      </motion.div>
      
      <div>
        <h3 className="text-xl font-semibold text-red-600">Payment Failed</h3>
        <p className="text-muted-foreground">Please try again or use a different payment method</p>
      </div>
      
      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setPaymentStep('method')} className="flex-1">
          Try Again
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="text-center">
            <CardTitle className="text-lg">Payment</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {paymentDetails.serviceTitle}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Service Amount</span>
                <span>₹{paymentDetails.amount}</span>
              </div>
              {paymentDetails.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>₹{paymentDetails.taxes}</span>
                </div>
              )}
              {paymentDetails.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{paymentDetails.discount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={paymentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {paymentStep === 'method' && renderMethodSelection()}
              {paymentStep === 'details' && renderPaymentDetails()}
              {paymentStep === 'processing' && renderProcessing()}
              {paymentStep === 'success' && renderSuccess()}
              {paymentStep === 'failure' && renderFailure()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentGateway;