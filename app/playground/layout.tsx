import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collaborative Code Editor | Code Together',
  description: 'Real-time collaborative code editor. Code together with others in real-time, just like Google Docs but for coding.',
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 