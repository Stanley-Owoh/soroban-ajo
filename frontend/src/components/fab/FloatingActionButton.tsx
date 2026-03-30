'use client';

import { Plus, X } from 'lucide-react';
import { useFAB, FABAction } from '@/hooks/useFAB';
import { ActionMenu } from './ActionMenu';

interface FloatingActionButtonProps {
  actions: FABAction[];
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const { isOpen, toggle, close, handleAction } = useFAB(actions);

  return (
    <>
      {/* Main FAB Button */}
      <button
        onClick={toggle}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
        title="Quick actions"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <Plus className="w-7 h-7" />
        )}
      </button>

      {/* Action Menu */}
      <ActionMenu
        actions={actions}
        isOpen={isOpen}
        onActionClick={handleAction}
        onClose={close}
      />
    </>
  );
}
