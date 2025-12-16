import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { isLoggedin, authChecked } = useSelector((state) => state.auth);

  if (!authChecked) return <Loading />;
  if (!isLoggedin) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
