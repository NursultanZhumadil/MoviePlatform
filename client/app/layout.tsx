import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from './apollo-wrapper';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Movie Platform - MERN Stack',
  description: 'Movie platform with MERN stack, GraphQL, and real-time features',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>
          <Navigation />
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}

