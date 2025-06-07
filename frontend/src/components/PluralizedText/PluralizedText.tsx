import React from 'react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { formatNumber } from '../../utils/textUtils';

interface PluralizedTextProps {
  translationKey: string;
  count: number;
  className?: string;
  options?: Record<string, string | number | boolean>;
  formatNumber?: boolean;
}

const PluralizedText: React.FC<PluralizedTextProps> = ({
  translationKey,
  count,
  className = '',
  options,
  formatNumber: shouldFormatNumber = true
}) => {
  const { tPlural, i18n } = useTranslationWithFallback();

  // Format the number according to the current locale if needed
  const formattedCount = shouldFormatNumber
    ? formatNumber(count, i18n.language)
    : count.toString();

  // Get the translated text with pluralization
  const text = tPlural(translationKey, count, {
    count: formattedCount,
    ...options
  });

  return (
    <span className={className}>
      {text}
    </span>
  );
};

export default PluralizedText; 