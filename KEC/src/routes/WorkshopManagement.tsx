import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

interface Workshop {
  id: number;
  name: string;
  location: string;
  imageUrl?: string;
  createdAt?: string;
}

const WorkshopManagement: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("http://localhost:4000/csrf/token", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  // Fetch workshops on mount
  useEffect(() => {
    if (csrfToken) {
      fetchWorkshops();
    }
  }, [csrfToken]);

  const fetchWorkshops = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/workshops", {
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkshops(data);
      }
    } catch (error) {
      console.error("Error fetching workshops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const url = editingWorkshop
        ? `/api/workshops/${editingWorkshop.id}`
        : "/api/workshops";
      const method = editingWorkshop ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (response.ok) {
        await fetchWorkshops();
        handleCloseModal();
      } else {
        alert("Failed to save workshop");
      }
    } catch (error) {
      console.error("Error saving workshop:", error);
      alert("An error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return;

    try {
      const response = await fetch(`/api/workshops/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (response.ok) {
        await fetchWorkshops();
      } else {
        alert("Failed to delete workshop");
      }
    } catch (error) {
      console.error("Error deleting workshop:", error);
      alert("An error occurred while deleting");
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      name: workshop.name,
      location: workshop.location,
      image: null,
    });
    setImagePreview(workshop.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorkshop(null);
    setFormData({ name: "", location: "", image: null });
    setImagePreview("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Workshop Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage workshops</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#034153] text-white font-semibold rounded-lg hover:bg-[#022F40] transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Workshop
          </button>
        </div>
      </div>

      {/* Workshop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && workshops.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034153] mx-auto"></div>
          </div>
        ) : workshops.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No workshops yet. Create your first one!
            </p>
          </div>
        ) : (
          workshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Workshop Image */}
              <div className="h-48 bg-gradient-to-br from-[#034153] to-[#022F40] flex items-center justify-center overflow-hidden">
                {workshop.imageUrl ? (
                  <img
                    src={workshop.imageUrl}
                    alt={workshop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-white/50" />
                )}
              </div>

              {/* Workshop Info */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {workshop.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{workshop.location}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(workshop)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workshop.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingWorkshop ? "Edit Workshop" : "Create New Workshop"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Workshop Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Workshop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent"
                  placeholder="e.g., Advanced Welding Techniques"
                  required
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent"
                    placeholder="e.g., Kigali Workshop Center"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Workshop Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#034153] transition">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, image: null });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Click to upload workshop image
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="workshop-image"
                  />
                  <label
                    htmlFor="workshop-image"
                    className="mt-4 inline-block cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    {imagePreview ? "Change Image" : "Choose Image"}
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-[#034153] text-white font-semibold rounded-lg hover:bg-[#022F40] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Saving..."
                    : editingWorkshop
                    ? "Update Workshop"
                    : "Create Workshop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopManagement;
