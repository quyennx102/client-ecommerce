import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import ScrollToTop from "react-scroll-to-top";
import AdminStores from "../components/admin/AdminStores";

const AdminStoresPage = () => {
  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* Breadcrumb */}
      <Breadcrumb title={"Store Management"} />

      {/* Admin Stores Component */}
      <AdminStores />
    </>
  );
};

export default AdminStoresPage;