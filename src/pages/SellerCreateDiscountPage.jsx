import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import FooterTwo from "../components/FooterTwo";
import BottomFooter from "../components/BottomFooter";
import ScrollToTop from "react-scroll-to-top";
import CreateDiscountCode from "../components/seller/CreateDiscountCode"; // Component mới

const SellerCreateDiscountPage = () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      <Breadcrumb title={"Create Discount Code"} />
      <CreateDiscountCode /> {/* Component chính chứa logic */}
      <FooterTwo />
      <BottomFooter />
    </>
  );
};

export default SellerCreateDiscountPage;