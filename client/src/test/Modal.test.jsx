import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/Modal.jsx';

describe('Modal Component', () => {
  it('renders modal in document.body via portal when isOpen is true', () => {
    const handleClose = vi.fn();
    render(
      <div id="parent-container" style={{ transform: 'translateY(10px)' }}>
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Edit Project"
          description="Update details"
        >
          <div>Modal Inner Content</div>
        </Modal>
      </div>
    );

    const titleElement = screen.getByText('Edit Project');
    expect(titleElement).toBeInTheDocument();
    expect(screen.getByText('Modal Inner Content')).toBeInTheDocument();

    // Verify it is mounted in document.body (portal outside parent-container)
    const dialog = screen.getByRole('dialog');
    expect(document.body).toContainElement(dialog);
    expect(document.getElementById('parent-container')).not.toContainElement(dialog);

    // Verify centered flex container and high z-index
    expect(dialog).toHaveClass('fixed', 'inset-0', 'z-[100]', 'items-center', 'justify-center');
  });

  it('calls onClose when close button or escape is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Body</div>
      </Modal>
    );

    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Hidden">
        <div>Hidden Content</div>
      </Modal>
    );

    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
