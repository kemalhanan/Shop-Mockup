import { type MouseEvent, type ReactNode, useLayoutEffect, useRef } from 'react';

type ModalProps = {
  className: string;
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
};

/**
 * A native modal dialog, which brings focus containment, Escape handling and an inert page for free.
 * Render it only while open: it opens on mount, and closing it on unmount hands focus back to the
 * element that opened it. Nothing outside it can be clicked while it's open, toasts included.
 */
export function Modal({ className, labelledBy, onClose, children, testId }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    // The page's scrollbar goes away while a dialog is open. The stylesheet pads this width back in so nothing shifts.
    const root = document.documentElement;
    root.style.setProperty('--scrollbar-width', `${window.innerWidth - root.clientWidth}px`);
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => dialog.close();
  }, []);

  // A press on the panel's own padding also targets the dialog, so the pointer position has to be checked too.
  const isOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return false;
    const panel = event.currentTarget.getBoundingClientRect();
    return event.clientX < panel.left || event.clientX > panel.right || event.clientY < panel.top || event.clientY > panel.bottom;
  };

  // Requiring the press to start on the backdrop stops a text selection dragged out of the panel from closing it.
  const onMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
    pressedBackdrop.current = isOnBackdrop(event);
  };
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (pressedBackdrop.current && isOnBackdrop(event)) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={className}
      aria-labelledby={labelledBy}
      data-testid={testId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {children}
    </dialog>
  );
}
