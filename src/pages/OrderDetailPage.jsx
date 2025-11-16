import React from "react";
import Preloader from "../helper/Preloader";
import ColorInit from "../helper/ColorInit";
import Breadcrumb from "../components/Breadcrumb";
import ShippingOne from "../components/ShippingOne";
import ScrollToTop from "react-scroll-to-top";
import OrderDetail from "../components/OrderDetail";


const OrderDetailPage = () => {



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
      <OrderDetail />

      {/* ShippingOne */}
      <ShippingOne />

      {/* FooterTwo */}
      {/* <FooterTwo /> */}

      {/* BottomFooter */}
      {/* <BottomFooter /> */}


    </>
  );
};

export default OrderDetailPage;
