import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Star,
  Shield,
  Zap,
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Provider {
  id: number;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  description: string;
  features: string[];
  availability: string[];
  responseTime: string;
}

interface BookingFlowProps {
  provider: Provider;
  onClose: () => void;
  onBookingComplete: (bookingData: any) => void;
}

export function BookingFlow({ provider, onClose, onBookingComplete }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingData, setBookingData] = useState({
    serviceType: "",
    description: "",
    urgency: "normal",
    customerInfo: {
      name: "",
      phone: "",
      email: "",
      address: ""
    },
    paymentMethod: "cash",
    specialRequests: "",
    estimatedDuration: "1-2 hours",
    quantity: 1
  });

  const steps = [
    { id: 1, title: "Service Details", description: "Choose your service requirements" },
    { id: 2, title: "Schedule", description: "Pick your preferred date and time" },
    { id: 3, title: "Contact Info", description: "Provide your contact details" },
    { id: 4, title: "Payment", description: "Choose payment method" },
    { id: 5, title: "Confirmation", description: "Review and confirm your booking" }
  ];

  const serviceTypes = [
    "Emergency Repair",
    "Scheduled Maintenance", 
    "Installation",
    "Consultation",
    "Custom Service"
  ];

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  const urgencyLevels = [
    { value: "normal", label: "Normal", price: "₹0", time: "Within 2-4 hours" },
    { value: "urgent", label: "Urgent", price: "+₹100", time: "Within 1 hour" },
    { value: "emergency", label: "Emergency", price: "+₹200", time: "Within 30 minutes" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash on Service", icon: "💰" },
    { value: "card", label: "Credit/Debit Card", icon: "💳" },
    { value: "upi", label: "UPI Payment", icon: "📱" },
    { value: "wallet", label: "Digital Wallet", icon: "🏦" }
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!bookingData.serviceType) {
          toast.error("Please select a service type");
          return false;
        }
        return true;
      case 2:
        if (!selectedDate || !selectedTime) {
          toast.error("Please select date and time");
          return false;
        }
        return true;
      case 3:
        const { name, phone, email, address } = bookingData.customerInfo;
        if (!name || !phone || !email || !address) {
          toast.error("Please fill in all contact information");
          return false;
        }
        return true;
      case 4:
        if (!bookingData.paymentMethod) {
          toast.error("Please select a payment method");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const calculateTotal = () => {
    const basePrice = parseInt(provider.price.replace(/[^\d]/g, ''));
    const urgencyPrice = bookingData.urgency === 'urgent' ? 100 : 
                        bookingData.urgency === 'emergency' ? 200 : 0;
    const quantityPrice = basePrice * bookingData.quantity;
    return quantityPrice + urgencyPrice;
  };

  const handleBookingSubmit = async () => {
    const bookingDetails = {
      provider: provider,
      date: selectedDate,
      time: selectedTime,
      serviceDetails: bookingData,
      total: calculateTotal(),
      bookingId: `BK${Date.now()}`,
      status: "pending"
    };

    // Simulate API call
    toast.loading("Submitting your booking...");
    
    setTimeout(() => {
      toast.dismiss();
      toast.success("Booking submitted successfully!");
      onBookingComplete(bookingDetails);
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4">What service do you need?</h3>
              <div className="grid grid-cols-1 gap-3">
                {serviceTypes.map((service) => (
                  <motion.button
                    key={service}
                    onClick={() => setBookingData(prev => ({ ...prev, serviceType: service }))}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      bookingData.serviceType === service
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium">{service}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service Description</label>
              <Textarea
                placeholder="Please describe the work you need done..."
                value={bookingData.description}
                onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Service Urgency</label>
              <div className="grid grid-cols-1 gap-3">
                {urgencyLevels.map((level) => (
                  <motion.button
                    key={level.value}
                    onClick={() => setBookingData(prev => ({ ...prev, urgency: level.value }))}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      bookingData.urgency === level.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-muted-foreground">{level.time}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${level.value !== 'normal' ? 'text-primary' : 'text-muted-foreground'}`}>
                          {level.price}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {provider.service === "Tiffin Service" && (
              <div>
                <label className="block text-sm font-medium mb-2">Quantity (Meals per day)</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg px-4">{bookingData.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Date & Time</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Time</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Provider Availability</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {provider.name} typically responds within {provider.responseTime}. 
                    You'll receive a confirmation once they accept your booking.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estimated Duration</label>
              <Select 
                value={bookingData.estimatedDuration} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, estimatedDuration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30-60 mins">30-60 minutes</SelectItem>
                  <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                  <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                  <SelectItem value="4+ hours">4+ hours</SelectItem>
                  <SelectItem value="full-day">Full day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Enter your full name"
                    value={bookingData.customerInfo.name}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, name: e.target.value }
                    }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Enter your phone number"
                    value={bookingData.customerInfo.phone}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={bookingData.customerInfo.email}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, email: e.target.value }
                    }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Service Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                  <Textarea
                    placeholder="Enter complete address where service is needed"
                    value={bookingData.customerInfo.address}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, address: e.target.value }
                    }))}
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
              <Textarea
                placeholder="Any special instructions or requirements..."
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                rows={3}
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold">Payment Method</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.value}
                  onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.value }))}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    bookingData.paymentMethod === method.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.value === 'cash' && 'Pay directly to the service provider'}
                        {method.value === 'card' && 'Secure online payment'}
                        {method.value === 'upi' && 'Quick UPI payment'}
                        {method.value === 'wallet' && 'Pay with digital wallet'}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Secure Payment</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment information is encrypted and secure. You can pay after the service is completed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>₹{parseInt(provider.price.replace(/[^\d]/g, '')) * bookingData.quantity}</span>
                </div>
                {bookingData.urgency !== 'normal' && (
                  <div className="flex justify-between">
                    <span>Urgency Fee</span>
                    <span>₹{bookingData.urgency === 'urgent' ? 100 : 200}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Confirm Your Booking</h3>
              <p className="text-muted-foreground">Please review your booking details before confirming</p>
            </div>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={provider.image}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">{provider.service}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{provider.rating} ({provider.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">Service Details</h5>
                      <div className="space-y-1">
                        <div>Type: {bookingData.serviceType}</div>
                        <div>Urgency: {bookingData.urgency}</div>
                        <div>Duration: {bookingData.estimatedDuration}</div>
                        {provider.service === "Tiffin Service" && (
                          <div>Quantity: {bookingData.quantity} meals/day</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Schedule</h5>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{selectedDate ? format(selectedDate, "PPP") : "Not selected"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{selectedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Contact</h5>
                      <div className="space-y-1">
                        <div>{bookingData.customerInfo.name}</div>
                        <div>{bookingData.customerInfo.phone}</div>
                        <div>{bookingData.customerInfo.email}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Payment</h5>
                      <div className="space-y-1">
                        <div>Method: {paymentMethods.find(m => m.value === bookingData.paymentMethod)?.label}</div>
                        <div className="font-semibold">Total: ₹{calculateTotal()}</div>
                      </div>
                    </div>
                  </div>

                  {bookingData.description && (
                    <>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-2">Description</h5>
                        <p className="text-sm text-muted-foreground">{bookingData.description}</p>
                      </div>
                    </>
                  )}

                  {bookingData.specialRequests && (
                    <>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-2">Special Requests</h5>
                        <p className="text-sm text-muted-foreground">{bookingData.specialRequests}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Book Service</h2>
              <p className="text-primary-foreground/80">Step {currentStep} of {steps.length}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div key={step.id} className="text-center flex-1">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                    currentStep >= step.id ? 'bg-white text-primary' : 'bg-white/20 text-white'
                  }`}>
                    {step.id}
                  </div>
                  <p className="text-xs mt-1 text-primary-foreground/80">{step.title}</p>
                </div>
              ))}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/30 p-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleBookingSubmit} className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}