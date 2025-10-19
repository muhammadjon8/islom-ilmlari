import { useState } from "react";
import IlmBob from "../components/IlmBob";
import QuranIlmBob from "../components/QuranIlmBob";

const BobPage = () => {
  const [activeTab, setActiveTab] = useState<"IlmBob" | "QuranIlmBob">(
    "IlmBob"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("IlmBob")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors mb-2 ${
                  activeTab === "IlmBob"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Ilm Boblari
              </button>
              <button
                onClick={() => setActiveTab("QuranIlmBob")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors mb-2 ${
                  activeTab === "QuranIlmBob"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Qur'an Ilm Boblari
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "IlmBob" && <IlmBob />}
        {activeTab === "QuranIlmBob" && <QuranIlmBob />}
      </main>
    </div>
  );
};

export default BobPage;
