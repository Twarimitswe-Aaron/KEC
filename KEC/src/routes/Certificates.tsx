import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaTrash } from 'react-icons/fa';

interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  status: 'confirmed' | 'awaiting' | 'rejected';
  certificateUrl?: string;
  avatarUrl?: string;
}

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedTab, setSelectedTab] = useState<'confirmed' | 'awaiting'>('confirmed');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setTimeout(() => {
          setCertificates([
            {
              id: '1',
              studentName: 'Rukundo Patrick',
              courseName: 'Thermodynamics Lesson',
              issueDate: '2023-05-15',
              status: 'confirmed',
              certificateUrl: '/certificates/1',
              avatarUrl: 'https://i.pravatar.cc/150?img=1'
            },
            {
              id: '2',
              studentName: 'Rukundo Patrick',
              courseName: 'Thermodynamics Lesson',
              issueDate: '2023-05-15',
              status: 'awaiting',
              avatarUrl: 'https://i.pravatar.cc/150?img=2'
            },
            {
              id: '3',
              studentName: 'Rukundo Patrick',
              courseName: 'Thermodynamics Lesson',
              issueDate: '2023-05-15',
              status: 'confirmed',
              certificateUrl: '/certificates/3',
              avatarUrl: 'https://i.pravatar.cc/150?img=3'
            },
            // Add more entries as needed
          ]);
        }, 1000);
      } catch (err) {
        console.error('Failed to fetch:', err);
      }
    };

    fetchCertificates();
  }, []);

  const confirmedCount = certificates.filter(c => c.status === 'confirmed').length;
  const awaitingCount = certificates.filter(c => c.status === 'awaiting').length;

  const filteredCertificates = certificates.filter(cert => cert.status === selectedTab);

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Certificates</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <div
          className={`flex-1 p-4 rounded-lg cursor-pointer shadow ${
            selectedTab === 'confirmed' ? 'bg-green-100 border border-green-600' : 'bg-white'
          }`}
          onClick={() => setSelectedTab('confirmed')}
        >
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-xl font-bold text-green-700">{confirmedCount}</p>
        </div>
        <div
          className={`flex-1 p-4 rounded-lg cursor-pointer shadow ${
            selectedTab === 'awaiting' ? 'bg-yellow-100 border border-yellow-600' : 'bg-white'
          }`}
          onClick={() => setSelectedTab('awaiting')}
        >
          <p className="text-sm text-gray-600">Awaiting</p>
          <p className="text-xl font-bold text-yellow-700">{awaitingCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCertificates.map(cert => (
          <div
            key={cert.id}
            className="flex items-center justify-between p-4 bg-white shadow rounded-lg"
          >
            <div className="flex items-center gap-4">
              <img
                src={cert.avatarUrl || 'https://via.placeholder.com/40'}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">{cert.studentName}</p>
                <p className="text-gray-500 text-sm">{cert.courseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {cert.status === 'confirmed' && cert.certificateUrl && (
                <a
                  href={cert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEye />
                </a>
              )}
            
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
