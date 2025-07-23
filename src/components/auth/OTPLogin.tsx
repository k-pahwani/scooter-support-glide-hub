
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, ArrowRight, Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+1", country: "CA", flag: "🇨🇦" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+47", country: "NO", flag: "🇳🇴" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+32", country: "BE", flag: "🇧🇪" },
  { code: "+43", country: "AT", flag: "🇦🇹" },
];

interface OTPLoginProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

const OTPLogin = ({ onLoginSuccess, onBack }: OTPLoginProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 6) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid mobile number",
        variant: "destructive"
      });
      return;
    }

    // Combine country code with phone number
    const formattedPhone = `${countryCode}${phoneNumber}`;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      toast({
        title: "OTP Sent",
        description: "Please check your mobile for the verification code",
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = `${countryCode}${phoneNumber}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      
      toast({
        title: "Login Successful",
        description: "Welcome to VoltRide!",
      });
      onLoginSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl text-primary-foreground">⚡</span>
          </div>
          <h1 className="text-2xl font-bold">VoltRide</h1>
          <p className="text-sm text-muted-foreground">User Login</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="self-start mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <CardTitle className="text-xl text-center">
              {step === 'phone' ? 'Enter Mobile Number' : 'Verify OTP'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'phone' 
                ? 'We\'ll send you a verification code' 
                : `Code sent to ${countryCode}${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'phone' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={`${country.code}-${country.country}`} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleSendOTP} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Enter 6-digit code</Label>
                  <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleVerifyOTP} 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                    <Shield className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBackToPhone}
                      className="text-muted-foreground"
                    >
                      Change Number
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSendOTP}
                      className="text-muted-foreground"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
