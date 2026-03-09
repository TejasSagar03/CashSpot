import { motion } from "framer-motion";

// High-inertia variants for premium feel
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20, 
    filter: "blur(12px)" 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1], // The Nothing Easing
      staggerChildren: 0.1      // Smoothens the loading of child elements
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: "blur(12px)",
    transition: { duration: 0.4, ease: "easeInOut" } 
  }
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;