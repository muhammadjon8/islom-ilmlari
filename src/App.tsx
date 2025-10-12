import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import routes from "./routes";
import { Toaster } from "sonner";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={routes} />
      <Toaster richColors position="top-right" />
    </Provider>
  );
}

export default App;
