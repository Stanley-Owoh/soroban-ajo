import { useState, useCallback } from 'react';

export interface FABAction {
  id: string;
  label: string;
  icon: any;
  onClick: () => void;
  color?: string;
}

export function useFAB(actions: FABAction[] = []) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleAction = useCallback((action: FABAction) => {
    action.onClick();
    close();
  }, [close]);

  return {
    isOpen,
    toggle,
    close,
    handleAction,
    actions,
  };
}
