import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { data, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

    const [imgError, setImgError] = useState(false);

    

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const response = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      const data = response.data;

      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message || "Somthing went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />

      {userData ? (
        <div className="relative group">
          {/* {userData.name[0].toUpperCase()} */}
          {console.log("Profile Pic URL:", userData?.profilePic)}
          <img
            src={!imgError
              ? userData?.profilePic || assets.defaultAvatar
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData?.name || "User")}`} 
            alt="Profile"
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm rounded-md  ">
              {!userData.isVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Verify email
                </li>
              )}

              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/Login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2
        text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
