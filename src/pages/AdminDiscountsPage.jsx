import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import FooterTwo from "../components/FooterTwo";
import BottomFooter from "../components/BottomFooter";
import ScrollToTop from "react-scroll-to-top";
import AdminDiscounts from "../components/admin/AdminDiscounts"; // Component mới

const AdminDiscountsPage = () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      <Breadcrumb title={"Approve Discount Codes"} />
      <AdminDiscounts /> {/* Component chính chứa logic */}
      <FooterTwo />
      <BottomFooter />
    </>
  );
};

export default AdminDiscountsPage;