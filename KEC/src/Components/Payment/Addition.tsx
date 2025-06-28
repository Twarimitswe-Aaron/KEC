// components/WeeklySalesAndPopularCourses.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "../Dashboard/Skeleton";

interface CourseStat {
  id: string;
  name: string;
  image: string;
  sales: number;
  earnings: number;
}

interface Expense {
  id: number;
  amount: string;
  category: string;
  description: string;
  date: string;
}

const AdditionalData = () => {
  const [courses, setCourses] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    description: ''
  });

  // Mock function that will be replaced with actual API call
  const fetchExpenses = async () => {
    // TODO: Replace with actual API call
    // const res = await axios.get("/api/expenses");
    // return res.data;
    
    // Mock data for now
    return [
      {
        id: 1,
        amount: "150.00",
        category: "Food",
        description: "Team lunch",
        date: new Date().toISOString()
      },
      {
        id: 2,
        amount: "75.50",
        category: "Transport",
        description: "Client meeting",
        date: new Date().toISOString()
      }
    ];
  };

  // Mock function that will be replaced with actual API call
  const addExpenseToBackend = async (expenseData: Omit<Expense, 'id'>) => {
    // TODO: Replace with actual API call
    // const res = await axios.post("/api/expenses", expenseData);
    // return res.data;
    
    // Mock response for now
    return {
      ...expenseData,
      id: Date.now()
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses data (existing implementation)
        const coursesRes = await axios.get("/api/weekly-course-stats");
        if (Array.isArray(coursesRes.data) && coursesRes.data.length > 0) {
          setCourses(coursesRes.data);
        } else {
          setCourses(getFallbackCourses());
        }

        // Fetch expenses (mock for now)
        const expensesData = await fetchExpenses();
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching data", error);
        setCourses(getFallbackCourses());
        setExpenses([]); // Empty expenses on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFallbackCourses = (): CourseStat[] => {
    return [
      {
        id: "1",
        name: "Transport",
        image: "/images/course.png",
        sales: 10,
        earnings: 150.5,
      },
      {
        id: "2",
        name: "WorkShop",
        image: "/images/course.png",
        sales: 3,
        earnings: 285,
      },
      {
        id: "3",
        name: "Utilities",
        image: "/images/course.png",
        sales: 12,
        earnings: 190,
      },
    ];
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expenseData = {
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description,
        date: new Date().toISOString()
      };

      // In a real implementation, this would be the API call
      const addedExpense = await addExpenseToBackend(expenseData);
      
      setExpenses([...expenses, addedExpense]);
      setNewExpense({ amount: '', category: '', description: '' });
      setIsExpenseModalOpen(false);
    } catch (error) {
      console.error("Error adding expense", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="sm:flex block sm:flex-cols-1 md:flex-cols-2 sm:w-full gap-2 mt-18">
      {/* Weekly Sales Statistics */}
      <div className="bg-white rounded-xl sm:w-[60%] shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Weekly expenses</h3>
        <div className="flex flex-cols-3 justify-between font-semibold text-sm text-gray-500 border-b pb-2 mb-2">
          <span>Expenses</span>
          <span>Amount</span>
        </div>
        {loading ? (
          <>
            {/* Skeleton for Weekly Sales Statistics */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton width="w-8" height="h-8" rounded="rounded" />
                  <Skeleton width="w-24" />
                </div>
                <div className="flex justify-between w-[26%]">
                  <Skeleton width="w-8" />
                  <Skeleton width="w-16" />
                </div>
              </div>
            ))}
          </>
        ) : (
          Array.isArray(courses) && courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-cols-3 items-center justify-between mb-4"
            >
              <div className="flex items-center gap-2">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <span className="text-sm font-medium text-gray-800">
                  {course.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600 font-semibold">
                  {course.earnings} frw
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-xl mt-6 sm:mt-0 sm:w-[40%] shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Expenses</h3>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-[#022F40] hover:bg-[#022F40] text-white px-3 py-2 cursor-pointer rounded text-md"
          >
            + Add
          </button>
        </div>

        {/* Expenses List */}
        {loading ? (
          <>
            {/* Skeleton for Expenses */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center mb-3">
                <Skeleton width="w-24" />
                <Skeleton width="w-12" />
              </div>
            ))}
          </>
        ) : (
          expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center mb-3 p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{expense.category}</p>
                  <p className="text-xs text-gray-500">{expense.description}</p>
                </div>
                <span className="text-sm font-semibold">{expense.amount} frw</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No expenses added yet</p>
          )
        )}

        {/* Add Expense Modal */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 bg-[#00000080] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Add New Expense</h3>
                <button 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddExpense}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Amount (frw)</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full p-2 border outline-none border-gray-400 rounded"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full p-2 border border-gray-400 outline-none rounded"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full p-2 border border-gray-400 outline-none rounded"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2 border border-gray-400 cursor-pointer rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#022F40] text-white cursor-pointer rounded hover:bg-[#022F40]"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalData;