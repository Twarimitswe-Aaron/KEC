import React, {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";

import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTrash,
  FaRegClock,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import {
  Filter,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserRoleContext } from "../UserRoleContext";
import { toast } from "react-toastify";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useToggleTeamVisibilityMutation,
} from "../state/api/userApi";
import clsx from "clsx";
import { SearchContext } from "../SearchContext";
import { FaEyeSlash } from "react-icons/fa6";
import UserDetailsModal from "../Components/UserManagement/UserDetailsModal";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  avatar: string;
  time: string;
  lessons: number;
  showMenu: boolean;
  createdAt: string;
  isVisibleOnTeam?: boolean; // Only present for admin and teacher roles
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "teacher" | "student";
  title: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName: string[];
  lastName: string[];
  email: string[];
  role: string[];
  title: string[];
  password: string[];
  confirmPassword: string[];
}

type SortField = "name" | "email" | "role";

const UserManagement = () => {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleTeamVisibility] = useToggleTeamVisibilityMutation();
  const { data, refetch } = useGetAllUsersQuery();
  const { searchQuery } = useContext(SearchContext);
  const userRole = useContext(UserRoleContext);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    title: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: [],
    lastName: [],
    email: [],
    role: [],
    title: [],
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

  // New state for Sorting and Filtering
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>(
    {}
  );

  useEffect(() => {
    try {
      if (!Array.isArray(data)) {
        if (data) console.warn("Invalid or no user data received:", data);
        setUsers([]);
        // Only refetch if data is undefined (initial load or error), not if it's just empty array
        if (data === undefined) refetch();
        return;
      }

      const processedUsers = data.map((user: any) => ({
        id: user.id,
        name:
          user.name || `${user.firstName} ${user.lastName}` || "Unknown User",
        email: user.email,
        role: (user.role === "teacher" ||
        user.role === "admin" ||
        user.role === "student"
          ? user.role
          : "student") as User["role"],
        avatar: user.avatar || "/images/default-avatar.png",
        time: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "Unknown",
        lessons: user.lessons || 0,
        showMenu: false,
        createdAt: user.createdAt,
      }));

      setUsers(processedUsers);
    } catch (error: any) {
      console.error("Effect error processing users:", error);
      setUsers([]);
    }
  }, [data]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside of action menu
      if (
        openActionMenuId !== null &&
        !target.closest(".action-menu-container")
      ) {
        setOpenActionMenuId(null);
      }
    };

    if (openActionMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionMenuId]);

  const handleAddUser = async () => {
    if (isSubmitting) return;

    if (!validateAllFields()) {
      shakeForm();
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        title: newUser.title,
      } as any;

      const result = await createUser(payload).unwrap();
      toast.success(result.message || "User created successfully");

      animateSuccess();

      setTimeout(() => {
        closeAddUserModal();
        refetch(); // Refresh the user list
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
      title: [],
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
      "w-full rounded-lg px-3 py-2 text-sm border transition-all focus:outline-none focus:ring-2 focus:border-transparent",
      {
        "border-gray-300 hover:border-blue-400 hover:shadow-sm focus:ring-blue-500":
          !touched[field] && !formErrors[field]?.length,
        "border-red-500 focus:ring-red-500":
          touched[field] && formErrors[field]?.length,
        "border-green-500 focus:ring-green-500":
          touched[field] && !formErrors[field]?.length,
        "border-blue-500 ring-2 ring-blue-500":
          isFocused[field] && !formErrors[field]?.length,
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

    // 2. Filtering (Role)
    if (filterRole && filterRole !== "all") {
      list = list.filter((user) => user.role === filterRole);
    }

    // 3. Sorting (Horizontal Adjustments feature)
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
  }, [users, searchQuery, sortField, sortDirection, filterRole]);

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
    setSelectedUserId(userId);
  };

  const handleDelete = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
    }
    setOpenActionMenuId(null); // Close menu after action
  };

  const handleToggleVisibility = async (userId: number) => {
    try {
      const result = await toggleTeamVisibility(userId).unwrap();
      toast.success(result.message);
      setOpenActionMenuId(null); // Close menu after action
      refetch(); // Refresh data
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to toggle visibility");
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

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      title: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({
      firstName: [],
      lastName: [],
      email: [],
      role: [],
      title: [],
      password: [],
      confirmPassword: [],
    });
    setTouched({});
    setIsFocused({});
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
          <div className="sticky top-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6 z-10">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                User Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage system users and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3c34] text-white rounded-lg hover:bg-[#2e856e] transition-colors text-sm font-medium"
              >
                <FaUser size={14} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Filter and Sort Toolbar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6">
            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter:
                    </span>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      Sort by:
                    </span>
                    <select
                      value={sortField || "name"}
                      onChange={(e) => handleSort(e.target.value as SortField)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="role">Role</option>
                    </select>
                  </div>
                  <button
                    onClick={() =>
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={sortDirection === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortDirection === "asc" ? (
                      <ArrowUpNarrowWide className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ArrowDownNarrowWide className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {sortedAndFilteredUsers.length} users found
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
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
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform duration-200"
                              src={user.avatar}
                              alt=""
                            />
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-[#1a3c34] transition-colors">
                            {user.name}
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

                      <td className="px-3 py-4 whitespace-nowrap text-center relative">
                        <div className="relative flex justify-center action-menu-container">
                          <button
                            ref={(el) => {
                              actionButtonRefs.current[user.id] = el;
                            }}
                            onClick={(e) => {
                              if (openActionMenuId === user.id) {
                                setOpenActionMenuId(null);
                                setMenuPosition(null);
                              } else {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setMenuPosition({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.right + window.scrollX - 192, // 192px = w-48
                                });
                                setOpenActionMenuId(user.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 action-menu-container"
                            title="Actions"
                          >
                            <MoreVertical size={16} />
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
            <div className="fixed inset-0 scroll-hide bg-black/50 flex justify-center items-center z-50 px-4">
              <div className="bg-white/80 backdrop-blur-sm scroll-hide w-full max-w-3xl p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] border border-white/50 mt-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add New User
                  </h2>
                  <button
                    type="button"
                    onClick={closeAddUserModal}
                    className="p-2 z-1000 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IoClose size={24} className="text-gray-500" />
                  </button>
                </div>

                {/* Form body */}
                <form
                  ref={formRef}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddUser();
                  }}
                  className="space-y-4"
                >
                  {/* Personal Information Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 transition-all duration-300 hover:shadow-2xl">
                    <h3 className="text-lg font-semibold text-[#004e64] mb-4 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name Field */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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
                      <div className="col-span-full">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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

                      {/* Title Field (Conditional) */}
                      {(newUser.role === "teacher" ||
                        newUser.role === "admin") && (
                        <div className="animate-fadeIn">
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Title{" "}
                            <span className="text-gray-400 text-xs font-normal">
                              (Optional)
                            </span>
                          </label>
                          <input
                            name="title"
                            type="text"
                            value={newUser.title || ""}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={getInputClass("title")}
                            placeholder="e.g. Senior Instructor"
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Information Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 transition-all duration-300 hover:shadow-2xl">
                    <h3 className="text-lg font-semibold text-[#004e64] mb-4 border-b border-gray-200 pb-2">
                      Security Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Password Field */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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
                            className={getInputClass("password")}
                            placeholder="Enter password"
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
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
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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
                            className={getInputClass("confirmPassword")}
                            placeholder="Confirm password"
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
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
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeAddUserModal}
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-300 hover:shadow-md disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white font-semibold hover:from-[#022F40] hover:to-[#011d2b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <FaUser size={16} />
                          <span>Create User</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {userToDelete && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <FaTrash className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Delete User
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">
                      {userToDelete.name}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-600/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {selectedUserId && (
            <UserDetailsModal
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
            />
          )}
        </div>
      )}

      {/* Portal-rendered Action Menu (outside table) */}
      {openActionMenuId !== null &&
        menuPosition &&
        createPortal(
          <div
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] action-menu-container"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  handleView(openActionMenuId);
                  setOpenActionMenuId(null);
                  setMenuPosition(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FaEye size={14} className="text-gray-400" />
                View Details
              </button>

              {(() => {
                const user = users.find((u) => u.id === openActionMenuId);
                return (
                  (user?.role === "admin" || user?.role === "teacher") && (
                    <button
                      onClick={() => {
                        handleToggleVisibility(openActionMenuId);
                        setMenuPosition(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {user?.isVisibleOnTeam ? (
                        <>
                          <EyeOff size={14} className="text-gray-400" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye size={14} className="text-gray-400" />
                          Show
                        </>
                      )}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => {
                  handleDelete(openActionMenuId);
                  setMenuPosition(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FaTrash size={14} className="text-red-400" />
                Delete User
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default UserManagement;
