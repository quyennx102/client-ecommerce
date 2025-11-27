import React from "react";
import Preloader from "../helper/Preloader";
import Breadcrumb from "../components/Breadcrumb";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import SellerRegistration from "../components/seller/SellerRegistration";
import SellerOrders from "../components/seller/SellerOrders";

const SellerOrdersPage = () => {
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
      <SellerOrders />

      {/* ShippingTwo */}
      {/* <ShippingTwo /> */}
    </>
  );
};

export default SellerOrdersPage;