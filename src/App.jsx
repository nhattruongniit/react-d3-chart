import { Routes, Route } from 'react-router-dom';

// component
import ChartView from "./pages/ChartView";
import ReactFlow from './pages/ReactFlow';

function App() {
  return (
    <>
      <Routes>
        <Route path="/dot-plot" element={<ChartView />} />
        <Route path="/" element={<ReactFlow />} />
      </Routes>
      
    </>
  );
}

export default App;
