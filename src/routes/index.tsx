import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/Login";
import ProtectedRoute from "./protected";
import { QuronIlmi } from "../pages/QuronIlmi";
import { QuronTavsiri } from "../pages/QuronTavsiri";
import NotFound from "../components/NotFound";
import Duolar from "../pages/Duolar";
import Kategoriyalar from "../pages/Kategoriyalar";
import Savollar from "../pages/Savollar";
import HadisSharhlari from "../pages/HadisSharhlari";
import HajAmallari from "../pages/HajAmallari";
import Yangiliklar from "../pages/Yangliklar";
import BobPage from "../pages/Bob";
import Ilm from "../pages/Ilm";

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
        <Route index element={<Navigate to="/" replace />} />
        <Route path="quron-ilmi" element={<QuronIlmi />} />
        <Route path="quron-tavsiri" element={<QuronTavsiri />} />
        <Route path="duolar" element={<Duolar />} />
        <Route path="savollar" element={<Savollar />} />
        <Route path="yangiliklar" element={<Yangiliklar />} />
        <Route path="hadis-sharhlari" element={<HadisSharhlari />} />
        <Route path="kategoriyalar" element={<Kategoriyalar />} />
        <Route path="haj-amallari" element={<HajAmallari />} />
        <Route path="ilm" element={<Ilm />} />
        <Route path="bob" element={<BobPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default routes;
