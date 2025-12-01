export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Don't apply auth check to login page - it has its own layout
  // The login page is handled separately and doesn't need the admin layout
  return <>{children}</>;
}

