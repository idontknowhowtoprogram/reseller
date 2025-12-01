import { CheckCircle2, Package, MessageCircle, CreditCard } from 'lucide-react';

const boosters = [
  {
    icon: CheckCircle2,
    text: '100% Original Items',
  },
  {
    icon: Package,
    text: 'Only 1 Piece Per Product',
  },
  {
    icon: MessageCircle,
    text: 'Fast Replies on WhatsApp',
  },
  {
    icon: CreditCard,
    text: 'Cash or Bank Transfer Available',
  },
];

export function TrustBoosters() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {boosters.map((booster, index) => {
        const Icon = booster.icon;
        return (
          <div
            key={index}
            className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Icon className="h-6 w-6 text-primary" />
            <p className="text-xs md:text-sm font-medium">{booster.text}</p>
          </div>
        );
      })}
    </div>
  );
}

