import { Outlet, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ChatWidget from "../components/ChatWidget/ChatWidget";

export default function MainLayout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const search = searchParams.get("recherche") || "";

  function handleSearchChange(value) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("recherche", value);
    else params.delete("recherche");
    const target = location.pathname === "/" ? "/" : "/";
    navigate({ pathname: target, search: params.toString() });
  }

  return (
    <>
      <Navbar search={search} onSearchChange={handleSearchChange} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
