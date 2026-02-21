import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Blogs from "./pages/admin/Blogs";
import Projects from "./pages/admin/Projects";
import Skills from "./pages/admin/Skills";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Section */}
        <Route path="/admin" element={<Dashboard />}>
          {/* Index shows the "Totals" inside Dashboard.jsx */}
          <Route index element={<div className="hidden" />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="projects" element={<Projects />} />
          <Route path="skills" element={<Skills />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}