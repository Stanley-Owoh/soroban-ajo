'use client';

import { FABAction } from '@/hooks/useFAB';
import { X } from 'lucide-react';

interface ActionMenuProps {
  actions: FABAction[];
  isOpen: boolean;
  onActionClick: (action: FABAction) => void;
  onClose: () => void;
}

export function ActionMenu({ actions, isOpen, onActionClick, onClose }: ActionMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed bottom-24 right-6 z-40 space-y-3">
        {actions.map((action, index) => (
          <div
            key={action.id}
            className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <span className="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
              {action.label}
            </span>
            <button
              onClick={() => onActionClick(action)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 ${
                action.color || 'bg-blue-500 hover:bg-blue-600'
              }`}
              title={action.label}
            >
              <action.icon className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
