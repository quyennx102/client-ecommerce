import React from "react";
import Preloader from "../helper/Preloader";
import Breadcrumb from "../components/Breadcrumb";
import ShippingTwo from "../components/ShippingTwo";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import StoreProducts from "../components/product/StoreProducts";

const StoreProductsPage = () => {
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
      <StoreProducts />

      {/* ShippingTwo */}
      <ShippingTwo />
    </>
  );
};

export default StoreProductsPage;