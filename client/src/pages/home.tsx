import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportChat, SupportToggle } from "@/components/support-chat";
import { useCurrentUser } from "@/components/auth-guard";
import { authService } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useLocation } from "wouter";

export default function Home() {
  const user = useCurrentUser();
  const [, setLocation] = useLocation();
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [`${import.meta.env.VITE_BACKEND_URL}/api/products`],
  });

  const handleLogout = () => {
    authService.logout();
    setLocation("/login");
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                className="text-xl font-bold text-primary"
                data-testid="text-store-name"
              >
                EcomStore
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className="text-sm text-muted-foreground"
                data-testid="text-user-email"
              >
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
            Summer Sale - Up to 50% Off
          </h2>
          <p className="text-xl opacity-90" data-testid="text-hero-subtitle">
            Discover amazing deals on top brands
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3
          className="text-2xl font-bold text-foreground mb-8"
          data-testid="text-featured-products"
        >
          Featured Products
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
              data-testid={`card-product-${product.id}`}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
                data-testid={`img-product-${product.id}`}
              />
              <CardContent className="p-4">
                <h4
                  className="font-semibold text-foreground mb-2"
                  data-testid={`text-product-name-${product.id}`}
                >
                  {product.name}
                </h4>
                <p
                  className="text-muted-foreground text-sm mb-3"
                  data-testid={`text-product-description-${product.id}`}
                >
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className="text-lg font-bold text-primary"
                    data-testid={`text-product-price-${product.id}`}
                  >
                    ${product.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground" data-testid="text-footer">
            &copy; 2024 EcomStore. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Support Chat Components */}
      <SupportToggle onClick={() => setSupportChatOpen(true)} />
      <SupportChat
        isOpen={supportChatOpen}
        onToggle={() => setSupportChatOpen(!supportChatOpen)}
      />
    </div>
  );
}
