import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative w-full ${maxWidth} bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-surface-container flex items-start justify-between bg-surface-container-low/40">
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight">{title}</h3>
            {subtitle && <p className="text-body-sm text-outline mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
