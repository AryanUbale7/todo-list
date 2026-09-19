import { useTodoContext } from '../context/TodoContext';

/**
 * Custom hook for managing todo state and operations
 * @returns {import('../context/TodoContext').TodoContextValue}
 */
export function useTodos() {
  return useTodoContext();
}

export default useTodos;
