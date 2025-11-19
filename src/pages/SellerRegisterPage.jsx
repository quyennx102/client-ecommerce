import React from "react";
import Preloader from "../helper/Preloader";
import Breadcrumb from "../components/Breadcrumb";
import ShippingTwo from "../components/ShippingTwo";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import SellerRegistration from "../components/seller/SellerRegistration";

const SellerRegisterPage = () => {
  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* Breadcrumb */}
      <Breadcrumb title={"Store Products"} />

      {/* StoreProducts */}
      <SellerRegistration />

      {/* ShippingTwo */}
      {/* <ShippingTwo /> */}
    </>
  );
};

export default SellerRegisterPage;