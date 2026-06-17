import React from "react";
import { useToast } from "../Context/ToastContext";

const Toast = ({ toast, onRemove }) => {
  const getStyles = (type) => {
    const styles = {
      success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: "✓",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: "✕",
      },
      warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: "⚠",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: "ℹ",
      },
    };
    return styles[type] || styles.info;
  };

  const style = getStyles(toast.type);

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-center gap-3 mb-3 animate-slideIn shadow-md`}
      role="alert"
    >
      <span className={`${style.text} text-lg font-bold flex-shrink-0`}>
        {style.icon}
      </span>
      <p className={`${style.text} text-sm font-medium flex-1`}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`${style.text} hover:opacity-70 transition flex-shrink-0`}
      >
        ✕
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
