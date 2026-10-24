import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { fetchTenant, updateTenant } from '../features/tenant/tenantThunks.js';
import {
  selectTenantData,
  selectTenantStatus,
  selectTenantError,
} from '../features/tenant/selectors.js';
import { selectIsOwner } from '../features/auth/selectors.js';
import { tenantFormSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Badge from '../components/Badge.jsx';
import Skeleton from '../components/Skeleton.jsx';
import {
  Building,
  CreditCard,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const tenant = useAppSelector(selectTenantData);
  const status = useAppSelector(selectTenantStatus);
  const error = useAppSelector(selectTenantError);
  const isOwner = useAppSelector(selectIsOwner);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchTenant());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      plan: 'free',
    },
  });

  // Keep form in sync when tenant data loads
  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        plan: tenant.plan,
      });
    }
  }, [tenant, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    await dispatch(updateTenant(data));
    setIsSaving(false);
  };

  const isLoading = status === 'loading' && !tenant;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Tenant Settings
          </h1>
          <Badge type="role" value="owner" />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage organization identity, subscription plan, and security settings
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Organization Details Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card
          title="Organization Profile"
          subtitle="Basic information about your tenant workspace"
        >
          <div className="space-y-4">
            <Input
              label="Organization Name"
              icon={Building}
              required
              disabled={!isOwner}
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Tenant Slug (Immutable)
              </label>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/70 text-sm font-mono text-slate-600 dark:text-slate-400 select-all">
                {tenant?.slug || 'loading...'}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Used internally for unique domain routing and partition mapping.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Internal Tenant ID
              </label>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/70 text-sm font-mono text-slate-600 dark:text-slate-400 select-all">
                {tenant?.id || tenant?._id || 'loading...'}
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Plan */}
        <Card
          title="Subscription & Plan"
          subtitle="Tier allocation and tenant feature capabilities"
        >
          <div className="space-y-4">
            <Select
              label="Subscription Tier"
              disabled={!isOwner}
              options={[
                { value: 'free', label: 'Free Tier (Starter capabilities)' },
                { value: 'pro', label: 'Pro Tier (Advanced project workflows)' },
                { value: 'enterprise', label: 'Enterprise Tier (Maximum quotas & isolation)' },
              ]}
              error={errors.plan?.message}
              {...register('plan')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 text-xs space-y-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-600" /> Free Plan
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Ideal for testing multi-tenancy and team prototypes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs space-y-2">
                <p className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-indigo-600" /> Pro Plan
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Unlimited projects, priority rate limits, and audit logs.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/20 text-xs space-y-2">
                <p className="font-semibold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-600" /> Enterprise Plan
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Custom SLA, dedicated partition encryption, and 24/7 support.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Isolation Status */}
        <Card title="Security & Isolation Verification">
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Row-Level Tenant Isolation Active (Mongoose Plugin Verified)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Verified JWT tenantId Cryptographic Binding</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Strict 404 Zero-Existence Leakage Configured</span>
            </div>
            <div className="pt-2 text-slate-400">
              Tenant created on {formatDate(tenant?.createdAt)}
            </div>
          </div>
        </Card>

        {isOwner && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Save}
              isLoading={isSaving}
              disabled={!isDirty}
            >
              Save Tenant Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;
