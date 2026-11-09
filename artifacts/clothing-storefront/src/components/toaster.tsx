import { dismissToast, toastStore } from '@/lib/shop-store';

export function Toaster() {
  const toast = toastStore.use();
  return (
    // The live region stays mounted so screen readers announce each message as it arrives.
    <div className="toast-region" role="status" data-testid="status-added-to-bag">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                const { run } = toast.action!;
                dismissToast();
                run();
              }}
              data-testid="button-toast-action"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
