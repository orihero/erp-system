import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { signupStart } from '../../../store/slices/authSlice';

// Define the form schema using zod
const createFormSchema = (t: TFunction) => z.object({
  email: z.string()
    .min(1, t('validation.required', { field: t('auth.email') }))
    .email(t('validation.email')),
  password: z.string()
    .min(1, t('validation.required', { field: t('auth.password') }))
    .min(8, t('validation.minLength', { field: t('auth.password'), min: 8 })),
  confirmPassword: z.string()
    .min(1, t('validation.required', { field: t('auth.confirmPassword') })),
  companyName: z.string()
    .min(1, t('validation.required', { field: t('auth.companyName') }))
    .min(2, t('validation.minLength', { field: t('auth.companyName'), min: 2 })),
  employeeCount: z.string()
    .min(1, t('validation.required', { field: t('auth.employeeCount') }))
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordMatch'),
  path: ['confirmPassword']
});

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

const SignupForm: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error: reduxError } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = createFormSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    dispatch(signupStart({
        email: data.email,
        password: data.password,
        company_name: data.companyName,
        employee_count: data.employeeCount
    }));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.companyName')}*</label>
        <input
          type="text"
          {...register('companyName')}
          placeholder={t('auth.companyName')}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.companyName ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.employeeCount')}*</label>
        <select
          {...register('employeeCount')}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.employeeCount ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="">{t('auth.selectCompanySize')}</option>
          {Object.entries(t('auth.companySizes', { returnObjects: true })).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.employeeCount && (
          <p className="mt-1 text-sm text-red-500">{errors.employeeCount.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}*</label>
      <input
        type="email"
          {...register('email')}
        placeholder={t('signup.emailPlaceholder', 'mail@website.com')}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-200'
          }`}
        autoComplete="email"
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
            {...register('password')}
            placeholder={t('auth.password')}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            }`}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="absolute right-2 top-2 text-xs text-blue-600"
            onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
            {showPassword ? t('signup.hide', 'Hide') : t('signup.show', 'Show')}
        </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}*</label>
      <input
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          placeholder={t('auth.confirmPassword')}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
          }`}
        autoComplete="new-password"
      />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      {reduxError && <div className="text-red-500 text-sm">{reduxError}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? t('common.loading') : t('common.register')}
      </button>
      <div className="text-center text-sm mt-2">
        {t('auth.alreadyHaveAccount')}{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          {t('common.login')}
        </a>
      </div>
    </form>
  );
};

export default SignupForm; 