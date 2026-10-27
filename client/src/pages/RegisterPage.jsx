import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { register as registerUser } from '../features/auth/authThunks.js';
import { selectAuthStatus, selectAuthError } from '../features/auth/selectors.js';
import { registerSchema } from '../utils/validators.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import SEO from '../components/SEO.jsx';
import { Building, User, Mail, Lock, UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isLoading = authStatus === 'loading';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tenantName: '',
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const resultAction = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Create Organization Account"
        description="Register a new multi-tenant organization on SaaSify. Row-level data isolation, dual JWT authentication, and full RBAC."
        keywords="saas registration, create tenant, multi-tenant sign up"
        robots="index, follow"
        canonical="https://saasify.app/register"
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Create Organization
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Register a new tenant and configure your owner account
        </p>
      </div>

      {authError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Organization / Company Name"
          placeholder="e.g. Acme Corporation"
          icon={Building}
          required
          error={errors.tenantName?.message}
          {...register('tenantName')}
        />

        <Input
          label="Your Full Name (Owner)"
          placeholder="e.g. Jane Doe"
          icon={User}
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Work Email Address"
          type="email"
          placeholder="jane@acme.com"
          icon={Mail}
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Master Password"
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
          icon={Lock}
          required
          helperText="Must contain uppercase, lowercase, and a number."
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={UserPlus}
        >
          Create Organization & Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Sign in to your account
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
