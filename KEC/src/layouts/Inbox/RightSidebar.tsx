import React from 'react';

const RightSidebar = () => {
  return (
    <div className="p-4">
      {/* Right Sidebar Content Here */}
      <h4 className="font-semibold mb-2">Shared Files</h4>
             <ul className="text-sm text-gray-700">
               <li className="mb-1">course_intro.pdf</li>
               <li className="mb-1">Design_podcast.mp3</li>
               <li className="mb-1">Theng.pdf</li>
             </ul>
             <h4 className="font-semibold mt-4 mb-2">Shared Photos</h4>
             <div className="grid grid-cols-2 gap-2">
               <img
                 src="/images/chat-image1.jpg" // Replace with actual image path
                 alt="Shared"
                 className="w-full h-20 object-cover rounded"
               />
               <img
                 src="/images/chat-image2.jpg" // Replace with actual image path
                 alt="Shared"
                 className="w-full h-20 object-cover rounded"
               />
             </div>
    </div>
  );
};

export default RightSidebar; 