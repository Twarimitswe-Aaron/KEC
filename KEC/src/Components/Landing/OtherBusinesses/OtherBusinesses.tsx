import React, { useState, ChangeEvent } from "react";
import {
  Upload,
  X,
  Wrench,
  FileText,
  Phone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  getProvinces,
  getDistricts,
  getSectors,
} from "../../../constants/rwanda-locations";
import { useSubmitServiceRequestMutation } from "../../../state/api/authApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface FormErrors {
  phone?: string;
  name?: string;
  location?: string;
  serviceType?: string;
  equipmentDescription?: string;
  [key: string]: string | undefined;
}

interface FormData {
  phone: string;
  name: string;
  location: string;
  email: string;
  serviceType: string;
  equipmentDescription: string;
  problemDescription: string;
  problemImage: string | null;
  installationDetails: string;
  preferredDate: string;
  preferredTime: string;
  urgencyLevel: string;
}

export default function KECServiceForm() {
  const navigate = useNavigate();
  const [submitRequest, { isLoading }] = useSubmitServiceRequestMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    name: "",
    location: "",
    email: "",
    serviceType: "",
    equipmentDescription: "",
    problemDescription: "",
    problemImage: null,
    installationDetails: "",
    preferredDate: "",
    preferredTime: "",
    urgencyLevel: "Normal",
  });

  // Location Dropdown State
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const provinces = getProvinces();
  const districts = selectedProvince ? getDistricts(selectedProvince) : [];
  const sectors =
    selectedProvince && selectedDistrict
      ? getSectors(selectedProvince, selectedDistrict)
      : [];

  const [errors, setErrors] = useState<FormErrors>({});
  const [problemImagePreview, setProblemImagePreview] = useState<string | null>(
    null
  );

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          setProblemImagePreview(reader.result);
          setFormData((prev) => ({
            ...prev,
            problemImage: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProblemImagePreview(null);
    setFormData((prev) => ({ ...prev, problemImage: null }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (
      !selectedProvince ||
      !selectedDistrict ||
      !selectedSector ||
      !formData.location
    )
      newErrors.location = "Complete location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.serviceType)
      newErrors.serviceType = "Please select a service type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.serviceType === "repair" && !formData.equipmentDescription) {
      newErrors.equipmentDescription = "Please describe the equipment";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    let isValid = false;

    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else isValid = true;

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    try {
      await submitRequest({
        ...formData,
        problemImage: formData.problemImage || undefined,
        province: selectedProvince,
        district: selectedDistrict,
        sector: selectedSector,
        serviceType: formData.serviceType.toUpperCase(),
      }).unwrap();
      toast.success(
        "Service request submitted successfully! We will contact you shortly."
      );
      navigate("/");
    } catch (error) {
      console.error("Failed to submit request:", error);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-[95%] max-w-[1440px] mx-auto border-x border-gray-200">
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              KEC Equipment Services
            </h1>
            <p className="text-lg text-gray-600">Quick & Easy Service Request</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {progressPercentage.toFixed(0)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gray-900 h-2 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span
                className={currentStep === 1 ? "font-semibold text-gray-900" : ""}
              >
                Contact
              </span>
              <span
                className={currentStep === 2 ? "font-semibold text-gray-900" : ""}
              >
                Service Type
              </span>
              <span
                className={currentStep === 3 ? "font-semibold text-gray-900" : ""}
              >
                Details
              </span>
              <span
                className={currentStep === 4 ? "font-semibold text-gray-900" : ""}
              >
                Schedule
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Contact Information
                    </h2>
                    <p className="text-sm text-gray-600">
                      Let us know how to reach you
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                      placeholder="+250 788 123 456"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <select
                        value={selectedProvince}
                        onChange={(e) => {
                          setSelectedProvince(e.target.value);
                          setSelectedDistrict("");
                          setSelectedSector("");
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                      >
                        <option value="">Select Province</option>
                        {provinces.map((p: string) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          setSelectedSector("");
                        }}
                        disabled={!selectedProvince}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white disabled:bg-gray-100"
                      >
                        <option value="">Select District</option>
                        {districts.map((d: string) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        disabled={!selectedDistrict}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white disabled:bg-gray-100"
                      >
                        <option value="">Select Sector</option>
                        {sectors.map((s: string) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Specific address (e.g., Street name, House number)"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email{" "}
                      <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Service Type */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Service Type
                    </h2>
                    <p className="text-sm text-gray-600">
                      What service do you need?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange("serviceType", "installation")}
                    className={`p-8 border-2 rounded-xl transition-all text-center ${formData.serviceType === "installation"
                        ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <Wrench
                      size={40}
                      className={`mx-auto mb-4 ${formData.serviceType === "installation"
                          ? "text-gray-900"
                          : "text-gray-400"
                        }`}
                    />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Installation
                    </h3>
                    <p className="text-sm text-gray-600">
                      New equipment installation
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange("serviceType", "repair")}
                    className={`p-8 border-2 rounded-xl transition-all text-center ${formData.serviceType === "repair"
                        ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <FileText
                      size={40}
                      className={`mx-auto mb-4 ${formData.serviceType === "repair"
                          ? "text-gray-900"
                          : "text-gray-400"
                        }`}
                    />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Repair / Fix
                    </h3>
                    <p className="text-sm text-gray-600">
                      Fix existing equipment
                    </p>
                  </button>
                </div>
                {errors.serviceType && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.serviceType}
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Service Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Service Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tell us more about your request
                    </p>
                  </div>
                </div>

                {formData.serviceType === "installation" ? (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      What would you like us to install?
                    </label>
                    <textarea
                      value={formData.installationDetails}
                      onChange={(e) =>
                        handleChange("installationDetails", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      rows={5}
                      placeholder="Describe the equipment or system you need installed..."
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Equipment Name/Type{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.equipmentDescription}
                        onChange={(e) =>
                          handleChange("equipmentDescription", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="e.g., Kitchen Hood, Refrigerator, HVAC System"
                      />
                      {errors.equipmentDescription && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.equipmentDescription}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Problem Description
                      </label>
                      <textarea
                        value={formData.problemDescription}
                        onChange={(e) =>
                          handleChange("problemDescription", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        rows={4}
                        placeholder="Describe the problem you're experiencing..."
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Problem Image{" "}
                        <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition">
                          <Upload size={18} /> Upload Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {problemImagePreview && (
                          <div className="relative">
                            <img
                              src={problemImagePreview}
                              alt="Problem"
                              className="w-20 h-20 object-cover rounded border-2 border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Scheduling */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Scheduling
                    </h2>
                    <p className="text-sm text-gray-600">
                      When would you like us to come?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) =>
                        handleChange("preferredDate", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Preferred Time
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["Morning", "Afternoon", "Anytime"].map((time) => (
                        <label
                          key={time}
                          className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 rounded-lg transition-all hover:border-gray-400"
                          style={{
                            borderColor:
                              formData.preferredTime === time
                                ? "#111"
                                : "#d1d5db",
                            backgroundColor:
                              formData.preferredTime === time
                                ? "#f9fafb"
                                : "white",
                          }}
                        >
                          <input
                            type="radio"
                            name="preferredTime"
                            value={time}
                            checked={formData.preferredTime === time}
                            onChange={(e) =>
                              handleChange("preferredTime", e.target.value)
                            }
                            className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {time}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Urgency Level
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["Normal", "Urgent", "Emergency"].map((level) => (
                        <label
                          key={level}
                          className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 rounded-lg transition-all hover:border-gray-400"
                          style={{
                            borderColor:
                              formData.urgencyLevel === level
                                ? "#111"
                                : "#d1d5db",
                            backgroundColor:
                              formData.urgencyLevel === level
                                ? "#f9fafb"
                                : "white",
                          }}
                        >
                          <input
                            type="radio"
                            name="urgencyLevel"
                            value={level}
                            checked={formData.urgencyLevel === level}
                            onChange={(e) =>
                              handleChange("urgencyLevel", e.target.value)
                            }
                            className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                          />
                          <span
                            className={`text-sm font-medium ${level === "Emergency"
                                ? "text-red-600"
                                : "text-gray-700"
                              }`}
                          >
                            {level}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className={`px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition flex items-center gap-2 ${currentStep === 1 ? "ml-auto" : ""
                    }`}
                >
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Submitting..." : "Submit Request"}
                </button>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Need Assistance?
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-700" />
                <span className="text-gray-700">+250 788 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Wrench size={16} className="text-gray-700" />
                <span className="text-gray-700">
                  Mon - Fri: 8:00 AM - 6:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
