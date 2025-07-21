import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Zap, Battery, Weight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Scooter {
  id: string;
  name: string;
  model: string;
  description: string;
  price: number;
  max_speed: number;
  range_km: number;
  battery_capacity: string;
  weight_kg: number;
  max_load_kg: number;
  image_url?: string;
  stock_quantity: number;
}

interface ScooterCatalogProps {
  onClose: () => void;
  onOrderScooter: (scooter: Scooter) => void;
}

const ScooterCatalog = ({ onClose, onOrderScooter }: ScooterCatalogProps) => {
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScooters();
  }, []);

  const fetchScooters = async () => {
    try {
      const { data, error } = await supabase
        .from('scooters')
        .select('*')
        .eq('is_available', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setScooters(data || []);
    } catch (error) {
      console.error('Error fetching scooters:', error);
      toast({
        title: "Error",
        description: "Failed to load scooters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Scooter Catalog</h1>
              <p className="text-xs opacity-90">Loading...</p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Scooter Catalog</h1>
            <p className="text-xs opacity-90">Choose your perfect ride</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {scooters.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No scooters available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          scooters.map((scooter) => (
            <Card key={scooter.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{scooter.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{scooter.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatPrice(scooter.price)}</p>
                    <Badge variant={scooter.stock_quantity > 5 ? "secondary" : "outline"}>
                      {scooter.stock_quantity} in stock
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{scooter.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{scooter.max_speed} km/h max speed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-green-500" />
                    <span>{scooter.range_km} km range</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Weight className="w-4 h-4 text-blue-500" />
                    <span>{scooter.weight_kg} kg weight</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>{scooter.max_load_kg} kg max load</span>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Battery</p>
                  <p className="text-sm font-medium">{scooter.battery_capacity}</p>
                </div>

                <Button
                  onClick={() => onOrderScooter(scooter)}
                  className="w-full"
                  disabled={scooter.stock_quantity === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {scooter.stock_quantity === 0 ? 'Out of Stock' : 'Order Now'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default ScooterCatalog;