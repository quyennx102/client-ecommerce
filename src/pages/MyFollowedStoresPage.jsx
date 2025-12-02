import React from "react";
import Preloader from "../helper/Preloader";
import Breadcrumb from "../components/Breadcrumb";
import ShippingTwo from "../components/ShippingTwo";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import MyFollowedStores from "../components/MyFollowedStores";

const MyFollowedStoresPage = () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      
      <Breadcrumb title={"My Followed Stores"} />
      <MyFollowedStores />
      <ShippingTwo />
    </>
  );
};

export default MyFollowedStoresPage;