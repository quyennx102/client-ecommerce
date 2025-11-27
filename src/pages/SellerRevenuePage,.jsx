import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import ScrollToTop from "react-scroll-to-top";
import SellerDashboard from "../components/seller/SellerDashboard";
import SellerRevenue from "../components/seller/SellerRevenue";


const SellerRevenuePage = () => {



  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* HeaderTwo */}
      {/* <HeaderTwo category={true} /> */}

      {/* Breadcrumb */}
      <Breadcrumb title={"Checkout"} />

      {/* Checkout */}
      <SellerRevenue />

    </>
  );
};

export default SellerRevenuePage;
