import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import PhosphorIconInit from "./helper/PhosphorIconInit";
import HomePageTwo from "./pages/HomePageTwo";
import ProductDetailsPageOne from "./pages/ProductDetailsPageOne";
import ProductDetailsPageTwo from "./pages/ProductDetailsPageTwo";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ContactPage from "./pages/ContactPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import PrivateRoute from "./components/PrivateRoute";
import CreateStorePage from "./pages/CreateStorePage";
import MyStoresPage from "./pages/MyStoresPage";
import CreateProductPage from "./pages/CreateProductPage";
import ManageProductsPage from "./pages/ManageProductsPage";
import ProductsManagementPage from "./pages/ProductsManagementPage";
import ProductsPage from "./pages/ProductsPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <PhosphorIconInit />

      <Routes>
        <Route exact path="/" element={<HomePageTwo />} />
        <Route exact path="/index-two" element={<HomePageOne />} />
        <Route exact path="/products" element={<ProductsPage />} />
        <Route exact path="/product-details" element={<ProductDetailsPageOne />} />
        <Route exact path="/product-details-two" element={<ProductDetailsPageTwo />} />
        <Route exact path="/cart" element={<CartPage />} />
        <Route exact path="/checkout" element={<CheckoutPage />} />

        {/* ✅ Account routes group */}
        <Route path="/account">
          <Route index element={<AccountPage />} /> {/* /account */}
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          {/* <Route path="reset-password" element={<ResetPasswordPage />} /> */}
        </Route>

        {/* ✅ CALLBACK ROUTE - QUAN TRỌNG! */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected routes */}
        {/* <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } /> */}

        {/* Products & Store */}
        {/* <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/stores/:id" element={<StoreView />} /> */}

        {/* Seller routes */}
        <Route path="/seller/stores" element={
          <PrivateRoute roles={['seller', 'admin']}>
            <MyStoresPage />
          </PrivateRoute>
        } />
        <Route path="/seller/stores/create" element={
          <PrivateRoute roles={['seller', 'admin']}>
            <CreateStorePage />
          </PrivateRoute>
        } />
        <Route path="/seller/stores/:storeId/products/create" element={
          <PrivateRoute roles={['seller', 'admin']}>
            <CreateProductPage />
          </PrivateRoute>
        } />
        <Route path="/seller/stores/:storeId/products" element={
          <PrivateRoute roles={['seller', 'admin']}>
            <ManageProductsPage />
          </PrivateRoute>
        } />

        <Route path="/seller/products/:productId/edit" element={
          <PrivateRoute roles={['seller', 'admin']}>
            <ManageProductsPage />
          </PrivateRoute>
        } />

        <Route path="/admin/products" element={
          <PrivateRoute roles={['admin']}>
            <ProductsManagementPage />
          </PrivateRoute>
        } />

        <Route path="/admin/category" element={
          <PrivateRoute roles={['admin']}>
            <CategoryManagementPage />
          </PrivateRoute>
        } />

        <Route exact path="/blog" element={<BlogPage />} />
        <Route exact path="/blog-details" element={<BlogDetailsPage />} />
        <Route exact path="/contact" element={<ContactPage />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;