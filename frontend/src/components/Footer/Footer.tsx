import React from 'react';
import { useTranslationWithFallback } from '@/hooks/useTranslationWithFallback';
export default function Footer() {
  const { tWithFallback } = useTranslationWithFallback();
  return (
    <footer className="text-center text-gray-400 text-xs py-4">
      {tWithFallback('footer.copyright', '©2024 YourApp. All rights reserved.')}
    </footer>
  );
} 