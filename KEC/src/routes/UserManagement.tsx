import React, {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  useRef,
  useMemo,
} from "react";

import { CiUndo, CiRedo } from "react-icons/ci";
import {
  FaRegSquare,
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FaRegCheckSquare } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { FaEye, FaTrash, FaEyeSlash } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { UserRoleContext } from "../UserRoleContext";
import { toast } from "react-toastify";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from "../state/api/userApi";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { SearchContext } from "../SearchContext";

interface User {
  id: number;
  name: string;
  role: "student" | "teacher" | "admin";
  email: string;
  lessons: number;
  time: string;
  avatar: string;
  showMenu: boolean;
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "teacher" | "admin";
  password: string;
  confirmPassword: string;
}

type FormErrors = {
  firstName: string[];
  lastName: string[];
  email: string[];
  role: string[];
  password: string[];
  confirmPassword: string[];
};

type SortField = "name" | "email" | "role" | null;

const UserManagement = () => {
  const { data, isLoading, refetch } = useGetAllUsersQuery();

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { searchQuery } = useContext(SearchContext);
  const userRole = useContext(UserRoleContext);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: [],
    lastName: [],
    email: [],
    role: [],
    password: [],
    confirmPassword: [],
  });

  const [isFocused, setIsFocused] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormAnimating, setIsFormAnimating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // New state for Sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  useEffect(() => {
    try {
      if (!Array.isArray(data)) {
        console.warn("Invalid or no user data received:", data);
        setUsers([]);
        refetch();
        return;
      }

      console.log("Raw user data:", data); // Debug logging

      const processedUsers = data.map((user: any) => ({
        id: user.id,
        name:
          user.name || `${user.firstName} ${user.lastName}` || "Unknown User", // Handle name composition
        email: user.email,
        role: (user.role === "teacher" ||
        user.role === "admin" ||
        user.role === "student"
          ? user.role
          : "student") as User["role"],
        avatar: user.avatar || "/images/default-avatar.png",
        lessons: 0,
        time: "--",
        showMenu: false,
      }));

      setUsers(processedUsers);
    } catch (error) {
      console.error("Error processing users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    }
  }, [data]);

  const handleAddUser = async () => {
    setIsSubmitting(true);

    if (!validateAllFields()) {
      setIsSubmitting(false);
      shakeForm();
      return;
    }

    try {
      const payload = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      } as any;

      const result = await createUser(payload).unwrap();
      toast.success(result.message || "User created successfully");

      animateSuccess();

      setTimeout(() => {
        closeAddUserModal();
        // Since we refetch on success, the useEffect will handle state update.
        // We ensure we land on the new page if necessary.
        const newTotalPages = Math.ceil((users.length + 1) / itemsPerPage);
        setCurrentPage(newTotalPages);
      }, 500);
    } catch (error: any) {
      console.error("Error adding user:", error);
      shakeForm();
      const errorMessage =
        error.data?.message ||
        error.message ||
        "Failed to create user. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = (
    fields: Partial<Record<keyof NewUser, string>>,
    showToast: boolean = false
  ): FormErrors => {
    const errors: FormErrors = {
      firstName: [],
      lastName: [],
      email: [],
      role: [],
      password: [],
      confirmPassword: [],
    };

    Object.entries(fields).forEach(([name, value]) => {
      const key = name as keyof FormErrors;
      if (key === "firstName") {
        if (!value) errors.firstName.push("First name is required.");
        else if (value.trim().length < 2) {
          errors.firstName.push("First name must be at least 2 characters.");
        }
      }
      if (key === "lastName") {
        if (!value) errors.lastName.push("Last name is required.");
        else if (value.trim().length < 2) {
          errors.lastName.push("Last name must be at least 2 characters.");
        }
      }
      if (key === "email") {
        if (!value) errors.email.push("Email is required.");
        else if (!/\S+@\S+\.\S+/.test(value))
          errors.email.push("Please enter a valid email address.");
      }
      if (key === "password") {
        if (!value) errors.password.push("Password is required.");
        else {
          if (!/[A-Z]/.test(value))
            errors.password.push("Include at least one uppercase letter.");
          if (!/[0-9]/.test(value))
            errors.password.push("Include at least one number.");
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
            errors.password.push("Include one special character.");
          if (value.length < 6) errors.password.push("Minimum 6 characters.");
        }
      }
      if (key === "confirmPassword") {
        if (!value)
          errors.confirmPassword.push("Please confirm your password.");
        else if (value !== fields.password) {
          errors.confirmPassword.push("Passwords do not match.");
        }
      }
      if (key === "role") {
        if (!value) errors.role.push("Role is required.");
      }
    });

    if (showToast && errors.confirmPassword.length > 0) {
      toast.error("Passwords do not match");
    }

    return errors;
  };

  const validateAllFields = (): boolean => {
    const fields = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      password: newUser.password,
      confirmPassword: newUser.confirmPassword,
    } as Partial<Record<keyof NewUser, string>>;
    const allErrors = validate(fields, true);
    setFormErrors(allErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      password: true,
      confirmPassword: true,
    });
    return !Object.values(allErrors).some((errs) => errs.length > 0);
  };

  const handleFocus = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: true }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: false }));

    const value = newUser[name as keyof NewUser];
    const errors = validate({ [name]: value });
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name as keyof FormErrors] || [],
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setNewUser((prev) => ({ ...prev, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      const errors = validate({ [name]: value, password: newUser.password });
      setFormErrors((prev) => ({
        ...prev,
        [name]: errors[name as keyof FormErrors] || [],
      }));
    }
  };

  const getInputClass = (field: keyof FormErrors) => {
    return clsx(
      "w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none transition-all duration-300",
      {
        "border-[#022F40] ": !touched[field] || isFocused[field],
        "border-red-500 ": touched[field] && formErrors[field]?.length,
        "border-green-500 ": touched[field] && !formErrors[field]?.length,
      }
    );
  };

  const shakeForm = () => {
    if (formRef.current) {
      formRef.current.classList.add("animate-shake");
      setTimeout(() => {
        formRef.current?.classList.remove("animate-shake");
      }, 600);
    }
  };

  const animateSuccess = () => {
    setIsFormAnimating(true);
    if (formRef.current) {
      formRef.current.style.transform = "scale(0.98)";
      formRef.current.style.opacity = "0.9";

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.transform = "scale(1)";
          formRef.current.style.opacity = "1";
        }
        setIsFormAnimating(false);
      }, 300);
    }
  };

  // --- Sorting Logic ---
  const handleSort = (field: SortField) => {
    if (!field) return;

    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setShowSortMenu(false);
    setCurrentPage(1); // Reset to first page after sorting
  };

  // --- Combined Filter, Sort, and Pagination Logic ---
  const sortedAndFilteredUsers = useMemo(() => {
    let list = [...users];

    // 1. Filtering (Search Context)
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      list = list.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercasedQuery) ||
          user.email.toLowerCase().includes(lowercasedQuery) ||
          user.role.toLowerCase().includes(lowercasedQuery)
      );
    }

    // 2. Sorting (Horizontal Adjustments feature)
    if (sortField) {
      list.sort((a, b) => {
        const aValue = a[sortField]?.toString().toLowerCase() || "";
        const bValue = b[sortField]?.toString().toLowerCase() || "";

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [users, searchQuery, sortField, sortDirection]);

  // 3. Pagination calculation
  const totalItems = sortedAndFilteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentUsers = useMemo(
    () => sortedAndFilteredUsers.slice(startIndex, endIndex),
    [sortedAndFilteredUsers, startIndex, endIndex]
  );
  // --- End Combined Logic ---

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

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id).unwrap();
        // Optimistic update: filter out the deleted user from the main users state
        const remainingUsers = users.filter(
          (user) => user.id !== userToDelete.id
        );
        setUsers(remainingUsers); // Set the updated list

        setUserToDelete(null);

        // Adjust page if current page is now empty
        const newTotalPages = Math.ceil(remainingUsers.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (remainingUsers.length === 0) {
          setCurrentPage(1);
        }

        toast.success("User deleted successfully");
      } catch (error: any) {
        toast.error(error.data?.message || "Failed to delete user");
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
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({
      firstName: [],
      lastName: [],
      email: [],
      role: [],
      password: [],
      confirmPassword: [],
    });
    setTouched({});
    setIsFocused({});
  };

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

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  return (
    <div className="min-h-screen bg-gray-50/30">
      {userRole === "admin" && (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="sticky top-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm mb-6 z-10">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                User Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage system users and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sorting Menu (Horizontal Adjustments) */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <HiOutlineAdjustmentsHorizontal
                    size={18}
                    className="text-gray-600"
                  />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 origin-top-right">
                    <h4 className="px-4 py-1 text-xs font-semibold uppercase text-gray-500">
                      Sort By
                    </h4>
                    {(
                      [
                        { key: "name", label: "Name" },
                        { key: "email", label: "Email" },
                        { key: "role", label: "Role" },
                      ] as { key: SortField; label: string }[]
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleSort(key)}
                        className="w-full flex justify-between items-center text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>{label}</span>
                        {sortField === key && (
                          <span className="font-semibold text-[#1a3c34] text-lg">
                            {sortDirection === "asc" ? "↓" : "↑"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3c34] text-white rounded-lg hover:bg-[#2e856e] transition-colors text-sm font-medium"
              >
                <FaUser size={14} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-gray-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform duration-200"
                              src={user.avatar}
                              alt=""
                            />
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-[#1a3c34] transition-colors">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                              <FaEnvelope size={10} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border shadow-sm",
                            {
                              "bg-purple-50 text-purple-700 border-purple-100":
                                user.role === "admin",
                              "bg-blue-50 text-blue-700 border-blue-100":
                                user.role === "teacher",
                              "bg-emerald-50 text-emerald-700 border-emerald-100":
                                user.role === "student",
                            }
                          )}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FaRegClock size={12} />
                          {user.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => handleView(user.id)}
                            className="p-2 text-gray-400 hover:text-[#1a3c34] hover:bg-[#1a3c34]/5 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete User"
                          >
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white shadow-sm"
                  >
                    <FaChevronLeft size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white shadow-sm"
                  >
                    <FaChevronRight size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showAddUserModal && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add New User
                  </h2>
                  <button
                    onClick={closeAddUserModal}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close add user modal"
                  >
                    <IoClose size={24} className="text-gray-500" />
                  </button>
                </div>

                {/* Form body (scrollable) */}
                <form
                  ref={formRef}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddUser();
                  }}
                  className="p-4 flex-1 overflow-y-auto scroll-hide space-y-4"
                  style={{
                    transition:
                      "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
                  }}
                >
                  {/* First Name Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaUser size={12} />
                      First Name *
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      value={newUser.firstName}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={getInputClass("firstName")}
                      placeholder="Enter first name"
                      disabled={isSubmitting}
                    />
                    {formErrors.firstName?.length > 0 && (
                      <ul className="text-left mt-1 text-xs text-red-600 space-y-0.5">
                        {formErrors.firstName.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Last Name Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaUser size={12} />
                      Last Name *
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      value={newUser.lastName}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={getInputClass("lastName")}
                      placeholder="Enter last name"
                      disabled={isSubmitting}
                    />
                    {formErrors.lastName?.length > 0 && (
                      <ul className="text-left mt-1 text-xs text-red-600 space-y-0.5">
                        {formErrors.lastName.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaEnvelope size={12} />
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={newUser.email}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={getInputClass("email")}
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                    />
                    {formErrors.email?.length > 0 && (
                      <ul className="text-left mt-1 text-xs text-red-600 space-y-0.5">
                        {formErrors.email.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaUserTag size={12} />
                      Role *
                    </label>
                    <select
                      name="role"
                      value={newUser.role}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={getInputClass("role")}
                      disabled={isSubmitting}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    {formErrors.role?.length > 0 && (
                      <ul className="text-left mt-1 text-xs text-red-600 space-y-0.5">
                        {formErrors.role.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaLock size={12} />
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={getInputClass("password") + " pr-8"}
                        placeholder="Enter password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <FaEyeSlash size={14} />
                        ) : (
                          <FaEye size={14} />
                        )}
                      </button>
                    </div>
                    {formErrors.password?.length > 0 && (
                      <ul className="text-left mt-1 text-xs text-red-600 space-y-0.5">
                        {formErrors.password.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaLock size={12} />
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={newUser.confirmPassword}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={getInputClass("confirmPassword") + " pr-8"}
                        placeholder="Confirm password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash size={14} />
                        ) : (
                          <FaEye size={14} />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword?.length > 0 && (
                      <ul className="text-left mt-1 text-xs text-red-600 space-y-0.5">
                        {formErrors.confirmPassword.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex-shrink-0 flex justify-end gap-3">
                  <button
                    onClick={closeAddUserModal}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form={formRef.current?.id} // Use the ref's id for form submission
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddUser();
                    }}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#1a3c34] to-[#2e856e] text-white rounded-xl hover:from-[#2e856e] hover:to-[#1a3c34] transition-all duration-200 shadow-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaRegCheckSquare size={14} />
                    )}
                    <span>{isSubmitting ? "Creating..." : "Create User"}</span>
                  </button>
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
