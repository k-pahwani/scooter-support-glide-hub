import { useState } from "react";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Scooter {
  id: string;
  name: string;
  model: string;
  price: number;
  stock_quantity: number;
}

interface OrderFormProps {
  scooter: Scooter;
  onClose: () => void;
  onOrderSuccess: () => void;
}

const OrderForm = ({ scooter, onClose, onOrderSuccess }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    shippingAddress: '',
    phoneNumber: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toLocaleString()}`;
  };

  const calculateTotal = () => {
    return scooter.price * formData.quantity;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.shippingAddress.trim() || !formData.phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity > scooter.stock_quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${scooter.stock_quantity} units available.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        user_id: user.id,
        scooter_id: scooter.id,
        quantity: formData.quantity,
        unit_price: scooter.price,
        total_amount: calculateTotal(),
        shipping_address: formData.shippingAddress,
        phone_number: formData.phoneNumber,
        notes: formData.notes || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('scooter_orders')
        .insert([orderData]);

      if (error) throw error;

      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ${scooter.name} has been placed.`,
      });

      onOrderSuccess();
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Place Order</h1>
            <p className="text-xs opacity-90">Complete your purchase</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">{scooter.name}</span>
              <span>{formatPrice(scooter.price)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{scooter.model}</span>
              <span>{scooter.stock_quantity} available</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={scooter.stock_quantity}
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shippingAddress">Shipping Address *</Label>
                <Textarea
                  id="shippingAddress"
                  placeholder="Enter your complete shipping address..."
                  value={formData.shippingAddress}
                  onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Your contact number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special delivery instructions..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Total and Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Place Order</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default OrderForm;