'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Offer } from '@/types';
import { Check, X, MessageCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface OffersTableProps {
  offers: Offer[];
}

export function OffersTable({ offers }: OffersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (offerId: string, newStatus: string) => {
    setUpdatingId(offerId);
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update offer');
      }

      toast.success('Offer updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update offer');
    } finally {
      setUpdatingId(null);
    }
  };

  const generateWhatsAppLink = (phone: string, productTitle: string, offerPrice: number) => {
    const message = encodeURIComponent(
      `Hi! Your offer of ${offerPrice} AED for "${productTitle}" has been accepted. Please contact us to proceed with the purchase.`
    );
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
  };

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No offers yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Offer Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => {
            const product = offer.product as any;
            return (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">
                  {product?.title || 'N/A'}
                </TableCell>
                <TableCell>{offer.name}</TableCell>
                <TableCell>{offer.phone}</TableCell>
                <TableCell className="font-bold">{offer.offer_price} AED</TableCell>
                <TableCell>
                  <Select
                    value={offer.status}
                    onValueChange={(value) => handleStatusChange(offer.id, value)}
                    disabled={updatingId === offer.id}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="countered">Countered</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(offer.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {offer.status === 'accepted' && (
                      <a
                        href={generateWhatsAppLink(offer.phone, product?.title || '', offer.offer_price)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

