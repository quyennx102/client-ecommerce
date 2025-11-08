import React from "react";
import Preloader from "../helper/Preloader";
import HeaderTwo from "../components/HeaderTwo";
import Breadcrumb from "../components/Breadcrumb";
import ShippingTwo from "../components/ShippingTwo";
import FooterTwo from "../components/FooterTwo";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import Profile from "../components/Profile";

const ProfilePage = () => {

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      {/* <HeaderTwo category={true} /> */}

      {/* Breadcrumb */}
      <Breadcrumb title={"Profile"} />

      <Profile />

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* FooterTwo */}
      {/* <FooterTwo /> */}


    </>
  );
};

export default ProfilePage;
