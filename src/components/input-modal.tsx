'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export interface InputModalProps {
  isOpen: boolean;
  title: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string;
  onConfirm: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

export function InputModal({
  isOpen,
  title,
  label,
  placeholder = '',
  type = 'text',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!value.trim()) {
      setLocalError('This field is required');
      return;
    }
    try {
      await onConfirm(value);
      setValue('');
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancel = () => {
    setValue('');
    setLocalError(null);
    onCancel();
  };

  const currentError = error || localError;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border-2 border-blue-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">{label}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setLocalError(null);
              }}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            {currentError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{currentError}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
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