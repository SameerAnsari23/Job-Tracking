import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from '@/theme';

interface Props {
  children: ReactNode;
}

/**
 * Route-change transition (Phase 16.2 pageTransition tokens): opacity + a
 * small vertical offset only — never width/height — so navigation never
 * introduces layout shift. Reduced-motion users get no motion at all via
 * the app-wide `MotionConfig reducedMotion="user"` (Providers.tsx), which
 * this component inherits automatically.
 */
export function PageTransition({ children }: Props) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
