import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { login } from '../features/auth/authThunks.js';
import { selectAuthStatus, selectAuthError } from '../features/auth/selectors.js';
import { loginSchema } from '../utils/validators.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import SEO from '../components/SEO.jsx';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isLoading = authStatus === 'loading';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const resultAction = await dispatch(login(data));
    if (login.fulfilled.match(resultAction)) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  };

  const handleQuickFill = (email, password = 'Test@1234') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Sign In"
        description="Sign in to access your secure, isolated multi-tenant enterprise workspace on SaaSify."
        keywords="saas login, multi-tenant sign in, secure enterprise workspace"
        robots="index, follow"
        canonical="https://saasify.app/login"
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign In
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Access your isolated tenant environment
        </p>
      </div>

      {authError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Demo Quick Login (Click to fill)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill('owner@acme.test')}
            className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="font-semibold block text-slate-800 dark:text-slate-200">Acme Owner</span>
            <span className="text-[11px] text-slate-400">owner@acme.test</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@acme.test')}
            className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="font-semibold block text-slate-800 dark:text-slate-200">Acme Admin</span>
            <span className="text-[11px] text-slate-400">admin@acme.test</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('member@acme.test')}
            className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="font-semibold block text-slate-800 dark:text-slate-200">Acme Member</span>
            <span className="text-[11px] text-slate-400">member@acme.test</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('owner@globex.test')}
            className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="font-semibold block text-slate-800 dark:text-slate-200">Globex Owner</span>
            <span className="text-[11px] text-slate-400">owner@globex.test</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
        Need to register a new tenant?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Create Organization
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
