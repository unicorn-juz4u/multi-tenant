import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../features/projects/projectsThunks.js';
import {
  selectAllProjects,
  selectProjectsStatus,
  selectProjectsPagination,
  selectProjectsFilters,
} from '../features/projects/selectors.js';
import { selectCurrentUser, selectIsAdminOrOwner } from '../features/auth/selectors.js';
import { setProjectsFilters } from '../features/projects/projectsSlice.js';
import { projectFormSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Textarea from '../components/Textarea.jsx';
import Badge from '../components/Badge.jsx';
import Table from '../components/Table.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ExternalLink,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ProjectsPage = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const status = useAppSelector(selectProjectsStatus);
  const pagination = useAppSelector(selectProjectsPagination);
  const filters = useAppSelector(selectProjectsFilters);
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdminOrOwner = useAppSelector(selectIsAdminOrOwner);

  // Local state only for UI modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects(filters));
  }, [dispatch, filters.page, filters.status, filters.sort, filters.order, filters.search]);

  // Create Form
  const {
    register: regCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
    },
  });

  // Edit Form
  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
  });

  const onOpenEdit = (project) => {
    setEditingProject(project);
    resetEdit({
      name: project.name,
      description: project.description || '',
      status: project.status,
    });
  };

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    const result = await dispatch(createProject(data));
    setIsSubmitting(false);
    if (createProject.fulfilled.match(result)) {
      resetCreate();
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async (data) => {
    if (!editingProject) return;
    setIsSubmitting(true);
    const result = await dispatch(
      updateProject({
        id: editingProject.id,
        changes: data,
      })
    );
    setIsSubmitting(false);
    if (updateProject.fulfilled.match(result)) {
      setEditingProject(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingProjectId) return;
    setIsSubmitting(true);
    await dispatch(deleteProject(deletingProjectId));
    setIsSubmitting(false);
    setDeletingProjectId(null);
  };

  const canEditProject = (project) => {
    if (isAdminOrOwner) return true;
    const creatorId = typeof project.createdBy === 'object' ? project.createdBy?._id || project.createdBy?.id : project.createdBy;
    return creatorId === currentUser?.id;
  };

  const canDeleteProject = () => isAdminOrOwner;

  const tableColumns = [
    {
      header: 'Project Name',
      key: 'name',
      render: (proj) => (
        <div>
          <Link
            to={`/projects/${proj.id}`}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1.5"
          >
            {proj.name}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm mt-0.5">
            {proj.description || 'No description provided'}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (proj) => <Badge type="status" value={proj.status} />,
    },
    {
      header: 'Created By',
      key: 'createdBy',
      render: (proj) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {typeof proj.createdBy === 'object' ? proj.createdBy?.name : 'Member'}
        </span>
      ),
    },
    {
      header: 'Date Created',
      key: 'createdAt',
      render: (proj) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(proj.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (proj) => (
        <div className="flex items-center justify-end gap-1.5">
          {canEditProject(proj) && (
            <button
              type="button"
              onClick={() => onOpenEdit(proj)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit project"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {canDeleteProject() && (
            <button
              type="button"
              onClick={() => setDeletingProjectId(proj.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderMobileCard = (proj) => (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/projects/${proj.id}`}
          className="font-semibold text-base text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400"
        >
          {proj.name}
        </Link>
        <Badge type="status" value={proj.status} />
      </div>
      {proj.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {proj.description}
        </p>
      )}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Created {formatDate(proj.createdAt)}</span>
        <div className="flex items-center gap-2">
          {canEditProject(proj) && (
            <button
              type="button"
              onClick={() => onOpenEdit(proj)}
              className="p-1 text-slate-500 hover:text-brand-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {canDeleteProject() && (
            <button
              type="button"
              onClick={() => setDeletingProjectId(proj.id)}
              className="p-1 text-slate-500 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your organization's isolated projects and tasks
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5">
          <Input
            placeholder="Search projects..."
            icon={Search}
            value={filters.search}
            onChange={(e) => dispatch(setProjectsFilters({ search: e.target.value, page: 1 }))}
          />
        </div>
        <div className="sm:col-span-4 flex gap-2">
          <Select
            value={filters.status}
            onChange={(e) => dispatch(setProjectsFilters({ status: e.target.value, page: 1 }))}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'planning', label: 'Planning' },
              { value: 'completed', label: 'Completed' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
        <div className="sm:col-span-3 flex gap-2">
          <Select
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              dispatch(setProjectsFilters({ sort, order, page: 1 }));
            }}
            options={[
              { value: 'createdAt-desc', label: 'Newest First' },
              { value: 'createdAt-asc', label: 'Oldest First' },
              { value: 'name-asc', label: 'Name (A-Z)' },
              { value: 'name-desc', label: 'Name (Z-A)' },
            ]}
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {status === 'loading' && projects.length === 0 ? (
        <TableSkeleton rows={5} cols={5} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            filters.search || filters.status !== 'all'
              ? 'No projects match your current filters. Try resetting search.'
              : 'Start by creating your first isolated project in this tenant.'
          }
          actionLabel="Create Project"
          onAction={() => setIsCreateOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={tableColumns}
            data={projects}
            renderMobileCard={renderMobileCard}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <p>
                Showing Page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.totalPages}</span> ({pagination.totalItems} total items)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => dispatch(setProjectsFilters({ page: pagination.page - 1 }))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => dispatch(setProjectsFilters({ page: pagination.page + 1 }))}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        description="Add a new project to your tenant workspace."
      >
        <form onSubmit={handleCreateSubmit(handleCreate)} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Apollo Launch Initiative"
            required
            error={createErrors.name?.message}
            {...regCreate('name')}
          />
          <Textarea
            label="Description"
            placeholder="Detailed project summary, objectives, and deliverables..."
            rows={3}
            error={createErrors.description?.message}
            {...regCreate('description')}
          />
          <Select
            label="Initial Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'planning', label: 'Planning' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
            error={createErrors.status?.message}
            {...regCreate('status')}
          />
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        description="Update project details. Changes reflect immediately across the entire app."
      >
        <form onSubmit={handleEditSubmit(handleEdit)} className="space-y-4">
          <Input
            label="Project Name"
            required
            error={editErrors.name?.message}
            {...regEdit('name')}
          />
          <Textarea
            label="Description"
            rows={3}
            error={editErrors.description?.message}
            {...regEdit('description')}
          />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'planning', label: 'Planning' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
            error={editErrors.status?.message}
            {...regEdit('status')}
          />
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingProjectId)}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to permanently delete this project? This action cannot be undone."
        confirmText="Delete Project"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ProjectsPage;
