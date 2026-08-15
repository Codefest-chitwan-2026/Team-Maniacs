'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const typeStyles = {
    warning: {
      border: 'border-amber-500/50',
      icon: 'text-amber-500',
      button: 'bg-amber-600 hover:bg-amber-700',
      iconBg: 'bg-amber-600/10',
    },
    danger: {
      border: 'border-red-500/50',
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-600/10',
    },
    info: {
      border: 'border-blue-500/50',
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-600/10',
    },
  };

  const styles = typeStyles[type];
  const Icon = type === 'danger' || type === 'warning' ? AlertTriangle : CheckCircle;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-navy-900 border-2 ${styles.border} rounded-2xl p-6 max-w-sm w-full shadow-2xl relative`}>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 rounded-full ${styles.iconBg} border-2 ${styles.icon} border-current flex items-center justify-center`}>
            <Icon className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-300 mt-2">{message}</p>
          </div>

          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 ${styles.button} text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}