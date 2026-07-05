import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  duration?: number;
}

export default function LoadingScreen({ duration = 1800 }: LoadingScreenProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Run only on full page refresh
    if (performance.navigation.type === 1) {
      setShowLoader(true);

      const timer = setTimeout(() => {
        setShowLoader(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const text = " ingri ☕ ingri ☕ ingri ☕ ingri ☕ ingri ☕ ";

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="relative w-28 h-28"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <path
                  id="circlePath"
                  d="
                    M 100, 100
                    m -65, 0
                    a 65,65 0 1,1 130,0
                    a 65,65 0 1,1 -130,0
                  "
                />
              </defs>

              <text
                fill="#d4af37"
                fontSize="20"
                letterSpacing="0.5"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  textTransform: "lowercase",
                }}
              >
                <textPath href="#circlePath">
                  {text}
                </textPath>
              </text>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}