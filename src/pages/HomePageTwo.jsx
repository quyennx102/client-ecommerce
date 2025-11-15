import React from "react";
import Preloader from "../helper/Preloader";
import BannerTwo from "../components/BannerTwo";
import PromotionalTwo from "../components/PromotionalTwo";
import DealsOne from "../components/DealsOne";
import TopSellingOne from "../components/TopSellingOne";
import TrendingOne from "../components/TrendingOne";
import DiscountOne from "../components/DiscountOne";
import FeaturedOne from "../components/FeaturedOne";
import BigDealOne from "../components/BigDealOne";
import TopSellingTwo from "../components/TopSellingTwo";
import PopularProductsOne from "../components/PopularProductsOne";
import TopVendorsTwo from "../components/TopVendorsTwo";
import DaySaleOne from "../components/DaySaleOne";
import RecentlyViewedOne from "../components/RecentlyViewedOne";
import BrandTwo from "../components/BrandTwo";
import ShippingTwo from "../components/ShippingTwo";
import NewsletterTwo from "../components/NewsletterTwo";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import TopStores from "../components/store/TopStores";

const HomePageTwo = () => {
  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* ĐÃ XÓA HeaderTwo ở đây - vì đã được đặt trong App.js */}

      {/* BannerTwo */}
      <BannerTwo />

      {/* PromotionalTwo */}
      <PromotionalTwo />

      {/* DealsOne */}
      <DealsOne />

      {/* TopSellingOne */}
      <TopSellingOne />
      {/* DiscountOne */}
      <DiscountOne />

      {/* TrendingOne */}
      <TrendingOne />

      {/* FeaturedOne */}
      {/* <FeaturedOne /> */}

      {/* BigDealOne */}
      <BigDealOne />

      {/* TopSellingTwo */}
      {/* <TopSellingTwo /> */}

      {/* PopularProductsOne */}
      {/* <PopularProductsOne /> */}

      {/* TopVendorsTwo */}
      {/* <TopVendorsTwo /> */}

      {/* DaySaleOne */}
      <DaySaleOne />

      {/* RecentlyViewedOne */}
      {/* <RecentlyViewedOne /> */}

      {/* BrandTwo */}
      {/* <BrandTwo /> */}
      <TopStores /> 

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* NewsletterTwo */}
      <NewsletterTwo />

      {/* ĐÃ XÓA FooterTwo và BottomFooter ở đây - vì đã được đặt trong App.js */}
    </>
  );
};

export default HomePageTwo;