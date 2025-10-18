import React from "react";


interface Props {
  isOpen: boolean;
  type: "confirm" | "delete" | null;
  course: any;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteModal: React.FC<Props> = ({ isOpen, type, course, onConfirm, onClose }) => {
  if (!isOpen) return null;

  const title = type === "confirm" ? "Confirm Course" : "Delete Course";
  const message =
    type === "confirm"
      ? `Are you sure you want to confirm the course "${course?.title}"?`
      : `Are you sure you want to delete the course "${course?.title}"?`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96 text-center">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="text-gray-600 mb-5">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            Yes
            </button>
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
