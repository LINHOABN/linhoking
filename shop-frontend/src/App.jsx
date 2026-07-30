import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ChatWidgetProvider } from "./hooks/useChatWidget";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home/Home";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import About from "./pages/StaticPage/About";
import Contact from "./pages/StaticPage/Contact";

export default function App() {
  return (
    <AuthProvider>
      <ChatWidgetProvider>
        <BrowserRouter>
          <Routes>
            {/* Site visiteur — seules routes disponibles */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/produits/:id" element={<ProductDetail />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChatWidgetProvider>
    </AuthProvider>
  );
}
