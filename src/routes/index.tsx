import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import CandidatePage from "../shared/components/Candidate";
import HomePage from "../shared/components/HomePage";
import ApplicationsPage from "../shared/components/ApplicationsPage";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/Login";
import ProtectedRoute from "./protected";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="candidate" element={<CandidatePage />}/>
        <Route path="home" element={<HomePage />} />
        <Route path="applications" element={<ApplicationsPage />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<div>Page not found</div>} />
    </>
  )
);

export default routes;
