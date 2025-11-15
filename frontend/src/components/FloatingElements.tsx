import { motion } from "motion/react";

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 right-10 w-4 h-4 bg-primary/20 rounded-full"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/3 left-10 w-3 h-3 bg-accent/30 rounded-full"
        animate={{
          y: [0, 15, 0],
          x: [0, -8, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-primary/15 rounded-full"
        animate={{
          y: [0, -25, 0],
          x: [0, 15, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/3 w-6 h-6 border border-primary/10 rounded-lg"
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-5 h-5 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}