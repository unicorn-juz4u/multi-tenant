import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import {
  fetchProjectById,
  updateProject,
  deleteProject,
} from '../features/projects/projectsThunks.js';
import {
  selectProjectById,
  selectProjectsStatus,
  selectProjectsError,
} from '../features/projects/selectors.js';
import { selectCurrentUser, selectIsAdminOrOwner } from '../features/auth/selectors.js';
import { projectFormSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Textarea from '../components/Textarea.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Skeleton from '../components/Skeleton.jsx';
import {
  ArrowLeft,
  Calendar,
  User,
  ShieldCheck,
  Edit2,
  Trash2,
  FolderKanban,
  Clock,
} from 'lucide-react';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Single Source of Truth: Select project directly from normalized Redux store
  const project = useAppSelector((state) => selectProjectById(state, id));
  const status = useAppSelector(selectProjectsStatus);
  const error = useAppSelector(selectProjectsError);
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdminOrOwner = useAppSelector(selectIsAdminOrOwner);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
  }, [dispatch, id]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
  });

  const handleOpenEdit = () => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
      });
      setIsEditOpen(true);
    }
  };

  const handleEdit = async (data) => {
    setIsSubmitting(true);
    const result = await dispatch(updateProject({ id, changes: data }));
    setIsSubmitting(false);
    if (updateProject.fulfilled.match(result)) {
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await dispatch(deleteProject(id));
    setIsSubmitting(false);
    if (deleteProject.fulfilled.match(result)) {
      navigate('/projects', { replace: true });
    }
  };

  const canEdit = () => {
    if (!project) return false;
    if (isAdminOrOwner) return true;
    const creatorId = typeof project.createdBy === 'object' ? project.createdBy?._id || project.createdBy?.id : project.createdBy;
    return creatorId === currentUser?.id;
  };

  const canDelete = () => isAdminOrOwner;

  if (status === 'loading' && !project) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project && status !== 'loading') {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
          <FolderKanban className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Project Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The requested project does not exist or belongs to another tenant organization.
        </p>
        <Link to="/projects">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const creatorName = typeof project.createdBy === 'object' ? project.createdBy?.name : 'Team Member';
  const creatorEmail = typeof project.createdBy === 'object' ? project.createdBy?.email : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {project.name}
            </h1>
            <Badge type="status" value={project.status} />
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Project ID: {project.id}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {canEdit() && (
            <Button variant="secondary" icon={Edit2} onClick={handleOpenEdit}>
              Edit Project
            </Button>
          )}
          {canDelete() && (
            <Button variant="danger" icon={Trash2} onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Details & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description Body */}
        <Card title="Project Overview" className="lg:col-span-2">
          <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {project.description || (
              <span className="italic text-slate-400">No project description provided.</span>
            )}
          </div>
        </Card>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <Card title="Tenant & Metadata">
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tenant Isolation
                </p>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="truncate">{project.tenantId}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Created By
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{creatorName}</p>
                    {creatorEmail && <p className="text-slate-400">{creatorEmail}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Timestamps
                </p>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium">{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Project"
        description="Update project details. Redux single-source-of-truth automatically updates all views."
      >
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <Input
            label="Project Name"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Description"
            rows={4}
            error={errors.description?.message}
            {...register('description')}
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
            error={errors.status?.message}
            {...register('status')}
          />
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
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
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete '${project.name}'?`}
        confirmText="Delete Project"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ProjectDetailPage;
