'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            An error occurred while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

