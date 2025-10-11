import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 px-4 animate-fadeIn">
      <h1 className="text-[7rem] font-extrabold text-indigo-600 select-none">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Page Not Found
      </h2>
      <p className="text-gray-600 max-w-md text-center mb-8">
        Sorry, we couldn’t find the page you’re looking for. It might have been
        moved or deleted.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Home size={18} />
          Home
        </button>
      </div>

      <div className="absolute bottom-6 text-sm text-gray-400">
        © {new Date().getFullYear()} Islоm Ilmlari
      </div>
    </div>
  );
}
