import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 w-full">
      <div className="w-full max-w-[1920px] mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for quality pre-owned items.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Reach out via WhatsApp for inquiries
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Reseller. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

