'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink, generateWhatsAppMessage, generateSingleProductWhatsAppMessage } from '@/lib/utils/whatsapp';
import { Settings, Product, CartItem } from '@/types';

interface WhatsAppButtonProps {
  phoneNumber: string;
  items?: CartItem[];
  product?: Product;
  settings: Settings;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function WhatsAppButton({
  phoneNumber,
  items,
  product,
  settings,
  className,
  variant = 'default',
  size = 'default',
  children,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    let message = '';
    
    if (items && items.length > 0) {
      message = generateWhatsAppMessage(items, settings);
    } else if (product) {
      message = generateSingleProductWhatsAppMessage(product, settings);
    } else {
      return;
    }

    const link = generateWhatsAppLink(phoneNumber, message);
    window.open(link, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {children || 'Buy on WhatsApp'}
    </Button>
  );
}

