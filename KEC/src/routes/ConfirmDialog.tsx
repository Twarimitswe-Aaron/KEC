import React from "react";
import { IoClose } from "react-icons/io5";

type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  avatar?: string;
  name?: string;
  role?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = "Confirm Action",
  message,
  avatar,
  name,
  role,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-100">
      <div className="bg-white rounded-lg shadow-lg p-4 w-72 max-w-xs">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-red-600">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 cursor-pointer hover:text-gray-700"
          >
            <IoClose size={20} />
          </button>
        </div>

        {avatar && name && role && (
          <div className="flex items-center gap-3 mb-4">
            <img
              src={avatar}
              alt={`${name}'s avatar`}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-sm font-semibold">{name}</h3>
              <p className="text-gray-500 text-xs">{role}</p>
            </div>
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-gray-600 cursor-pointer bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-white bg-red-600 cursor-pointer rounded-md hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
