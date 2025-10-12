import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-800">
      {/* Subtle geometric ring animation */}
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-emerald-600/30 border-t-emerald-600" />
      </motion.div>

      {/* Simple moon + text fade-in */}
      <motion.div
        className="mt-6 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <span className="text-2xl">🌙</span>
        <span className="font-medium text-lg tracking-wide">
          Loading Dashboard...
        </span>
      </motion.div>

      {/* Optional soft glow effect */}
      <motion.div
        className="absolute -z-10 w-40 h-40 rounded-full bg-emerald-200/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
    </div>
  );
}
