import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import FooterTwo from "../components/FooterTwo";
import BottomFooter from "../components/BottomFooter";
import ShippingOne from "../components/ShippingOne";
import ScrollToTop from "react-scroll-to-top";
import SellerDashboard from "../components/seller/SellerDashboard";


const SellerDashboardPage = () => {



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
      <SellerDashboard />

      {/* ShippingOne */}
      <ShippingOne />

      {/* FooterTwo */}
      {/* <FooterTwo /> */}

      {/* BottomFooter */}
      {/* <BottomFooter /> */}


    </>
  );
};

export default SellerDashboardPage;
