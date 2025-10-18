import React from 'react';
import { FileText, Music, Image as ImageIcon } from 'lucide-react';

const sharedFiles = [
  { name: 'course_intro.pdf', type: 'pdf' },
  { name: 'Design_podcast.mp3', type: 'audio' },
  { name: 'Theng.pdf', type: 'pdf' },
];

const sharedPhotos = [
  '/images/chat.png',
  '/images/chat.png',
  // Add more image paths here
];

const RightSidebar = () => {
  return (
    <div className="w-[300px] h-full bg-white md:block hidden border-l border-gray-200 p-4 shadow-sm fixed right-0 top-0 overflow-y-auto">
      <h4 className="font-semibold text-lg mb-4 text-gray-800">Shared Files</h4>
      <ul className="space-y-3 text-sm">
        {sharedFiles.map((file, index) => (
          <li
            key={index}
            className="flex items-center gap-2 bg-gray-50 p-2 rounded hover:bg-gray-100 cursor-pointer transition"
          >
            {file.type === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
            {file.type === 'audio' && <Music className="w-4 h-4 text-blue-500" />}
            <span className="truncate text-gray-700">{file.name}</span>
          </li>
        ))}
      </ul>

      <h4 className="font-semibold text-lg mt-6 mb-3 text-gray-800">Shared Photos</h4>
      <div className="grid grid-cols-2 gap-2">
        {sharedPhotos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Shared ${index}`}
            className="w-full h-20 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform"
          />
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
