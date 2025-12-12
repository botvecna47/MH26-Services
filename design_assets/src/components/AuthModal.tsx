import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
  businessName?: string;
}

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
}

export function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(mode === 'signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountType, setAccountType] = useState<'user' | 'provider'>('user');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Sign up specific validation
    if (!isSignIn) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (accountType === 'provider' && !formData.businessName) {
        newErrors.businessName = 'Business name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      // Demo credentials
      if (isSignIn) {
        // Check demo credentials
        // Test credentials
        const testAccounts = {
          'user@mh26.com': { id: 'user-1', firstName: 'Devansh', lastName: 'Patel', role: 'user' as const },
          'provider@mh26.com': { id: 'provider-user-1', firstName: 'Provider', lastName: 'Demo', role: 'provider' as const, businessName: 'QuickFix Plumbing' },
          'admin@mh26.com': { id: 'admin-1', firstName: 'Admin', lastName: 'User', role: 'admin' as const },
        };
        
        const account = testAccounts[formData.email as keyof typeof testAccounts];
        
        if (account && formData.password === 'demo123') {
          const user: User = {
            id: account.id,
            email: formData.email,
            firstName: account.firstName,
            lastName: account.lastName,
            role: account.role,
            businessName: 'businessName' in account ? account.businessName : undefined,
          };
          toast.success(`Welcome back, ${account.firstName}!`);
          onSuccess(user);
        } else {
          toast.error('Invalid credentials');
        }
      } else {
        // Sign up - create new user
        const user: User = {
          id: `user-${Date.now()}`,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: accountType,
          businessName: accountType === 'provider' ? formData.businessName : undefined,
        };
        toast.success('Account created successfully!');
        onSuccess(user);
      }
    }, 1000);
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setIsSignIn(newMode === 'signin');
    onSwitchMode(newMode);
    setErrors({});
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <CardTitle>MH26 Services</CardTitle>
                    <CardDescription>Welcome back!</CardDescription>
                  </div>
                </div>

                <Tabs value={isSignIn ? 'signin' : 'signup'} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger
                      value="signin"
                      onClick={() => handleModeSwitch('signin')}
                      className="data-[state=active]:bg-white"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      onClick={() => handleModeSwitch('signup')}
                      className="data-[state=active]:bg-white"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignIn ? 'signin' : 'signup'}
                    initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Sign Up Fields */}
                    {!isSignIn && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                              />
                            </div>
                            {errors.firstName && (
                              <p className="text-xs text-destructive">{errors.firstName}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`pl-10 ${errors.lastName ? 'border-destructive' : ''}`}
                              />
                            </div>
                            {errors.lastName && (
                              <p className="text-xs text-destructive">{errors.lastName}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-xs text-destructive">{errors.phone}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Account Type</label>
                          <div className="relative">
                            <select
                              value={accountType}
                              onChange={(e) => setAccountType(e.target.value as 'user' | 'provider')}
                              className="flex h-12 w-full rounded-md border border-border bg-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                            >
                              <option value="user">Customer Account</option>
                              <option value="provider">Service Provider Account</option>
                            </select>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {accountType === 'user' ? 'Book and manage services' : 'List and offer your services'}
                          </p>
                        </div>

                        {accountType === 'provider' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Business Name</label>
                            <div className="relative">
                              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="My Business"
                                value={formData.businessName}
                                onChange={(e) => handleInputChange('businessName', e.target.value)}
                                className={`pl-10 ${errors.businessName ? 'border-destructive' : ''}`}
                              />
                            </div>
                            {errors.businessName && (
                              <p className="text-xs text-destructive">{errors.businessName}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password (Sign Up) */}
                    {!isSignIn && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    {/* Demo Credentials Notice */}
                    {isSignIn && (
                      <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <p className="font-medium text-info">Demo Credentials</p>
                            <p className="text-muted-foreground">
                              User: user@mh26.com / demo123<br />
                              Admin: admin@mh26.com / demo123
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>{isSignIn ? 'Sign In' : 'Create Account'}</>
                  )}
                </Button>

                {/* Forgot Password */}
                {isSignIn && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                      onClick={() => toast.info('Password reset feature coming soon')}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}