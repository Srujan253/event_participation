import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * LuminaButton — Modern action button with Antigravity aesthetic.
 */
const LuminaButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  disabled = false,
  isLoading = false,
  className = '',
  fullWidth = false,
}) => {
  
  const getVariantClasses = () => {
    switch(variant) {
      case 'secondary':
        return 'bg-white border border-slate-200 text-slate-600 shadow-sm';
      case 'danger':
        return 'bg-red-50 border border-red-200 text-red-600 shadow-sm';
      case 'ghost':
        return 'bg-transparent text-slate-500 hover:text-slate-800';
      case 'primary':
      default:
        // Antigravity Primary
        return 'bg-gradient-to-tr from-slate-100 to-white border border-slate-200 text-slate-700 shadow-sm';
    }
  };

  const isInteractive = !disabled && !isLoading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isLoading ? 0.7 : 1, scale: 1 }}
      whileHover={isInteractive ? { 
        y: -2, 
        boxShadow: variant === 'primary' 
          ? '0 20px 25px -5px rgba(148, 163, 184, 0.4), 0 8px 10px -6px rgba(148, 163, 184, 0.2)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      } : {}}
      whileTap={isInteractive ? { scale: 0.96, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden inline-flex items-center justify-center gap-2 font-bold text-sm
        py-3 px-6 rounded-xl transition-colors duration-300 outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
        ${getVariantClasses()}
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${!isInteractive ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${disabled && !isLoading ? 'opacity-50' : ''}
        ${className}
      `}
    >
      <AnimatePresence>
        {isLoading && variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-slate-300/40"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
            style={{ originX: 0.5 }}
          />
        )}
      </AnimatePresence>
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="animate-spin w-4 h-4 text-slate-500" />}
        {children}
      </span>
    </motion.button>
  );
};

export default LuminaButton;
