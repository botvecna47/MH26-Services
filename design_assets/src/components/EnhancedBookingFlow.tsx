import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Star,
  Shield,
  Zap,
  MessageCircle,
  Phone,
  Mail,
  AlertCircle,
  Info,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useApi } from '../hooks/useApi';
// Simplified validation - removed heavy imports that might cause timeouts

interface Provider {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  specializations: string[];
  responseTime: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'per_item';
  availability: {
    isAvailable: boolean;
    nextAvailable?: string;
  };
  location: {
    distance: number;
    area: string;
  };
  verification: {
    isVerified: boolean;
    documents: string[];
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'per_item';
}

interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface BookingData {
  serviceId: string;
  providerId: string;
  scheduledDate: Date;
  scheduledTime: string;
  address: Address;
  requirements?: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  contactMethod: 'phone' | 'chat' | 'both';
  additionalServices: string[];
  estimatedPrice: number;
  paymentMethod: 'online' | 'cod';
}

interface EnhancedBookingFlowProps {
  service: Service;
  provider: Provider;
  onComplete: (booking: BookingData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const BOOKING_STEPS = [
  { id: 'service', title: 'Service Details', icon: Zap },
  { id: 'schedule', title: 'Schedule', icon: CalendarIcon },
  { id: 'address', title: 'Address', icon: MapPin },
  { id: 'details', title: 'Details', icon: User },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];

const ADDITIONAL_SERVICES = [
  { id: 'cleanup', name: 'Post-service cleanup', price: 50 },
  { id: 'warranty', name: 'Extended warranty (6 months)', price: 100 },
  { id: 'priority', name: 'Priority support', price: 75 },
  { id: 'materials', name: 'Premium materials', price: 150 }
];

export function EnhancedBookingFlow({ 
  service, 
  provider, 
  onComplete, 
  onCancel, 
  isOpen 
}: EnhancedBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    serviceId: service.id,
    providerId: provider.id,
    urgency: 'normal',
    contactMethod: 'both',
    additionalServices: [],
    paymentMethod: 'online'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);

  // API hooks
  const { execute: fetchAvailableSlots, loading: loadingSlots } = useApi(
    async (date: Date) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const slots = TIME_SLOTS.filter(() => Math.random() > 0.3);
      setAvailableSlots(slots);
      return { success: true, data: slots };
    }
  );

  const { execute: fetchAddresses } = useApi(
    async () => {
      // Mock API call
      const addresses: Address[] = [
        {
          id: 'addr_1',
          type: 'home',
          street: '123 Main Street',
          area: 'Shivaji Nagar',
          city: 'Nanded',
          state: 'Maharashtra',
          pincode: '431601',
          landmark: 'Near City Hospital',
          isDefault: true
        }
      ];
      setSavedAddresses(addresses);
      return { success: true, data: addresses };
    }
  );

  const { execute: createBooking, loading: creatingBooking } = useApi(
    async (data: BookingData) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, data: { id: 'booking_123', ...data } };
    },
    { 
      showSuccessToast: true,
      successMessage: 'Booking created successfully!'
    }
  );

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen, fetchAddresses]);

  // Calculate estimated price
  const estimatedPrice = useMemo(() => {
    let basePrice = service.basePrice;
    
    // Urgency multiplier
    if (bookingData.urgency === 'urgent') basePrice *= 1.2;
    if (bookingData.urgency === 'emergency') basePrice *= 1.5;
    
    // Additional services
    const additionalCost = bookingData.additionalServices?.reduce((total, serviceId) => {
      const additionalService = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
      return total + (additionalService?.price || 0);
    }, 0) || 0;
    
    return basePrice + additionalCost;
  }, [service.basePrice, bookingData.urgency, bookingData.additionalServices]);

  // Update booking data
  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
    setErrors({}); // Clear errors when data changes
  }, []);

  // Validate current step
  const validateStep = useCallback(() => {
    const currentStepId = BOOKING_STEPS[currentStep].id;
    let isValid = true;
    const newErrors: Record<string, string> = {};

    switch (currentStepId) {
      case 'schedule':
        if (!bookingData.scheduledDate) {
          newErrors.scheduledDate = 'Please select a date';
          isValid = false;
        }
        if (!bookingData.scheduledTime) {
          newErrors.scheduledTime = 'Please select a time';
          isValid = false;
        }
        break;

      case 'address':
        if (!bookingData.address) {
          newErrors.address = 'Please select or add an address';
          isValid = false;
        } else {
          // Simplified address validation
          if (!bookingData.address.street || !bookingData.address.area || !bookingData.address.pincode) {
            newErrors.address = 'Please fill in all required address fields';
            isValid = false;
          }
        }
        break;

      case 'details':
        if (!bookingData.contactMethod) {
          newErrors.contactMethod = 'Please select a contact method';
          isValid = false;
        }
        break;

      case 'payment':
        if (!bookingData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  }, [currentStep, bookingData]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateStep()) {
      if (currentStep < BOOKING_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    updateBookingData({ scheduledDate: date });
    fetchAvailableSlots(date);
  }, [updateBookingData, fetchAvailableSlots]);

  // Handle time selection
  const handleTimeSelect = useCallback((time: string) => {
    updateBookingData({ scheduledTime: time });
  }, [updateBookingData]);

  // Handle address selection
  const handleAddressSelect = useCallback((address: Address) => {
    updateBookingData({ address });
    setIsCreatingNewAddress(false);
  }, [updateBookingData]);

  // Handle additional service toggle
  const handleAdditionalServiceToggle = useCallback((serviceId: string) => {
    updateBookingData({
      additionalServices: bookingData.additionalServices?.includes(serviceId)
        ? bookingData.additionalServices.filter(id => id !== serviceId)
        : [...(bookingData.additionalServices || []), serviceId]
    });
  }, [bookingData.additionalServices, updateBookingData]);

  // Complete booking
  const handleComplete = useCallback(async () => {
    if (validateStep()) {
      const completeBookingData = {
        ...bookingData,
        estimatedPrice
      } as BookingData;
      
      const result = await createBooking(completeBookingData);
      if (result) {
        onComplete(completeBookingData);
      }
    }
  }, [bookingData, estimatedPrice, validateStep, createBooking, onComplete]);

  // Render step content
  const renderStepContent = () => {
    const stepId = BOOKING_STEPS[currentStep].id;

    switch (stepId) {
      case 'service':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Service Confirmation</h3>
              <p className="text-muted-foreground">Confirm your service selection</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{service.name}</h4>
                    <p className="text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.estimatedDuration} minutes
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ₹{service.basePrice}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    {provider.verification.isVerified && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{provider.name}</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({provider.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {provider.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Response: {provider.responseTime}</span>
                      <span>Distance: {provider.location.distance}km</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Select Date & Time</h3>
              <p className="text-muted-foreground">Choose when you'd like the service</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={bookingData.scheduledDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                  {errors.scheduledDate && (
                    <p className="text-destructive text-sm mt-2">{errors.scheduledDate}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Times</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : bookingData.scheduledDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={bookingData.scheduledTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTimeSelect(time)}
                          className="h-10"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      Please select a date first
                    </div>
                  )}
                  {errors.scheduledTime && (
                    <p className="text-destructive text-sm mt-2">{errors.scheduledTime}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Urgency Level</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={bookingData.urgency} 
                  onValueChange={(value) => updateBookingData({ urgency: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="flex-1">
                      <div>
                        <div className="font-medium">Normal</div>
                        <div className="text-sm text-muted-foreground">Standard service timing</div>
                      </div>
                    </Label>
                    <span className="text-sm">+₹0</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent" className="flex-1">
                      <div>
                        <div className="font-medium">Urgent</div>
                        <div className="text-sm text-muted-foreground">Priority scheduling</div>
                      </div>
                    </Label>
                    <span className="text-sm">+20%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency" className="flex-1">
                      <div>
                        <div className="font-medium">Emergency</div>
                        <div className="text-sm text-muted-foreground">Immediate attention</div>
                      </div>
                    </Label>
                    <span className="text-sm">+50%</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Service Address</h3>
              <p className="text-muted-foreground">Where should we provide the service?</p>
            </div>

            {!isCreatingNewAddress ? (
              <div className="space-y-4">
                {savedAddresses.map((address) => (
                  <Card 
                    key={address.id}
                    className={`cursor-pointer transition-colors ${
                      bookingData.address?.id === address.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium capitalize">{address.type}</span>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street}, {address.area}, {address.city}, {address.state} {address.pincode}
                          </p>
                          {address.landmark && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Landmark: {address.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsCreatingNewAddress(true)}
                >
                  Add New Address
                </Button>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={bookingData.address?.type} 
                        onValueChange={(value) => updateBookingData({
                          address: { ...bookingData.address, type: value } as Address
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={bookingData.address?.street || ''}
                      onChange={(e) => updateBookingData({
                        address: { ...bookingData.address, street: e.target.value } as Address
                      })}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="area">Area</Label>
                      <Input
                        id="area"
                        value={bookingData.address?.area || ''}
                        onChange={(e) => updateBookingData({
                          address: { ...bookingData.address, area: e.target.value } as Address
                        })}
                        placeholder="Enter area"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={bookingData.address?.pincode || ''}
                        onChange={(e) => updateBookingData({
                          address: { ...bookingData.address, pincode: e.target.value } as Address
                        })}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={bookingData.address?.landmark || ''}
                      onChange={(e) => updateBookingData({
                        address: { ...bookingData.address, landmark: e.target.value } as Address
                      })}
                      placeholder="Enter nearby landmark"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingNewAddress(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        // Add address to saved addresses and select it
                        const newAddress = { 
                          ...bookingData.address, 
                          id: `addr_${Date.now()}`,
                          city: 'Nanded',
                          state: 'Maharashtra',
                          isDefault: false
                        } as Address;
                        setSavedAddresses(prev => [...prev, newAddress]);
                        handleAddressSelect(newAddress);
                      }}
                    >
                      Save Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {errors.address && (
              <p className="text-destructive text-sm">{errors.address}</p>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Additional Details</h3>
              <p className="text-muted-foreground">Customize your service experience</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Preference</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={bookingData.contactMethod} 
                  onValueChange={(value) => updateBookingData({ contactMethod: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone call</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chat" id="chat" />
                    <Label htmlFor="chat" className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat only</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Both phone and chat</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ADDITIONAL_SERVICES.map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={bookingData.additionalServices?.includes(service.id)}
                        onCheckedChange={() => handleAdditionalServiceToggle(service.id)}
                      />
                      <Label className="flex-1">{service.name}</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">+₹{service.price}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Special Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={bookingData.requirements || ''}
                  onChange={(e) => updateBookingData({ requirements: e.target.value })}
                  placeholder="Any special instructions or requirements..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Payment Method</h3>
              <p className="text-muted-foreground">Choose how you'd like to pay</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Base service cost</span>
                  <span>₹{service.basePrice}</span>
                </div>
                
                {bookingData.urgency !== 'normal' && (
                  <div className="flex justify-between text-orange-600">
                    <span>
                      {bookingData.urgency === 'urgent' ? 'Urgent' : 'Emergency'} surcharge
                    </span>
                    <span>
                      +₹{service.basePrice * (bookingData.urgency === 'urgent' ? 0.2 : 0.5)}
                    </span>
                  </div>
                )}
                
                {bookingData.additionalServices?.map((serviceId) => {
                  const additionalService = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
                  return additionalService ? (
                    <div key={serviceId} className="flex justify-between text-blue-600">
                      <span>{additionalService.name}</span>
                      <span>+₹{additionalService.price}</span>
                    </div>
                  ) : null;
                })}
                
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{estimatedPrice}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Options</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={bookingData.paymentMethod} 
                  onValueChange={(value) => updateBookingData({ paymentMethod: value as any })}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Pay Online</div>
                          <div className="text-sm text-muted-foreground">
                            Credit/Debit Card, UPI, Net Banking
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4 text-green-600" />
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1">
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          Pay when service is completed
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {errors.paymentMethod && (
                  <p className="text-destructive text-sm mt-2">{errors.paymentMethod}</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Confirm Your Booking</h3>
              <p className="text-muted-foreground">Review your booking details</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span>
                    <p className="text-muted-foreground">{service.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span>
                    <p className="text-muted-foreground">{provider.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date & Time:</span>
                    <p className="text-muted-foreground">
                      {bookingData.scheduledDate && format(bookingData.scheduledDate, 'MMM d, yyyy')} at {bookingData.scheduledTime}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Urgency:</span>
                    <p className="text-muted-foreground capitalize">{bookingData.urgency}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span>
                    <p className="text-muted-foreground">
                      {bookingData.address?.street}, {bookingData.address?.area}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-muted-foreground capitalize">{bookingData.contactMethod}</p>
                  </div>
                  <div>
                    <span className="font-medium">Payment:</span>
                    <p className="text-muted-foreground">
                      {bookingData.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{estimatedPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">What happens next?</p>
                  <ul className="mt-2 text-blue-700 space-y-1">
                    <li>• The provider will be notified immediately</li>
                    <li>• You'll receive a confirmation via SMS/email</li>
                    <li>• The provider will contact you before the scheduled time</li>
                    <li>• You can track the service status in real-time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Book Service</h2>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Step {currentStep + 1} of {BOOKING_STEPS.length}</span>
              <span className="text-sm">{Math.round(((currentStep + 1) / BOOKING_STEPS.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / BOOKING_STEPS.length) * 100} className="bg-white/20" />
          </div>
        </div>

        {/* Steps */}
        <div className="border-b bg-muted/30 px-6 py-3">
          <div className="flex items-center justify-between">
            {BOOKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-white' :
                    isCompleted ? 'bg-green-100 text-green-700' :
                    'text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < BOOKING_STEPS.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-muted/30">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Estimated Total: <span className="font-semibold text-foreground">₹{estimatedPrice}</span>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === BOOKING_STEPS.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={creatingBooking}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {creatingBooking ? 'Creating...' : 'Confirm Booking'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}