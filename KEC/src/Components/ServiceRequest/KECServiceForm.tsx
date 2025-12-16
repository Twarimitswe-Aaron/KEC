import React, { useState, ChangeEvent } from "react";
import {
    Upload,
    X,
    Wrench,
    FileText,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Clock,
    Zap,
} from "lucide-react";
import {
    getProvinces,
    getDistricts,
    getSectors,
} from "../../constants/rwanda-locations";
import { useSubmitServiceRequestMutation } from "../../state/api/authApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
            !selectedSector
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

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <section className="w-[95%] mx-auto max-w-[1440px] border-x border-gray-200 py-16 bg-white" id="service-request">
            <div className="w-[94%] mx-auto max-w-[1440px]">
                <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-12 lg:gap-[50px]">

                    {/* Left Column: Header */}
                    <div className="flex flex-col justify-start">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-[25px] mb-6 w-fit"
                        >
                            <span className="text-[#FF4726] font-medium text-sm">//</span>
                            <span className="text-sm font-medium tracking-wide">Service Request</span>
                            <span className="text-[#FF4726] font-medium text-sm">//</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#151619] tracking-tight leading-[1.1] mb-4">
                            Professional <br /> <span className="text-[#4f4f4f]">Assistance.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
                            Submit your request and our expert team will handle the installation or repair of your equipment efficiently.
                        </p>

                        {/* Optional: Add some trust indicators/icons here if needed */}
                    </div>

                    {/* Right Column: The Form */}
                    <div className="flex flex-col p-2 bg-[#e5e5e5] rounded-[17px] gap-2">
                        <div
                            className="w-full relative overflow-hidden bg-[#F0F0F0] rounded-[16px] shadow-[0_10px_10px_-2.75px_rgba(0,0,0,0.07)]"
                        >
                            <div className="flex bg-white flex-col p-6 sm:p-8">
                                {/* Progress Bar inside the card */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#151619] tracking-widest uppercase">
                                            Step {currentStep} <span className="text-gray-300">//</span> {totalSteps}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {progressPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                        <motion.div
                                            className="bg-[#FF4726] h-1"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            variants={fadeIn}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between w-full mb-4">
                                                <h3 className="font-sans font-semibold text-[1.2rem] text-[#151619] text-left pr-4 leading-[1.2em] tracking-[-0.05em]">
                                                    Contact Information
                                                </h3>
                                            </div>

                                            {/* Horizontal Alignment for Contact Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                                <div>
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        Phone Number <span className="text-[#FF4726]">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => handleChange("phone", e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                        placeholder="+250 788 123 456"
                                                    />
                                                    {errors.phone && <p className="text-[#FF4726] text-xs mt-1 font-medium">{errors.phone}</p>}
                                                </div>

                                                <div>
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        Your Name <span className="text-[#FF4726]">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => handleChange("name", e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                        placeholder="Enter your name"
                                                    />
                                                    {errors.name && <p className="text-[#FF4726] text-xs mt-1 font-medium">{errors.name}</p>}
                                                </div>

                                                {/* Wide Location Row */}
                                                <div className="md:col-span-2 space-y-4 pt-2">
                                                    <div>
                                                        <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                            Location <span className="text-[#FF4726]">*</span>
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                                                            <select
                                                                value={selectedProvince}
                                                                onChange={(e) => {
                                                                    setSelectedProvince(e.target.value);
                                                                    setSelectedDistrict("");
                                                                    setSelectedSector("");
                                                                }}
                                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] text-sm outline-none"
                                                            >
                                                                <option value="">Select Province</option>
                                                                {provinces.map((p: string) => (
                                                                    <option key={p} value={p}>{p}</option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                value={selectedDistrict}
                                                                onChange={(e) => {
                                                                    setSelectedDistrict(e.target.value);
                                                                    setSelectedSector("");
                                                                }}
                                                                disabled={!selectedProvince}
                                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] disabled:opacity-50 text-sm outline-none"
                                                            >
                                                                <option value="">Select District</option>
                                                                {districts.map((d: string) => (
                                                                    <option key={d} value={d}>{d}</option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                value={selectedSector}
                                                                onChange={(e) => setSelectedSector(e.target.value)}
                                                                disabled={!selectedDistrict}
                                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] disabled:opacity-50 text-sm outline-none"
                                                            >
                                                                <option value="">Select Sector</option>
                                                                {sectors.map((s: string) => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {errors.location && <p className="text-[#FF4726] text-xs mt-1 font-medium">{errors.location}</p>}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        Email <span className="text-xs text-gray-400 normal-case">(optional)</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => handleChange("email", e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                        placeholder="your.email@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Service Type */}
                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            variants={fadeIn}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between w-full mb-4">
                                                <h3 className="font-sans font-semibold text-[1.2rem] text-[#151619] text-left pr-4 leading-[1.2em] tracking-[-0.05em]">
                                                    Service Type
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange("serviceType", "installation")}
                                                    className={`px-6 py-5 border rounded-xl transition-all duration-200 flex items-center justify-center gap-4 group ${formData.serviceType === "installation"
                                                        ? "border-[#151619] bg-[#151619] text-white shadow-md"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <Wrench
                                                        size={20}
                                                        className={formData.serviceType === "installation" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}
                                                    />
                                                    <div className="text-left">
                                                        <h3 className={`font-bold text-sm leading-tight ${formData.serviceType === "installation" ? "text-white" : "text-[#151619]"}`}>Installation</h3>
                                                        <p className={`text-xs mt-0.5 ${formData.serviceType === "installation" ? "text-gray-300" : "text-gray-500"}`}>New equipment</p>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleChange("serviceType", "repair")}
                                                    className={`px-6 py-5 border rounded-xl transition-all duration-200 flex items-center justify-center gap-4 group ${formData.serviceType === "repair"
                                                        ? "border-[#151619] bg-[#151619] text-white shadow-md"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <FileText
                                                        size={20}
                                                        className={formData.serviceType === "repair" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}
                                                    />
                                                    <div className="text-left">
                                                        <h3 className={`font-bold text-sm leading-tight ${formData.serviceType === "repair" ? "text-white" : "text-[#151619]"}`}>Repair / Fix</h3>
                                                        <p className={`text-xs mt-0.5 ${formData.serviceType === "repair" ? "text-gray-300" : "text-gray-500"}`}>Fix existing</p>
                                                    </div>
                                                </button>
                                            </div>
                                            {errors.serviceType && <p className="text-[#FF4726] text-sm mt-2 font-medium">{errors.serviceType}</p>}
                                        </motion.div>
                                    )}

                                    {/* Step 3: Service Details */}
                                    {currentStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            variants={fadeIn}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between w-full mb-4">
                                                <h3 className="font-sans font-semibold text-[1.2rem] text-[#151619] text-left pr-4 leading-[1.2em] tracking-[-0.05em]">
                                                    Service Details
                                                </h3>
                                            </div>

                                            {formData.serviceType === "installation" ? (
                                                <div>
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        What would you like us to install?
                                                    </label>
                                                    <textarea
                                                        value={formData.installationDetails}
                                                        onChange={(e) => handleChange("installationDetails", e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                        rows={5}
                                                        placeholder="Describe the equipment or system..."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                            Equipment Name/Type <span className="text-[#FF4726]">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.equipmentDescription}
                                                            onChange={(e) => handleChange("equipmentDescription", e.target.value)}
                                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                            placeholder="e.g., Kitchen Hood, Refrigerator"
                                                        />
                                                        {errors.equipmentDescription && <p className="text-[#FF4726] text-xs mt-1 font-medium">{errors.equipmentDescription}</p>}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                            Problem Description
                                                        </label>
                                                        <textarea
                                                            value={formData.problemDescription}
                                                            onChange={(e) => handleChange("problemDescription", e.target.value)}
                                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                            rows={4}
                                                            placeholder="Describe the problem..."
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                            Problem Image <span className="text-xs text-gray-400 normal-case">(optional)</span>
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 transition text-sm">
                                                                <Upload size={16} /> Upload Image
                                                                <input
                                                                    type="file"
                                                                    accept="image/jpeg,image/png"
                                                                    onChange={handleImageUpload}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                            {problemImagePreview && (
                                                                <div className="relative group">
                                                                    <img
                                                                        src={problemImagePreview}
                                                                        alt="Problem"
                                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={removeImage}
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 4: Scheduling */}
                                    {currentStep === 4 && (
                                        <motion.div
                                            key="step4"
                                            variants={fadeIn}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between w-full mb-4">
                                                <h3 className="font-sans font-semibold text-[1.2rem] text-[#151619] text-left pr-4 leading-[1.2em] tracking-[-0.05em]">
                                                    Scheduling
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                                <div>
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        Preferred Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.preferredDate}
                                                        onChange={(e) => handleChange("preferredDate", e.target.value)}
                                                        min={new Date().toISOString().split("T")[0]}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#151619] focus:border-[#151619] text-[#151619] transition-all text-sm outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        Preferred Time
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Morning", "Afternoon", "Anytime"].map((time) => (
                                                            <label
                                                                key={time}
                                                                className={`flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg transition-all ${formData.preferredTime === time
                                                                    ? "border-[#151619] bg-[#151619] text-white"
                                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="preferredTime"
                                                                    value={time}
                                                                    checked={formData.preferredTime === time}
                                                                    onChange={(e) => handleChange("preferredTime", e.target.value)}
                                                                    className="hidden" // hide default radio
                                                                />
                                                                <span className="text-xs font-semibold">{time}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                                                        Urgency Level
                                                    </label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {[
                                                            { level: "Normal", icon: Clock },
                                                            { level: "Urgent", icon: Zap },
                                                            { level: "Emergency", icon: AlertCircle }
                                                        ].map(({ level, icon: Icon }) => (
                                                            <button
                                                                key={level}
                                                                type="button"
                                                                onClick={() => handleChange("urgencyLevel", level)}
                                                                className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-xl transition-all duration-200 group ${formData.urgencyLevel === level
                                                                    ? (level === "Emergency" ? "border-red-600 bg-red-600 text-white shadow-md" : "border-[#151619] bg-[#151619] text-white shadow-md")
                                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                <Icon size={18} className={
                                                                    formData.urgencyLevel === level
                                                                        ? "text-white"
                                                                        : (level === "Emergency" ? "text-red-500" : "text-gray-400 group-hover:text-gray-600")
                                                                } />
                                                                <span className={`text-xs font-bold uppercase tracking-wide ${formData.urgencyLevel === level ? "text-white" : "text-gray-600"
                                                                    }`}>
                                                                    {level}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100">
                                    {currentStep > 1 ? (
                                        <button
                                            type="button"
                                            onClick={goToPreviousStep}
                                            className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition flex items-center gap-2 uppercase tracking-wide text-xs"
                                        >
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                    ) : <div></div>} {/* spacer if no back button */}

                                    {currentStep < 4 ? (
                                        <button
                                            type="button"
                                            onClick={goToNextStep}
                                            className="px-8 py-3 bg-[#151619] text-white font-bold rounded-lg hover:bg-gray-900 transition flex items-center gap-2 uppercase tracking-wide text-xs shadow-md"
                                        >
                                            Continue <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-xs disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide shadow-md"
                                        >
                                            {isLoading ? "Submitting..." : "Submit Request"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* End of Card */}
                    </div>
                </div>
            </div>
        </section >
    );
}
