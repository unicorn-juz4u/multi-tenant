import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../features/users/usersThunks.js';
import {
  selectAllUsers,
  selectUsersStatus,
  selectUsersPagination,
  selectUsersFilters,
} from '../features/users/selectors.js';
import { selectCurrentUser, selectIsOwner } from '../features/auth/selectors.js';
import { setUsersFilters } from '../features/users/usersSlice.js';
import { userFormSchema, userEditSchema } from '../utils/validators.js';
import { formatDate, getInitials } from '../utils/formatters.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Badge from '../components/Badge.jsx';
import Table from '../components/Table.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';
import {
  UserPlus,
  Search,
  Users,
  Edit2,
  Trash2,
  Shield,
  Check,
  XCircle,
} from 'lucide-react';

export const TeamPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const status = useAppSelector(selectUsersStatus);
  const pagination = useAppSelector(selectUsersPagination);
  const filters = useAppSelector(selectUsersFilters);
  const currentUser = useAppSelector(selectCurrentUser);
  const isOwner = useAppSelector(selectIsOwner);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters.page, filters.role, filters.search]);

  // Create User Form
  const {
    register: regCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'member',
    },
  });

  // Edit User Form
  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(userEditSchema),
  });

  const onOpenEdit = (user) => {
    setEditingUser(user);
    resetEdit({
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    const result = await dispatch(createUser(data));
    setIsSubmitting(false);
    if (createUser.fulfilled.match(result)) {
      resetCreate();
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async (data) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    const result = await dispatch(updateUser({ id: editingUser.id, changes: data }));
    setIsSubmitting(false);
    if (updateUser.fulfilled.match(result)) {
      setEditingUser(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingUserId) return;
    setIsSubmitting(true);
    await dispatch(deleteUser(deletingUserId));
    setIsSubmitting(false);
    setDeletingUserId(null);
  };

  const canModifyUser = (targetUser) => {
    if (targetUser.role === 'owner') return false; // Cannot delete or alter owner from team list
    if (isOwner) return true;
    // Admins cannot modify or delete other admins
    if (currentUser?.role === 'admin' && targetUser.role === 'admin') return false;
    return true;
  };

  const tableColumns = [
    {
      header: 'Team Member',
      key: 'name',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
            {getInitials(u.name)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              {u.name}
              {u.id === currentUser?.id && (
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-normal">
                  (You)
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (u) => <Badge type="role" value={u.role} />,
    },
    {
      header: 'Status',
      key: 'isActive',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          {u.isActive ? (
            <>
              <Check className="h-3.5 w-3.5" /> Active
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" /> Deactivated
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Joined',
      key: 'createdAt',
      render: (u) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          {canModifyUser(u) && (
            <>
              <button
                type="button"
                onClick={() => onOpenEdit(u)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit member"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingUserId(u.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Remove member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const renderMobileCard = (u) => (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
            {getInitials(u.name)}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{u.name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
        <Badge type="role" value={u.role} />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className={u.isActive ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
          {u.isActive ? 'Active' : 'Deactivated'}
        </span>
        {canModifyUser(u) && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEdit(u)}
              className="p-1 text-slate-500 hover:text-brand-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingUserId(u.id)}
              className="p-1 text-slate-500 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage user roles and invitations inside your tenant
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setIsCreateOpen(true)}>
          Add Member
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8">
          <Input
            placeholder="Search team members by name or email..."
            icon={Search}
            value={filters.search}
            onChange={(e) => dispatch(setUsersFilters({ search: e.target.value, page: 1 }))}
          />
        </div>
        <div className="sm:col-span-4">
          <Select
            value={filters.role}
            onChange={(e) => dispatch(setUsersFilters({ role: e.target.value, page: 1 }))}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'owner', label: 'Owners' },
              { value: 'admin', label: 'Admins' },
              { value: 'member', label: 'Members' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {status === 'loading' && users.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members found"
          description="Invite or add new users into this tenant organization."
          actionLabel="Add Member"
          onAction={() => setIsCreateOpen(true)}
          actionIcon={UserPlus}
        />
      ) : (
        <Table columns={tableColumns} data={users} renderMobileCard={renderMobileCard} />
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Team Member"
        description="Create an account scoped strictly to your organization."
      >
        <form onSubmit={handleCreateSubmit(handleCreate)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Smith"
            required
            error={createErrors.name?.message}
            {...regCreate('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@company.com"
            required
            error={createErrors.email?.message}
            {...regCreate('email')}
          />
          <Input
            label="Temporary Password"
            type="password"
            placeholder="Min 8 chars, uppercase, lowercase, number"
            required
            error={createErrors.password?.message}
            {...regCreate('password')}
          />
          <Select
            label="Role"
            options={[
              { value: 'member', label: 'Member (Read projects, manage own projects)' },
              { value: 'admin', label: 'Admin (Manage team and all projects)' },
            ]}
            error={createErrors.role?.message}
            {...regCreate('role')}
          />
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Edit Team Member"
        description="Update role and account activity status."
      >
        <form onSubmit={handleEditSubmit(handleEdit)} className="space-y-4">
          <Input
            label="Full Name"
            required
            error={editErrors.name?.message}
            {...regEdit('name')}
          />
          <Select
            label="Role"
            options={[
              { value: 'member', label: 'Member' },
              { value: 'admin', label: 'Admin' },
            ]}
            error={editErrors.role?.message}
            {...regEdit('role')}
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
              {...regEdit('isActive')}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Account is Active
            </label>
          </div>
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingUserId)}
        onClose={() => setDeletingUserId(null)}
        onConfirm={handleDelete}
        title="Remove Team Member"
        message="Are you sure you want to remove this member from your organization? They will immediately lose access."
        confirmText="Remove Member"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TeamPage;
