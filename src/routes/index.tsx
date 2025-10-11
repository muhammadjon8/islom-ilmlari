import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import CandidatePage from "../shared/components/Candidate";
import HomePage from "../shared/components/HomePage";
import ApplicationsPage from "../shared/components/ApplicationsPage";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="candidate" element={<CandidatePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="applications" element={<ApplicationsPage />} />
      </Route>

      {/* Optional: Add a 404 route */}
      <Route path="*" element={<div>Page not found</div>} />
    </>
  )
);

export default routes;
