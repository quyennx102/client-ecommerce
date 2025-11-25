import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import ScrollToTop from "react-scroll-to-top";
import ManageUsers from "../components/admin/ManageUsers";

const ManageUsersPage = () => {
  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* Breadcrumb */}
      <Breadcrumb title={"User Management"} />

      {/* Manage Users Component */}
      <ManageUsers />
    </>
  );
};

export default ManageUsersPage;