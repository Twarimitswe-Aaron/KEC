import React from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <p className="text-gray-800 text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
