export default function TestPrefetchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-113px)] flex-1 overflow-y-auto p-4">
      {children}
    </main>
  );
}
