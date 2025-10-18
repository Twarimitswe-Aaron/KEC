import React from 'react'
interface SelectDropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
  }
  

const headerCourseCard = ({label, options, value, onChange}: SelectDropdownProps) => {
  return (
    <div>
      <div className="flex justify-between w-full">
          <h1 className="font-bold">Different Courses</h1>
          <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
        </div>
    </div>
  )
}

export default headerCourseCard
