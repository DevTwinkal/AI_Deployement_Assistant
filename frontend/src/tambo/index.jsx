/* eslint-disable react-refresh/only-export-components */
import { useTambo } from './useTambo';

// Fallback Provider for main.jsx
export const TamboProvider = ({ children }) => <>{children}</>;

// Re-export hook
export { useTambo };
