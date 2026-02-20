import { motion } from 'framer-motion';

/**
 * BrutalButton — Neo-Brutalism button with Framer Motion squish effect.
 * On press: translates X+5, Y+5 (simulates shadow flattening).
 */
const BrutalButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'yellow',
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const variants = {
    yellow: {
      bg: 'var(--brand-yellow)',
      color: '#000',
    },
    purple: {
      bg: 'var(--brand-purple)',
      color: '#fff',
    },
    red: {
      bg: 'var(--accent-red)',
      color: '#fff',
    },
    white: {
      bg: '#fff',
      color: '#000',
    },
    black: {
      bg: '#000',
      color: '#fff',
    },
  };

  const { bg, color } = variants[variant] || variants.yellow;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color,
        border: 'var(--brutal-border)',
        boxShadow: 'var(--brutal-shadow)',
        borderRadius: '0',
        padding: '0.75rem 1.5rem',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900,
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
      whileTap={
        !disabled
          ? {
              x: 5,
              y: 5,
              boxShadow: '0px 0px 0px 0px #000000',
            }
          : {}
      }
      transition={{ type: 'spring', stiffness: 600, damping: 20 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export default BrutalButton;
