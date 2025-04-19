import React, { useEffect } from "react";
import { logout, clearAllUserErrors } from "../store/slices/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

const HomePage = () => {
  const { message, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
    if (message) {
      toast.success(message);
    }
  }, [message,dispatch,error]);
  return (
    <div>
     <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HomePage;
