import { Routes, Route } from 'react-router-dom';
import { ProblemProvider, useProblems } from './context/ProblemContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import History from './pages/History';
import SolutionDrawer from './components/SolutionDrawer';

const AppContent = () => {
  const { focusedProblem, closeSolutions, addSolution, deleteSolution, openSolutions } = useProblems();

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="problems" element={<Problems onOpenSolutions={openSolutions} />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>

      <SolutionDrawer
        problem={focusedProblem}
        isOpen={Boolean(focusedProblem)}
        onClose={closeSolutions}
        onAddSolution={addSolution}
        onDeleteSolution={deleteSolution}
      />
    </>
  );
};

const App = () => {
  return (
    <ProblemProvider>
      <AppContent />
    </ProblemProvider>
  );
};

export default App;
