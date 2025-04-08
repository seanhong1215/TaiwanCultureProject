import { RouterProvider } from "react-router-dom";
import router from "@/frontend/router";
import { UserProvider } from "@/frontend/components/UserContext/Users";

const App = () => {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  )
};

export default App;
