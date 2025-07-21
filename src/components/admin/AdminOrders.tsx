import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, MapPin, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminOrdersProps {
  onBack: () => void;
  onClose: () => void;
}

interface Order {
  id: string;
  user_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  phone_number: string | null;
  notes: string | null;
  order_date: string;
  estimated_delivery: string | null;
  scooters: {
    name: string;
    model: string;
    image_url: string | null;
  } | null;
  profiles: {
    username: string | null;
  } | null;
}

const AdminOrders = ({ onBack }: AdminOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scooter_orders')
        .select(`
          *,
          scooters (
            name,
            model,
            image_url
          ),
          profiles (
            username
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const { error } = await supabase
        .from('scooter_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (cents: number) => {
    return `₹${(cents / 100).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/10 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">All Orders</h1>
              <p className="text-xs opacity-90">Manage customer orders</p>
            </div>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {order.scooters?.name || 'Unknown Scooter'} ({order.scooters?.model || 'N/A'})
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.profiles?.username || 'Unknown'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>Quantity: {order.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Ordered: {formatDate(order.order_date)}</span>
                      </div>
                      <div className="text-lg font-semibold">
                        Total: {formatPrice(order.total_amount)}
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-2">
                      {order.shipping_address && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span className="flex-1">{order.shipping_address}</span>
                        </div>
                      )}
                      {order.phone_number && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{order.phone_number}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Notes:</span> {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Update Status:</span>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                        disabled={updatingOrder === order.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingOrder === order.id && (
                        <span className="text-xs text-muted-foreground">Updating...</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;