import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SubmissionPage from "./pages/SubmissionPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SubmissionPage />} />
              </Routes>
    </Router>
  );
}

export default App;
