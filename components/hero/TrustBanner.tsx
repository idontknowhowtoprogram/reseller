'use client';

const trustItems = [
  '100% Original',
  'One Piece Only',
  'Fast WhatsApp Replies',
  'Cash or Bank Transfer',
  'Authentic Items',
  'UAE Delivery Available',
];

export function TrustBanner() {
  // Duplicate items for seamless loop
  const duplicatedItems = [...trustItems, ...trustItems];

  return (
    <div className="relative overflow-hidden bg-muted/50 border-b border-border/40 py-2 w-full" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
      <div className="flex animate-scroll">
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-6 whitespace-nowrap"
          >
            <span className="text-xs font-medium text-muted-foreground">{item}</span>
            <span className="text-muted-foreground/30">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

