import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Shield, 
  Users, 
  Settings,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../services/auth";
import { validateLoginForm, validateRegisterForm } from "../utils/validation";
import { LoginCredentials, RegisterData } from "../types/database";

interface AuthScreenProps {
  userType: 'customer' | 'provider' | 'admin';
  onBack: () => void;
  onAuthenticated: (userData: any) => void;
}

export function AuthScreen({ userType, onBack, onAuthenticated }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
    serviceCategories: [] as string[],
  });

  const { login, register, isLoading } = useAuth();

  const userTypeConfig = {
    customer: {
      title: "Customer Portal",
      subtitle: "Book and manage your service appointments",
      icon: Users,
      color: "bg-blue-500",
      features: ["Book Services", "Track Orders", "Payment History", "Reviews & Ratings"]
    },
    provider: {
      title: "Provider Portal", 
      subtitle: "Manage your services and customers",
      icon: User,
      color: "bg-green-500",
      features: ["Manage Services", "Client Management", "Earnings Dashboard", "Calendar"]
    },
    admin: {
      title: "Admin Dashboard",
      subtitle: "Platform management and analytics", 
      icon: Settings,
      color: "bg-purple-500",
      features: ["User Management", "Analytics", "Service Approvals", "System Settings"]
    }
  };

  const config = userTypeConfig[userType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (isLogin) {
      // Login flow
      const credentials: LoginCredentials = {
        email: formData.email,
        password: formData.password,
        userType,
      };

      const validation = validateLoginForm(credentials);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      const result = await login(credentials);
      if (result.success) {
        toast.success(`Welcome back! Redirecting to ${config.title}`);
        onAuthenticated({
          email: formData.email,
          userType,
          isAuthenticated: true
        });
      } else {
        toast.error(result.error || "Login failed");
      }
    } else {
      // Registration flow
      const registrationData: RegisterData & { confirmPassword: string } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        userType,
        businessName: userType === 'provider' ? formData.businessName : undefined,
        serviceCategories: userType === 'provider' ? formData.serviceCategories : undefined,
      };

      const validation = validateRegisterForm(registrationData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      const result = await register(registrationData);
      if (result.success) {
        toast.success(`Account created successfully! Welcome to ${config.title}`);
        onAuthenticated({
          email: formData.email,
          userType,
          isAuthenticated: true
        });
      } else {
        toast.error(result.error || "Registration failed");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/20 to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <motion.div 
            className="space-y-8 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Button */}
            <motion.button
              onClick={onBack}
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Selection</span>
            </motion.button>

            {/* Portal Info */}
            <div className="space-y-6">
              <motion.div 
                className="flex items-center justify-center lg:justify-start space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={`w-16 h-16 ${config.color} rounded-2xl flex items-center justify-center`}>
                  <config.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{config.title}</h1>
                  <p className="text-muted-foreground">{config.subtitle}</p>
                </div>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-foreground">What you can do:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {config.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg p-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Demo Credentials */}
              <motion.div 
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Demo Credentials</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Email: demo@mh26.com<br />
                      Password: demo123
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1575388902449-6bca946ad549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBsb2dpbiUyMGludGVyZmFjZSUyMG1vZGVybiUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTkyMDMwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Professional dashboard interface"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md">
              <CardHeader className="space-y-4 pb-6">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isLogin 
                      ? `Sign in to your ${userType} account`
                      : `Create your new ${userType} account`
                    }
                  </CardDescription>
                </div>

                <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger 
                      value="login" 
                      onClick={() => setIsLogin(true)}
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register"
                      onClick={() => setIsLogin(false)}
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isLogin ? 'login' : 'register'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`pl-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                              validationErrors.email ? 'border-red-500' : ''
                            }`}
                            required
                          />
                        </div>
                        {validationErrors.email && (
                          <p className="text-sm text-red-500">{validationErrors.email[0]}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`pl-10 pr-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                              validationErrors.password ? 'border-red-500' : ''
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {validationErrors.password && (
                          <p className="text-sm text-red-500">{validationErrors.password[0]}</p>
                        )}
                      </div>

                      {/* Additional fields for registration */}
                      {!isLogin && (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Confirm Password */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirm Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className={`pl-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                                  validationErrors.confirmPassword ? 'border-red-500' : ''
                                }`}
                                required
                              />
                            </div>
                            {validationErrors.confirmPassword && (
                              <p className="text-sm text-red-500">{validationErrors.confirmPassword[0]}</p>
                            )}
                          </div>

                          {/* First Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">First Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                type="text"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`pl-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                                  validationErrors.firstName ? 'border-red-500' : ''
                                }`}
                                required
                              />
                            </div>
                            {validationErrors.firstName && (
                              <p className="text-sm text-red-500">{validationErrors.firstName[0]}</p>
                            )}
                          </div>

                          {/* Last Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Last Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                type="text"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`pl-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                                  validationErrors.lastName ? 'border-red-500' : ''
                                }`}
                                required
                              />
                            </div>
                            {validationErrors.lastName && (
                              <p className="text-sm text-red-500">{validationErrors.lastName[0]}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className={`pl-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                                  validationErrors.phone ? 'border-red-500' : ''
                                }`}
                                required
                              />
                            </div>
                            {validationErrors.phone && (
                              <p className="text-sm text-red-500">{validationErrors.phone[0]}</p>
                            )}
                          </div>

                          {/* Provider-specific fields */}
                          {userType === 'provider' && (
                            <>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Business Name</label>
                                <div className="relative">
                                  <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    type="text"
                                    placeholder="Enter your business name"
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    className={`pl-10 h-12 bg-input-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                                      validationErrors.businessName ? 'border-red-500' : ''
                                    }`}
                                    required
                                  />
                                </div>
                                {validationErrors.businessName && (
                                  <p className="text-sm text-red-500">{validationErrors.businessName[0]}</p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Service Categories</label>
                                <div className="space-y-2">
                                  {['Tiffin Service', 'Plumbing', 'Electrical', 'Tourism Guide'].map((category) => (
                                    <label key={category} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={formData.serviceCategories.includes(category)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            handleInputChange('serviceCategories', [...formData.serviceCategories, category]);
                                          } else {
                                            handleInputChange('serviceCategories', formData.serviceCategories.filter(c => c !== category));
                                          }
                                        }}
                                        className="rounded border-border/50"
                                      />
                                      <span className="text-sm">{category}</span>
                                    </label>
                                  ))}
                                </div>
                                {validationErrors.serviceCategories && (
                                  <p className="text-sm text-red-500">{validationErrors.serviceCategories[0]}</p>
                                )}
                              </div>
                            </>
                          )}


                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Please wait...</span>
                        </div>
                      ) : (
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      )}
                    </Button>
                  </motion.div>

                  {/* Forgot Password Link (only for login) */}
                  {isLogin && (
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                        onClick={() => {
                          if (formData.email) {
                            // Using forgotPassword from auth service
                            toast.info("Password reset functionality with email integration would be implemented in production");
                          } else {
                            toast.error("Please enter your email address first");
                          }
                        }}
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
      </div>
    </div>
  );
}