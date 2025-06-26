import React, { useContext, useState } from "react";
import {
  FaHome,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaCamera,
} from "react-icons/fa";
import { MdClose, MdEdit, MdDelete } from "react-icons/md"; // Added MdDelete for list items
import { UserRoleContext } from "../UserRoleContext";

const ProfileComponent = () => {
  const UserRole = useContext(UserRoleContext);

  // CHANGED: These states are now ARRAYS to hold multiple entries
  const [workplaces, setWorkplaces] = useState([
    "Work in the new Technology Company",
  ]);
  const [educationPlaces, setEducationPlaces] = useState([
    "Studied in Kigali Secondary Education",
  ]);
  const [currentCities, setCurrentCities] = useState([
    "Lives in Gasabo, Rwanda",
  ]);
  const [hometowns, setHometowns] = useState(["From Kigali, Gasabo, Rwanda"]);

  // States for toggling visibility of profile sections in the modal (for singular editing)
  const [showCurrentCity, setShowCurrentCity] = useState(true);
  const [showHometown, setShowHometown] = useState(true);
  // Note: showWorkplace and showEducation checkboxes are less relevant now that we have lists.
  // We'll keep them for consistency with your provided code, but their behavior will be different.

  // State for modal visibility
  const [showModal, setShowModal] = useState(false);

  // States for capturing new input in the modal (for adding new items)
  const [newWorkplaceInput, setNewWorkplaceInput] = useState("");
  const [newEducationInput, setNewEducationInput] = useState("");
  const [newCurrentCityInput, setNewCurrentCityInput] = useState("");
  const [newHometownInput, setNewHometownInput] = useState("");

  // States for controlling visibility of "add new" input fields
  const [showAddWorkplaceInput, setShowAddWorkplaceInput] = useState(false);
  const [showAddEducationInput, setShowAddEducationInput] = useState(false);
  const [showAddCurrentCityInput, setShowAddCurrentCityInput] = useState(false);
  const [showAddHometownInput, setShowAddHometownInput] = useState(false);

  // Static profile information (not editable in this version's modal)
  const [joinDate] = useState("Join June 27, 2007");
  const [email] = useState("aarontwarimitswe@gmail.com");
  const [phone] = useState("+250 784 156 865");

  // --- Handlers for Adding Items ---

  const handleAddWorkplace = () => {
    if (newWorkplaceInput.trim() !== "") {
      setWorkplaces([...workplaces, newWorkplaceInput.trim()]);
      setNewWorkplaceInput(""); // Clear input
      setShowAddWorkplaceInput(false); // Hide input field
    }
  };

  const handleAddEducation = () => {
    if (newEducationInput.trim() !== "") {
      setEducationPlaces([...educationPlaces, newEducationInput.trim()]);
      setNewEducationInput("");
      setShowAddEducationInput(false);
    }
  };

  const handleAddCurrentCity = () => {
    if (newCurrentCityInput.trim() !== "") {
      setCurrentCities([...currentCities, newCurrentCityInput.trim()]);
      setNewCurrentCityInput("");
      setShowAddCurrentCityInput(false);
    }
  };

  const handleAddHometown = () => {
    if (newHometownInput.trim() !== "") {
      setHometowns([...hometowns, newHometownInput.trim()]);
      setNewHometownInput("");
      setShowAddHometownInput(false);
    }
  };

  // --- Handlers for Deleting Items ---

  const handleDeleteWorkplace = (indexToDelete: number) => {
    setWorkplaces(workplaces.filter((_, index) => index !== indexToDelete));
  };

  const handleDeleteEducation = (indexToDelete: number) => {
    setEducationPlaces(
      educationPlaces.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleDeleteCurrentCity = (indexToDelete: number) => {
    setCurrentCities(currentCities.filter((_, index) => index !== indexToDelete));
  };

  const handleDeleteHometown = (indexToDelete: number) => {
    setHometowns(hometowns.filter((_, index) => index !== indexToDelete));
  };

  // The `handleSave` will now just close the modal, as changes are applied instantly
  const handleSave = () => {
    setShowModal(false);
    // Reset any temporary input states
    setNewWorkplaceInput("");
    setNewEducationInput("");
    setNewCurrentCityInput("");
    setNewHometownInput("");
    setShowAddWorkplaceInput(false);
    setShowAddEducationInput(false);
    setShowAddCurrentCityInput(false);
    setShowAddHometownInput(false);
  };

  const handleCancelModal = () => {
    setShowModal(false);
    // Reset any temporary input states if the user cancels
    setNewWorkplaceInput("");
    setNewEducationInput("");
    setNewCurrentCityInput("");
    setNewHometownInput("");
    setShowAddWorkplaceInput(false);
    setShowAddEducationInput(false);
    setShowAddCurrentCityInput(false);
    setShowAddHometownInput(false);
  };

  return (
    <div className="bg-gray-100 rounded-md min-h-screen">
      {/* Profile Header Section */}
      <div className="flex flex-col items-center gap-3 justify-center h-90">
        <div className="inset-0 bg-white bg-opacity-20"></div>

        <div className="">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
              alt="Profile"
              className="w-40 h-40 rounded-full border-1 border-white shadow-lg"
            />
            <button className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full hover:bg-gray-300">
              <FaCamera className="text-gray-700" />
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center">
          <div className="justify-center flex flex-col gap-2 text-center">
            <h1 className="text-4xl text-center justify-center font-bold text-gray-900">
              Twarimitswe Aaron
            </h1>
            {UserRole === "admin" && <h6>Admin</h6>}
            {UserRole === "student" && <h6>Student</h6>}
            {UserRole === "teacher" && <h6>Teacher</h6>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-200 cursor-pointer text-gray-700 px-4 py-2 my-3 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <MdEdit /> Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">About Aaron</h2>
              <div className="space-y-6">
                {/* Work Section (Displaying all workplaces) */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Work</h3>
                  <div className="space-y-2">
                    {workplaces.map((place, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <FaBriefcase className="text-gray-500" />
                        <span>{place}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Section (Displaying all education places) */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Education</h3>
                  <div className="space-y-2">
                    {educationPlaces.map((place, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <FaGraduationCap className="text-gray-500" />
                        <span>{place}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Places Lived Section (Displaying all current cities and hometowns) */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Places lived</h3>
                  <div className="space-y-2">
                    {currentCities.map((city, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <FaHome className="text-gray-500" />
                        <span>{city}</span>
                      </div>
                    ))}
                    {hometowns.map((town, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-gray-500" />
                        <span>{town}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-gray-500" />
                      <span className="text-[#022F40]">{email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-gray-500" />
                      <span>{phone}</span>
                    </div>
                  </div>
                </div>

                {/* Basic Info Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic info</h3>
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-gray-500" />
                    <span>{joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#00000099] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button onClick={handleCancelModal}>
                <MdClose className="text-2xl text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            {/* Scrollable content area for modal */}
            <div className="space-y-4 max-h-96 scroll-hide overflow-y-auto">
              {/* Edit Workplaces */}
              <div>
                <h4 className="font-semibold mb-2">Work</h4>
                {/* Display existing workplaces with delete option */}
                {workplaces.map((place, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 mb-2"
                  >
                    <label className="flex items-center gap-3">
                      {/* Checkbox for show/hide (from original logic, but acts on list presence now) */}
                      <input
                        type="checkbox"
                        checked={true} // Always checked as items in list are displayed
                        onChange={() => {}} // No real effect on display here, just visual
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span>{place}</span>
                    </label>
                    <button
                      onClick={() => handleDeleteWorkplace(index)}
                      className="text-[022F40] hover:text-[#022F40]"
                      aria-label={`Delete workplace ${place}`}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                {/* Add new workplace section */}
                {!showAddWorkplaceInput ? (
                  <button
                    onClick={() => setShowAddWorkplaceInput(true)}
                    className="text-blue-600 hover:underline text-sm mt-1"
                  >
                    + Add workplace
                  </button>
                ) : (
                  <div className="flex flex-col w-full mt-2">
                    <input
                      type="text"
                      value={newWorkplaceInput}
                      onChange={(e) => setNewWorkplaceInput(e.target.value)}
                      className="border border-gray-300 rounded p-2 w-full"
                      placeholder="Enter new workplace"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setShowAddWorkplaceInput(false);
                          setNewWorkplaceInput("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddWorkplace}
                        className="text-sm text-[#022F40] hover:text-blue-800"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Education Places */}
              <div>
                <h4 className="font-semibold mb-2">Education</h4>
                {educationPlaces.map((place, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 mb-2"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span>{place}</span>
                    </label>
                    <button
                      onClick={() => handleDeleteEducation(index)}
                      className="text-[#022F40] hover:text-[#022F40]"
                      aria-label={`Delete education place ${place}`}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                {!showAddEducationInput ? (
                  <button
                    onClick={() => setShowAddEducationInput(true)}
                    className="text-blue-600 hover:underline text-sm mt-1"
                  >
                    + Add education
                  </button>
                ) : (
                  <div className="flex flex-col w-full mt-2">
                    <input
                      type="text"
                      value={newEducationInput}
                      onChange={(e) => setNewEducationInput(e.target.value)}
                      className="border border-gray-300 rounded p-2 w-full"
                      placeholder="Enter new education"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setShowAddEducationInput(false);
                          setNewEducationInput("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEducation}
                        className="text-sm text-[#022F40] hover:text-blue-800"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Current Cities */}
              <div>
                <h4 className="font-semibold mb-2">Current city</h4>
                {currentCities.map((city, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 mb-2"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={showCurrentCity} // This checkbox still controls overall visibility (from your original logic)
                        onChange={() => setShowCurrentCity(!showCurrentCity)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span>{city}</span>
                    </label>
                    <button
                      onClick={() => handleDeleteCurrentCity(index)}
                      className="text-[#022F40] hover:text-[#022F40]"
                      aria-label={`Delete current city ${city}`}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                {!showAddCurrentCityInput ? (
                  <button
                    onClick={() => setShowAddCurrentCityInput(true)}
                    className="text-blue-600 hover:underline text-sm mt-1"
                  >
                    + Add current city
                  </button>
                ) : (
                  <div className="flex flex-col w-full mt-2">
                    <input
                      type="text"
                      value={newCurrentCityInput}
                      onChange={(e) => setNewCurrentCityInput(e.target.value)}
                      className="border border-gray-300 rounded p-2 w-full"
                      placeholder="Enter new current city"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setShowAddCurrentCityInput(false);
                          setNewCurrentCityInput("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCurrentCity}
                        className="text-sm text-[#022F40] hover:text-blue-800"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Hometowns */}
              <div>
                <h4 className="font-semibold mb-2">Hometown</h4>
                {hometowns.map((town, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 mb-2"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={showHometown} // This checkbox still controls overall visibility
                        onChange={() => setShowHometown(!showHometown)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span>{town}</span>
                    </label>
                    <button
                      onClick={() => handleDeleteHometown(index)}
                      className="text-[#022F40] hover:text-[#022F40]"
                      aria-label={`Delete hometown ${town}`}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                {!showAddHometownInput ? (
                  <button
                    onClick={() => setShowAddHometownInput(true)}
                    className="text-[#022F40] hover:underline text-sm mt-1"
                  >
                    + Add hometown
                  </button>
                ) : (
                  <div className="flex flex-col w-full mt-2">
                    <input
                      type="text"
                      value={newHometownInput}
                      onChange={(e) => setNewHometownInput(e.target.value)}
                      className="border border-gray-300 rounded p-2 w-full"
                      placeholder="Enter new hometown"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setShowAddHometownInput(false);
                          setNewHometownInput("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddHometown}
                        className="text-sm text-[#022F40] "
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-6 pt-4">
              <button
                onClick={handleCancelModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave} // This just closes the modal now
                className="px-4 py-2 bg-[#022F40] text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;