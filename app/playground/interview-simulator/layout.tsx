export default function InterviewSimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      {children}
    </div>
  );
} 