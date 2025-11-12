import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import FooterTwo from "../components/FooterTwo";
import BottomFooter from "../components/BottomFooter";
import ScrollToTop from "react-scroll-to-top";
import ManageDiscounts from "../components/seller/ManageDiscounts"; // Component mới

const SellerDiscountsPage = () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      <Breadcrumb title={"Manage Discounts"} />
      <ManageDiscounts /> {/* Component chính chứa logic */}
      <FooterTwo />
      <BottomFooter />
    </>
  );
};

export default SellerDiscountsPage;