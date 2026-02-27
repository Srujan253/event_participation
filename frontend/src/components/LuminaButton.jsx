import { motion } from 'framer-motion';

/**
 * LuminaButton — Modern action button with spring-physics.
 */
const LuminaButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const variants = {
    primary: {
      bg: 'var(--action-blue)',
      text: '#FFFFFF',
      border: 'none',
      shadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)',
      hoverBg: 'var(--action-blue-hover)',
    },
    secondary: {
      bg: '#FFFFFF',
      text: 'var(--text-main)',
      border: '1px solid var(--gray-200)',
      shadow: 'var(--lumina-shadow-sm)',
      hoverBg: 'var(--gray-50)',
    },
    danger: {
      bg: '#EF4444',
      text: '#FFFFFF',
      border: 'none',
      shadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
      hoverBg: '#DC2626',
    },
    ghost: {
      bg: 'transparent',
      text: 'var(--text-muted)',
      border: 'none',
      shadow: 'none',
      hoverBg: 'rgba(0,0,0,0.05)',
    },
  };

  const current = variants[variant] || variants.primary;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: current.bg,
        color: current.text,
        border: current.border,
        boxShadow: current.shadow,
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1.5rem',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
      whileHover={
        !disabled
          ? {
              y: -2,
              scale: 1.02,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.98, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = current.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = current.bg;
      }}
    >
      {children}
    </motion.button>
  );
};

export default LuminaButton;
