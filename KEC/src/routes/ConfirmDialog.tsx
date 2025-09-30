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
  title = "Delete User",
  message,
  avatar,
  name,
  role,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-red-600">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* User Info */}
        {avatar && name && role && (
          <div className="flex items-center gap-4 mb-6">
            <img
              src={avatar}
              alt={`${name}'s avatar`}
              className="w-16 h-16 object-cover rounded-full shadow-md"
            />
            <div>
              <h3 className="text-base font-semibold">{name}</h3>
              <p className="text-gray-600 text-sm">{role}</p>
            </div>
          </div>
        )}

        {/* Message */}
        <p className="text-gray-700 text-sm mb-6">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer text-sm font-medium shadow"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
