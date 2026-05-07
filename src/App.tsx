import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import Auction from "./pages/Auction";
import AuctionProduct from "./pages/AuctionProduct";
import About from "./pages/About";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import MyListings from "./pages/MyListings";
import Chat from "./pages/Chat";
import EditAuction from "./pages/EditAuction";
import Payment from "./pages/Payment";
import PaymentMethods from "./pages/PaymentMethods";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auction" element={<Auction />} />
          <Route path="/auction/:id" element={<AuctionProduct />} />
          <Route path="/dashboard" element={<MyListings />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat/:auctionId" element={<Chat />} />
          <Route path="/payment/:auctionId" element={<Payment />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/edit-auction/:id" element={<EditAuction />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
