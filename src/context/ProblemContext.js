import { createContext, useContext } from 'react';

const ProblemContext = createContext();

export const useProblems = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error('useProblems must be used within a ProblemProvider');
  }
  return context;
};

export { ProblemContext };
