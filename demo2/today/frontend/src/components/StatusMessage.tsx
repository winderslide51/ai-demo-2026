import type { ReactNode } from 'react';

export type StatusTone = 'pending' | 'success' | 'danger';

export interface StatusMessageAction {
  label: string;
  onClick: () => void;
}

export interface StatusMessageProps {
  tone: StatusTone;
  title: string;
  description?: ReactNode;
  action?: StatusMessageAction;
}

/**
 * Pure presentation for the three remote states. Status is always conveyed by
 * text, never by colour alone (see `.claude/rules/react-dont.md`).
 */
export function StatusMessage({ tone, title, description, action }: StatusMessageProps) {
  const role = tone === 'danger' ? 'alert' : 'status';

  return (
    <div className={`status-message status-message--${tone}`} role={role}>
      <p className="status-message__title">{title}</p>
      {description !== undefined && <p className="status-message__description">{description}</p>}
      {action !== undefined && (
        <button type="button" className="status-message__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
