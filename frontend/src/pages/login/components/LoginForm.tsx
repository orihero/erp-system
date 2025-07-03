import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as z from 'zod';
import type { RootState } from '../../../store';
import { useAppDispatch } from '../../../store/hooks';
import { loginStart } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean()
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigation = useSelector((state: RootState) => state.navigation.modules);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'superadmin@demo.com',
      password: 'password123',
      remember: false
    }
  });

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    // @ts-expect-error Redux Toolkit typing quirk
    dispatch(loginStart(data));
  };

  useEffect(() => {
    if (isAuthenticated && Array.isArray(navigation) && navigation.length > 0) {
      // Find the first directory with type 'module' in any module
      let firstModuleDirectoryPath: string | null = null;
      for (const module of navigation) {
        if (Array.isArray(module.directories)) {
          const dir = module.directories.find(d => d.directory_type === 'Module');
          if (dir && dir.id) {
            firstModuleDirectoryPath = `/directories/${dir.id}`;
            break;
          }
        }
      }
      if (firstModuleDirectoryPath) {
        navigate(firstModuleDirectoryPath, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, navigation, navigate]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="on"
      noValidate
    >
      <button
        type="button"
        className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 mb-2 bg-white hover:bg-gray-50 transition"
        disabled
      >
        <img src="https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/3:2/w_2560%2Cc_limit/google-logo.jpg" alt="Google" className="w-8 h-5" />
        <span className="font-medium text-gray-700">{t('login.google', 'Sign in with Google')}</span>
      </button>
      <div className="text-center text-gray-400 text-xs mb-2">{t('login.orEmail', 'or Sign in with Email')}</div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}*</label>
        <input
          type="email"
          placeholder={t('login.emailPlaceholder', 'mail@website.com')}
          className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}*</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('login.min8', 'Min. 8 character')}
            className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-xs text-blue-600"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? t('login.hide', 'Hide') : t('login.show', 'Show')}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            className="mr-2 accent-blue-600"
            {...register('remember')}
          />
          <span className="text-gray-700">{t('login.rememberMe', 'Remember me')}</span>
        </label>
        <a href="/forgot-password" className="text-blue-600 text-sm hover:underline">
          {t('auth.forgotPassword')}
        </a>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? t('login.loggingIn', 'Logging in...') : t('common.login')}
      </button>
      <div className="text-center text-sm text-gray-600">
        {t('login.notRegistered', 'Not registered yet?')}{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          {t('login.createAccount', 'Create an Account')}
        </a>
      </div>
    </form>
  );
};

export default LoginForm; 