import React, { useState, useEffect, useContext } from 'react'
import { CiUndo ,CiRedo } from "react-icons/ci";
import { FaRegSquare } from 'react-icons/fa';
import { FaRegCheckSquare } from 'react-icons/fa';
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { FaEye, FaTrash } from 'react-icons/fa';
import { FaRegClock } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { UserRoleContext } from '../UserRoleContext';

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

    // Simulate fetching data from the backend
    useEffect(() => {
        // Replace this with your actual backend API call
        const fetchData = async () => {
            try {
                // Placeholder data (replace with actual fetch call)
                const responseData = [
                    { id: 1, name: "Rukundo Patrick", role: "Teacher", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 2, name: "Rukundo Patrick", role: "Student", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 3, name: "Rukundo Patrick", role: "Teacher", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 4, name: "Rukundo Patrick", role: "Student", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 5, name: "Rukundo Patrick", role: "Student", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 6, name: "Rukundo Patrick", role: "Student", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 7, name: "Rukundo Patrick", role: "Student", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                    { id: 8, name: "Rukundo Patrick", role: "Student", lessons: 10, time: "22hr:32min", avatar: "/images/chat.png" },
                ];
                setUsers(responseData);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchData();
    }, []);

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleView = (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
        }
    };

    const handleDelete = (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setUserToDelete(user);
        }
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            setSelectedUsers(selectedUsers.filter((id) => id !== userToDelete.id));
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    return (
        <div className="h-screen -mt-4 flex flex-col">
            {userRole === "admin" && (
                <div>
                    <div className="z-10 sticky top-20  flex place-items-start justify-between p-3 rounded-lg bg-white shadow-lg">
                <span className="md:text-2xl text-lg font-normal text-gray-800">Users</span>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                        <CiUndo/>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                        <CiRedo/>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                        <HiOutlineAdjustmentsHorizontal/>
                    </button>
                    <button className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#1a3c34] cursor-pointer to-[#2e856e] text-white rounded-full hover:from-[#2e856e] hover:to-[#1a3c34]">
                        <span>Add</span>
                        <span>+</span>
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
                <div className="h-full overflow-y-auto p-4">
                    {users.map((user) => (
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
                                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
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
            </div>

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-opacity-10 bg-[#00000040] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-red-600">Delete User</h2>
                            <button onClick={cancelDelete} className="text-gray-500 hover:text-gray-700">
                                <IoClose size={24} />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <img
                                src={userToDelete.avatar}
                                alt={`${userToDelete.name}'s avatar`}
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">{userToDelete.name}</h3>
                                <p className="text-gray-600">{userToDelete.role}</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-opacity-10 bg-[#00000040] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">User Details</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
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
