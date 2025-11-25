import React from "react";
import { CheckCircle, XCircle, Eye, Download } from "lucide-react";

interface CertificateCardProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const CertificateCard: React.FC<CertificateCardProps> = ({ status }) => {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden group hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              JD
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">John Doe</h4>
              <p className="text-sm text-gray-500 font-medium">
                Web Development
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
              status === "PENDING"
                ? "bg-amber-100/50 text-amber-700 border-amber-200/50"
                : status === "APPROVED"
                ? "bg-green-100/50 text-green-700 border-green-200/50"
                : "bg-red-100/50 text-red-700 border-red-200/50"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="space-y-3 mb-8 bg-white/30 rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Completion Date</span>
            <span className="font-bold text-gray-900">Nov 24, 2025</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Grade</span>
            <span className="font-bold text-gray-900">92%</span>
          </div>
        </div>

        <div className="flex gap-3">
          {status === "PENDING" ? (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all text-sm font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transform hover:-translate-y-0.5">
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/50 hover:bg-red-50 text-red-600 rounded-xl transition-all text-sm font-semibold border border-red-100 hover:border-red-200">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/50 hover:bg-white text-gray-700 rounded-xl transition-all text-sm font-semibold border border-gray-200 hover:border-gray-300 shadow-sm">
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
          <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
