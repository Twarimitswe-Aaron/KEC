import React, { useState, useEffect, useContext } from "react";
import { CiUndo, CiRedo } from "react-icons/ci";
import { FaRegSquare, FaUser, FaEnvelope, FaUserTag, FaLock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaRegCheckSquare } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { FaEye, FaTrash } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { UserRoleContext } from "../UserRoleContext";

interface User {
  id: number;
  name: string;
  role: string;
  lessons: number;
  time: string;
  avatar: string;
}

const UserManagement = () => {
  const userRole = useContext(UserRoleContext);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Student',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // You can change this number

  // Simulate fetching data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Placeholder data (replace with actual fetch call)
        const responseData = [
          {
            id: 1,
            name: "Rukundo Patrick",
            role: "Teacher",
            lessons: 10,
            time: "22hr:32min",
            avatar: "/images/chat.png",
          },
          {
            id: 2,
            name: "Alice Johnson",
            role: "Student",
            lessons: 8,
            time: "18hr:15min",
            avatar: "/images/chat.png",
          },
          {
            id: 3,
            name: "Bob Smith",
            role: "Teacher",
            lessons: 15,
            time: "35hr:42min",
            avatar: "/images/chat.png",
          },
          {
            id: 4,
            name: "Carol Davis",
            role: "Student",
            lessons: 5,
            time: "12hr:20min",
            avatar: "/images/chat.png",
          },
          {
            id: 5,
            name: "David Wilson",
            role: "Student",
            lessons: 12,
            time: "28hr:55min",
            avatar: "/images/chat.png",
          },
          {
            id: 6,
            name: "Eva Brown",
            role: "Student",
            lessons: 7,
            time: "16hr:10min",
            avatar: "/images/chat.png",
          },
          {
            id: 7,
            name: "Frank Miller",
            role: "Student",
            lessons: 9,
            time: "20hr:30min",
            avatar: "/images/chat.png",
          },
          {
            id: 8,
            name: "Grace Lee",
            role: "Student",
            lessons: 11,
            time: "25hr:45min",
            avatar: "/images/chat.png",
          },
          {
            id: 9,
            name: "Henry Taylor",
            role: "Teacher",
            lessons: 14,
            time: "32hr:20min",
            avatar: "/images/chat.png",
          },
          {
            id: 10,
            name: "Ivy Clark",
            role: "Student",
            lessons: 6,
            time: "14hr:05min",
            avatar: "/images/chat.png",
          },
        ];
        setUsers(responseData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleView = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleDelete = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setSelectedUsers(selectedUsers.filter((id) => id !== userToDelete.id));
      setUserToDelete(null);
      
      // Adjust current page if needed after deletion
      if (currentUsers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'Student',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({
      name: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddUser = async () => {
    setIsSubmitting(true);
    
    // Simple validation
    const errors: any = {};
    if (!newUser.name.trim()) errors.name = 'Name is required';
    if (!newUser.email.trim()) errors.email = 'Email is required';
    if (!newUser.password) errors.password = 'Password is required';
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUserData: User = {
        id: Date.now(),
        name: newUser.name,
        role: newUser.role,
        lessons: 0,
        time: '0hr:0min',
        avatar: '/images/chat.png'
      };
      
      setUsers(prev => [...prev, newUserData]);
      closeAddUserModal();
      
      // Go to the last page to see the new user
      const newTotalPages = Math.ceil((users.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="h-screen -mt-4 flex flex-col">
      {userRole === "admin" && (
        <div>
          <div className="z-10 sticky top-20 flex place-items-start justify-between p-3 rounded-lg bg-white shadow-lg">
            <span className="md:text-2xl text-lg font-normal text-gray-800">
              Users ({users.length})
            </span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                <CiUndo />
              </button>
              <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                <CiRedo />
              </button>
              <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                <HiOutlineAdjustmentsHorizontal />
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#1a3c34] cursor-pointer to-[#2e856e] text-white rounded-full hover:from-[#2e856e] hover:to-[#1a3c34]" onClick={() => setShowAddUserModal(true)}>
                <span>Add</span>
                <span>+</span>
              </button>
            </div>
          </div>
          
          {/* Items per page selector */}
          <div className="flex justify-between items-center p-4 bg-white border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} entries
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-white">
            <div className="h-full overflow-y-auto p-4">
              {currentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center border border-gray-200 justify-between p-2 mb-2 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleUserSelection(user.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {selectedUsers.includes(user.id) ? (
                        <FaRegCheckSquare size={13} />
                      ) : (
                        <FaRegSquare size={13} />
                      )}
                    </button>
                    <div className="flex items-center gap-1 text-gray-600">
                      <span className="text-sm">{user.lessons} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <FaRegClock size={13} />
                      <span className="text-sm">{user.time}</span>
                    </div>
                    <button
                      onClick={() => handleView(user.id)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <FaEye size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t bg-white">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded border ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? 'bg-[#1a3c34] text-white'
                          : 'text-gray-600 hover:bg-gray-100 border cursor-pointer'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded border ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {userToDelete && (
  <div className="fixed inset-0 bg-opacity-30 bg-black flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 border border-gray-200 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-red-600">Delete User</h2>
        <button
          onClick={cancelDelete}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* Avatar + Info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={userToDelete.avatar}
          alt={`${userToDelete.name}'s avatar`}
          className="w-12 h-12 rounded-full object-cover border border-gray-300"
        />
        <div>
          <h3 className="text-base font-semibold">{userToDelete.name}</h3>
          <p className="text-gray-600 text-sm">{userToDelete.role}</p>
        </div>
      </div>

      {/* Message */}
      <p className="text-gray-700 text-sm mb-5">
        Are you sure you want to delete this user?{" "}
        <span className="font-medium text-red-600">
          This action cannot be undone.
        </span>
      </p>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={cancelDelete}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}



          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
                  <button
                    onClick={closeAddUserModal}
                    className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                  >
                    <IoClose size={24} />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaUser className="inline mr-2" size={12} />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e856e] ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter full name"
                        disabled={isSubmitting}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaEnvelope className="inline mr-2" size={12} />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e856e] ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Role Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaUserTag className="inline mr-2" size={12} />
                        Role *
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e856e] ${
                          formErrors.role ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Admin">Admin</option>
                      </select>
                      {formErrors.role && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaLock className="inline mr-2" size={12} />
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e856e] ${
                          formErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter password"
                        disabled={isSubmitting}
                      />
                      {formErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaLock className="inline mr-2" size={12} />
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={newUser.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e856e] ${
                          formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm password"
                        disabled={isSubmitting}
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeAddUserModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-gradient-to-r from-[#1a3c34] to-[#2e856e] text-white rounded-md hover:from-[#2e856e] hover:to-[#1a3c34] transition-all duration-200 flex items-center gap-2 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <FaUser size={14} />
                          Add User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-opacity-10 bg-[#00000040] flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">User Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <IoClose size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.name}'s avatar`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600">{selectedUser.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lessons Completed:</span>
                    <span className="font-medium">{selectedUser.lessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Active:</span>
                    <span className="font-medium">{selectedUser.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-medium">{selectedUser.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;