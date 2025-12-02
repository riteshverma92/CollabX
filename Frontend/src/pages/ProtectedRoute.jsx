import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Appcontent } from "../context/authContext";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { isLoggedin, loading } = useContext(Appcontent);

  // Wait during backend check
  if (loading) return <Loading />;

  // Not logged in → redirect
  if (!isLoggedin) return <Navigate to="/login" replace />;

  // Logged in → allow route inside
  return <Outlet />;
};

export default ProtectedRoute;
