import React, { useState, ChangeEvent } from 'react';

type ImageType = 'equipment' | 'problem';

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  equipmentType?: string;
  issueType?: string;
  [key: string]: string | undefined;
}

interface ClientInfo {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  equipmentLocation: string;
}

interface EquipmentInfo {
  equipmentType: string;
  brandModel: string;
  serialNumber: string;
  installationDate: string;
}

interface ProblemDescription {
  issueType: string[];
  description: string;
  issueStartDate: string;
  repairsTried: string;
  repairsDescription: string;
}

interface ServiceRequest {
  requestedService: string[];
  preferredDate: string;
  preferredTime: string;
  urgencyLevel: string;
}

interface OfficeUse {
  receivedBy: string;
  dateReceived: string;
  assignedTechnician: string;
  workCompletedOn: string;
  remarks: string;
}
import { ChevronDown, ChevronUp, Upload, X, Wrench, FileText, Phone } from 'lucide-react';

export default function KECServiceForm() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState({
    fullName: '', company: '', phone: '', email: '', address: '', equipmentLocation: ''
  });
  const [equipmentInfo, setEquipmentInfo] = useState({
    equipmentType: '', brandModel: '', serialNumber: '', installationDate: ''
  });
  const [problemDescription, setProblemDescription] = useState<ProblemDescription>({
    issueType: [], description: '', issueStartDate: '', repairsTried: '', repairsDescription: ''
  });
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest>({
    requestedService: [], 
    preferredDate: '', 
    preferredTime: '', 
    urgencyLevel: 'Normal'
  });
  const [officeUse, setOfficeUse] = useState({
    receivedBy: '', dateReceived: '', assignedTechnician: '', workCompletedOn: '', remarks: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [equipmentImagePreview, setEquipmentImagePreview] = useState<string | null>(null);
  const [problemImagePreview, setProblemImagePreview] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  type StateType = 'clientInfo' | 'equipmentInfo' | 'problemDescription' | 'serviceRequest' | 'officeUse';

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    stateType: StateType,
    field: string
  ) => {
    const setters = {
      clientInfo: setClientInfo as React.Dispatch<React.SetStateAction<ClientInfo>>,
      equipmentInfo: setEquipmentInfo as React.Dispatch<React.SetStateAction<EquipmentInfo>>,
      problemDescription: setProblemDescription as React.Dispatch<React.SetStateAction<ProblemDescription>>,
      serviceRequest: setServiceRequest as React.Dispatch<React.SetStateAction<ServiceRequest>>,
      officeUse: setOfficeUse as React.Dispatch<React.SetStateAction<OfficeUse>>
    };
    
    setters[stateType]((prev: any) => ({
      ...prev,
      [field]: e.target.value
    }) as any);
  };

  const handleCheckboxChange = <T extends 'problemDescription' | 'serviceRequest'>(
    stateType: T,
    field: keyof (T extends 'problemDescription' ? ProblemDescription : ServiceRequest),
    value: string
  ) => {
    if (stateType === 'problemDescription') {
      setProblemDescription(prev => {
        const currentValues = [...(prev[field as keyof ProblemDescription] as string[])];
        const valueIndex = currentValues.indexOf(value);
        
        if (valueIndex === -1) {
          currentValues.push(value);
        } else {
          currentValues.splice(valueIndex, 1);
        }
        
        return {
          ...prev,
          [field]: currentValues
        };
      });
    } else {
      setServiceRequest(prev => {
        const currentValues = [...(prev[field as keyof ServiceRequest] as string[])];
        const valueIndex = currentValues.indexOf(value);
        
        if (valueIndex === -1) {
          currentValues.push(value);
        } else {
          currentValues.splice(valueIndex, 1);
        }
        
        return {
          ...prev,
          [field]: currentValues
        } as ServiceRequest;
      });
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: ImageType) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          if (type === 'equipment') setEquipmentImagePreview(reader.result);
          else setProblemImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: ImageType) => {
    if (type === 'equipment') setEquipmentImagePreview(null);
    else setProblemImagePreview(null);
  };

  const handleSubmit = () => {
    const newErrors: FormErrors = {};
    if (!clientInfo.fullName) newErrors.fullName = 'Full name is required';
    if (!clientInfo.phone) newErrors.phone = 'Phone number is required';
    if (!clientInfo.email) newErrors.email = 'Email is required';
    if (!equipmentInfo.equipmentType) newErrors.equipmentType = 'Equipment type is required';
    if (problemDescription.issueType.length === 0) newErrors.issueType = 'Select at least one issue type';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      alert('Service request submitted successfully!');
    }
  };

  const sections = [
    { id: 1, title: 'Client Information', icon: Phone },
    { id: 2, title: 'Equipment Information', icon: Wrench },
    { id: 3, title: 'Problem Description', icon: FileText },
    { id: 4, title: 'Service Request Details', icon: FileText },
    { id: 5, title: 'For Office Use (KEC Team)', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">KEC Equipment Services</h1>
            <p className="text-lg text-gray-600">Professional Maintenance & Repair Solutions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Technicians</h3>
              <p className="text-sm text-gray-600">Certified professionals with years of experience</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Response</h3>
              <p className="text-sm text-gray-600">Quick turnaround for urgent requests</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Always available when you need us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Request Form</h2>
          <p className="text-gray-600 mb-6">Please complete the sections below to submit your service request</p>
          
          <div className="space-y-3">
            {/* Section 1: Client Information */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("1")}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-700" size={20} />
                  <span className="font-semibold text-gray-900">Section 1: Client Information</span>
                </div>
                {openSection === "1" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {openSection === "1" && (
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clientInfo.fullName}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Company/Organization</label>
                      <input
                        type="text"
                        value={clientInfo.company}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter company name (optional)"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="+250 788 123 456"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Address/Location</label>
                      <input
                        type="text"
                        value={clientInfo.address}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Your address"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Equipment Location</label>
                      <input
                        type="text"
                        value={clientInfo.equipmentLocation}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, equipmentLocation: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Where is the equipment located?"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Equipment Information */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("2")}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="text-gray-700" size={20} />
                  <span className="font-semibold text-gray-900">Section 2: Equipment Information</span>
                </div>
                {openSection === "2" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {openSection === "2" && (
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Equipment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={equipmentInfo.equipmentType}
                        onChange={(e) => setEquipmentInfo(prev => ({ ...prev, equipmentType: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="">Select equipment type</option>
                        <option value="Kitchen Hood">Kitchen Hood</option>
                        <option value="Refrigerator">Refrigerator</option>
                        <option value="Mixer">Mixer</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Oven">Oven</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.equipmentType && <p className="text-red-500 text-xs mt-1">{errors.equipmentType}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Brand/Model</label>
                      <input
                        type="text"
                        value={equipmentInfo.brandModel}
                        onChange={(e) => setEquipmentInfo(prev => ({ ...prev, brandModel: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="e.g., Samsung XYZ-123"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Serial Number (if known)</label>
                      <input
                        type="text"
                        value={equipmentInfo.serialNumber}
                        onChange={(e) => setEquipmentInfo(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Serial number"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Installation Date</label>
                      <input
                        type="date"
                        value={equipmentInfo.installationDate}
                        onChange={(e) => setEquipmentInfo(prev => ({ ...prev, installationDate: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Equipment Image (optional, JPG/PNG only)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md cursor-pointer hover:bg-gray-800 transition">
                          <Upload size={18} /> Upload Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => handleImageUpload(e, 'equipment')}
                            className="hidden"
                          />
                        </label>
                        {equipmentImagePreview && (
                          <div className="relative">
                            <img src={equipmentImagePreview} alt="Equipment" className="w-20 h-20 object-cover rounded border-2 border-gray-300" />
                            <button
                              type="button"
                              onClick={() => removeImage('equipment')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Problem Description */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('3')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-700" size={20} />
                  <span className="font-semibold text-gray-900">Section 3: Problem Description</span>
                </div>
                {openSection === "3" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {openSection === "3" && (
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-3 text-sm font-medium text-gray-700">
                        Type of Issue <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Mechanical', 'Electrical', 'Cleaning', 'Noise', 'Not Working', 'Other'].map(issue => (
                          <label key={issue} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              checked={problemDescription.issueType.includes(issue)}
                              onChange={() => handleCheckboxChange('problemDescription', 'issueType', issue)}
                              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">{issue}</span>
                          </label>
                        ))}
                      </div>
                      {errors.issueType && <p className="text-red-500 text-xs mt-1">{errors.issueType}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Describe the Problem</label>
                      <textarea
                        value={problemDescription.description}
                        onChange={(e) => setProblemDescription(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        rows={4}
                        placeholder="Please describe the issue in detail..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">When did the issue start?</label>
                        <input
                          type="date"
                          value={problemDescription.issueStartDate}
                          onChange={(e) => setProblemDescription(prev => ({ ...prev, issueStartDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Have you tried any repairs?</label>
                        <div className="flex gap-6 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="repairsTried"
                              value="Yes"
                              checked={problemDescription.repairsTried === 'Yes'}
                              onChange={(e) => setProblemDescription(prev => ({ ...prev, repairsTried: e.target.value }))}
                              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="repairsTried"
                              value="No"
                              checked={problemDescription.repairsTried === 'No'}
                              onChange={(e) => setProblemDescription(prev => ({ ...prev, repairsTried: e.target.value }))}
                              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    {problemDescription.repairsTried === 'Yes' && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">If yes, please explain</label>
                        <textarea
                          value={problemDescription.repairsDescription}
                          onChange={(e) => setProblemDescription(prev => ({ ...prev, repairsDescription: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          rows={3}
                          placeholder="Describe what repairs you've attempted..."
                        />
                      </div>
                    )}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Problem Image (optional, JPG/PNG only)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md cursor-pointer hover:bg-gray-800 transition">
                          <Upload size={18} /> Upload Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => handleImageUpload(e, 'problem')}
                            className="hidden"
                          />
                        </label>
                        {problemImagePreview && (
                          <div className="relative">
                            <img src={problemImagePreview} alt="Problem" className="w-20 h-20 object-cover rounded border-2 border-gray-300" />
                            <button
                              type="button"
                              onClick={() => removeImage('problem')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Service Request Details */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("4")}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-700" size={20} />
                  <span className="font-semibold text-gray-900">Section 4: Service Request Details</span>
                </div>
                {openSection === "4" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {openSection === "4" && (
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-3 text-sm font-medium text-gray-700">Requested Service</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Inspection', 'Repair', 'Preventive Maintenance', 'Installation', 'Other'].map(service => (
                          <label key={service} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              checked={serviceRequest.requestedService.includes(service)}
                              onChange={() => handleCheckboxChange('serviceRequest', 'requestedService', service)}
                              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Preferred Service Date</label>
                        <input
                          type="date"
                          value={serviceRequest.preferredDate}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, preferredDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Preferred Time</label>
                        <div className="flex gap-4 mt-2">
                          {['Morning', 'Afternoon', 'Anytime'].map(time => (
                            <label key={time} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="preferredTime"
                                value={time}
                                checked={serviceRequest.preferredTime === time}
                                onChange={(e) => setServiceRequest(prev => ({ ...prev, preferredTime: e.target.value }))}
                                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                              />
                              <span className="text-sm text-gray-700">{time}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Urgency Level</label>
                      <div className="flex gap-6 mt-2">
                        {['Normal', 'Urgent', 'Emergency'].map(level => (
                          <label key={level} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="urgencyLevel"
                              value={level}
                              checked={serviceRequest.urgencyLevel === level}
                              onChange={(e) => setServiceRequest(prev => ({ ...prev, urgencyLevel: e.target.value }))}
                              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                            />
                            <span className={`text-sm ${level === 'Emergency' ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: For Office Use */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("5")}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-700" size={20} />
                  <span className="font-semibold text-gray-900">Section 5: For Office Use (KEC Team)</span>
                </div>
                {openSection === "5" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {openSection === "5" && (
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Received By</label>
                      <input
                        type="text"
                        value={officeUse.receivedBy}
                        onChange={(e) => setOfficeUse(prev => ({ ...prev, receivedBy: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Staff name"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Date Received</label>
                      <input
                        type="date"
                        value={officeUse.dateReceived}
                        onChange={(e) => setOfficeUse(prev => ({ ...prev, dateReceived: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Assigned Technician</label>
                      <input
                        type="text"
                        value={officeUse.assignedTechnician}
                        onChange={(e) => setOfficeUse(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Technician name"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Work Completed On</label>
                      <input
                        type="date"
                        value={officeUse.workCompletedOn}
                        onChange={(e) => setOfficeUse(prev => ({ ...prev, workCompletedOn: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Remarks</label>
                      <textarea
                        value={officeUse.remarks}
                        onChange={(e) => setOfficeUse(prev => ({ ...prev, remarks: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        rows={3}
                        placeholder="Additional notes or comments..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              className="px-12 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition shadow-md"
            >
              Submit Service Request
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions or need assistance filling out this form, please don't hesitate to contact us.
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-700" />
              <span className="text-gray-700">+250 788 123 456</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-gray-700" />
              <span className="text-gray-700">info@kec-services.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Wrench size={18} className="text-gray-700" />
              <span className="text-gray-700">Monday - Friday: 8:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}