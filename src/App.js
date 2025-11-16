import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext"; // Thêm import
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
import ProfilePage from "./pages/ProfilePage"; // Thêm trang profile
import FooterTwo from "./components/FooterTwo";
import BottomFooter from "./components/BottomFooter";
import HeaderTwo from "./components/HeaderTwo";
import SellerDiscountsPage from "./pages/SellerDiscountsPage";
import SellerCreateDiscountPage from "./pages/SellerCreateDiscountPage";
import AdminDiscountsPage from "./pages/AdminDiscountsPage";
import StoreProductsPage from "./pages/StoreProductsPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import { PaymentFailurePage } from "./pages/PaymentFailurePage";
// import AdminDashboard from "./pages/admin/AdminDashboard"; // Thêm admin dashboard
// import SellerDashboard from "./pages/seller/SellerDashboard"; // Thêm seller dashboard

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteScrollToTop />
        <PhosphorIconInit />

        {/* Header được đặt ở đây - sẽ hiển thị trên tất cả các trang */}
        <HeaderTwo category={false} />

        {/* Main content */}
        <main>
          <Routes>
            <Route exact path="/" element={<HomePageTwo />} />
            <Route exact path="/index-two" element={<HomePageOne />} />
            <Route exact path="/products" element={<ProductsPage />} />
            <Route exact path="/product-details" element={<ProductDetailsPageOne />} />
            <Route exact path="/products/:id" element={<ProductDetailsPageTwo />} />
            <Route exact path="/cart" element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            } />

            <Route exact path="/checkout" element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            } />
            <Route exact path="/payment/success" element={
              <PrivateRoute>
                <PaymentSuccessPage />
              </PrivateRoute>
            } />

            <Route exact path="/payment/failure" element={
              <PrivateRoute>
                <PaymentFailurePage />
              </PrivateRoute>
            } />

            <Route exact path="/orders/:orderId" element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            } />

            {/* ✅ Account routes group */}
            <Route path="/auth">
              <Route index element={<AccountPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* ✅ CALLBACK ROUTE - QUAN TRỌNG! */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected routes - Common */}
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />

            {/* Seller routes */}
            {/* <Route path="/seller/dashboard" element={
            <PrivateRoute roles={['seller', 'admin']}>
              <SellerDashboard />
            </PrivateRoute>
          } /> */}
            <Route exact path="/stores/:storeId/products" element={<StoreProductsPage />} />
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
            <Route path="/seller/stores/:storeId/discounts" element={
              <PrivateRoute roles={['seller', 'admin']}>
                <SellerDiscountsPage />
              </PrivateRoute>
            } />
            <Route path="/seller/stores/:storeId/discounts/create" element={
              <PrivateRoute roles={['seller', 'admin']}>
                <SellerCreateDiscountPage />
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
                <CreateProductPage />
              </PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboardPage />
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
            <Route path="/admin/discounts" element={
              <PrivateRoute roles={['admin']}>
                <AdminDiscountsPage />
              </PrivateRoute>
            } />

            <Route path="/admin/stores" element={
              <PrivateRoute roles={['admin']}>
                <AdminStoresPage />
              </PrivateRoute>
            } />

            <Route exact path="/blog" element={<BlogPage />} />
            <Route exact path="/blog-details" element={<BlogDetailsPage />} />
            <Route exact path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        {/* Footer được đặt ở đây - sẽ hiển thị trên tất cả các trang */}
        <FooterTwo />
        <BottomFooter />

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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;