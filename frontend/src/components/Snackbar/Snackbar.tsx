import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../../store/slices/notificationSlice';
import type { RootState } from '../../store';
import { useTranslationWithFallback } from '@/hooks/useTranslationWithFallback';

const Snackbar: React.FC = () => {
  const dispatch = useDispatch();
  const { message, type, open } = useSelector((state: RootState) => state.notification);
  const { tWithFallback } = useTranslationWithFallback();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  if (!open) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type || 'info'];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
      >
        <span>{message}</span>
        <button
          onClick={() => dispatch(hideNotification())}
          className="ml-4 text-white hover:text-gray-200"
          aria-label={tWithFallback('common.close', 'Close')}
        >
          &#10005;
        </button>
      </div>
    </div>
  );
};

export default Snackbar; 