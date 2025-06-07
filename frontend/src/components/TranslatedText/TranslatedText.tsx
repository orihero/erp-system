import React from 'react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { truncateText, wrapText, getTextDirection } from '../../utils/textUtils';

interface TranslatedTextProps {
  translationKey: string;
  fallback?: string;
  maxLength?: number;
  maxWidth?: number;
  className?: string;
  options?: Record<string, string | number | boolean>;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({
  translationKey,
  fallback,
  maxLength,
  maxWidth,
  className = '',
  options
}) => {
  const { tWithFallback } = useTranslationWithFallback();

  // Get the translated text with fallback
  let text = tWithFallback(translationKey, fallback || translationKey, options);

  // Apply text truncation if maxLength is provided
  if (maxLength) {
    text = truncateText(text, maxLength);
  }

  // Apply text wrapping if maxWidth is provided
  const lines = maxWidth ? wrapText(text, maxWidth) : [text];

  // Determine text direction
  const direction = getTextDirection(text);

  return (
    <div
      className={className}
      dir={direction}
      style={{ direction }}
    >
      {lines.map((line, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {line}
        </div>
      ))}
    </div>
  );
};

export default TranslatedText; 