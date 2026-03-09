import { motion } from "framer-motion";

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="w-full h-full pb-24 md:pb-0" 
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPage;