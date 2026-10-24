import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="sm:flex sm:items-start gap-4">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
        <Button
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto mt-2 sm:mt-0"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
