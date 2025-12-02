import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const Appcontent = createContext();

export const AppContextProvider = (props) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);   

  axios.defaults.withCredentials = true;

  const authStatus = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/auth/is-auth"
      );

      if (data.success) {
        setIsLoggedin(true);
        await getUserData(); // wait until user data comes
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedin(false);
      setUserData(null);
    } finally {
      setLoading(false); // ⭐ VERY IMPORTANT
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/profile"
      );

      if (data.success) {
        setUserData(data.userData); // object
      } else {
        setUserData(null);
      }
    } catch (error) {
      setUserData(null);
    }
  };

  useEffect(() => {
    authStatus();
  }, []);

  const value = {
    isLoggedin,
    setIsLoggedin,
    userData,
    loading,     
    setUserData,
    setLoading
  };

  return (
    <Appcontent.Provider value={value}>
      {props.children}
    </Appcontent.Provider>
  );
};
