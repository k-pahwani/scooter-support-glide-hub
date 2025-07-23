import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@voltride.com?subject=VoltRide Support Request';
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:+1-800-VOLT-911';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-primary">⚡</span>
            </div>
            <h1 className="text-3xl font-bold">VoltRide Support</h1>
            <p className="text-lg mt-2 opacity-90">We're here to help 24/7</p>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Emergency Support */}
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Phone className="w-5 h-5 mr-2" />
                Emergency Support
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                For urgent safety issues or emergencies while riding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-red-600 dark:text-red-300">
                  If you're experiencing a safety issue, accident, or emergency while using your VoltRide scooter, 
                  call our emergency line immediately.
                </p>
                <Button 
                  onClick={handleEmergencyCall}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Emergency Line: +1-800-VOLT-911
                </Button>
                <p className="text-xs text-red-500 dark:text-red-400">
                  Available 24/7 • Average response time: Immediate
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Support
              </CardTitle>
              <CardDescription>
                For general questions, technical issues, and non-urgent support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send us an email for technical support, warranty questions, parts requests, 
                  or any other non-urgent matters related to your VoltRide scooter.
                </p>
                <Button 
                  onClick={handleEmailSupport}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email: support@voltride.com
                </Button>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Response time: Within 24 hours
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 8:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="mt-3 pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Emergency Line:</span>
                      <span>24/7 Available</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Headquarters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p>VoltRide Technologies Inc.</p>
                      <p>1234 Electric Avenue</p>
                      <p>San Francisco, CA 94102</p>
                      <p>United States</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Before You Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">For faster support, please have ready:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Your scooter's serial number (found under the deck)</li>
                    <li>Purchase date and order number</li>
                    <li>Description of the issue with photos/videos if applicable</li>
                    <li>Your current location if it's an emergency</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Common Solutions:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Try restarting your scooter by turning it off and on</li>
                    <li>Check if the battery needs charging</li>
                    <li>Ensure the kickstand is fully up before riding</li>
                    <li>Visit our FAQ section in the app for quick answers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;