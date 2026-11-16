"use client";

import { Leaf, MessageCircle, Phone, Send, Truck } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

const TopNavbar = () => {
  const language = useSelector((state) => state.language.language);
  const isBangla = language === "bn";

  const whatsappNumber = "8801762144200";
  const displayPhone = "01762-144200";
  const rawPhone = "+8801762144200";
  const messengerUrl = "https://m.me/purehillglow";

  return (
    <div className="fixed inset-x-0 top-0 z-[1000] h-9 border-b border-[#244c2f] bg-[#1a3822] text-[#e8f3ea] shadow-xs">
      <div className="wrapper mx-auto flex h-full items-center justify-between px-3 sm:px-4">
        {/* ============ LEFT (TRUST HIGHLIGHTS) ============ */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium sm:text-xs">
            <Leaf size={12} className="shrink-0 text-[#96d88b]" />
            <span className="truncate">
              {isBangla
                ? "১০০% খাঁটি পাহাড়ি ভেষজ রূপচর্চা"
                : "100% Authentic Hill Skincare"}
            </span>
          </div>

          <div className="hidden items-center gap-1.5 text-xs font-medium md:flex">
            <span className="h-3 w-px bg-white/20" />
            <Truck size={13} className="shrink-0 text-[#96d88b]" />
            <span>
              {isBangla
                ? "সারাদেশে দ্রুত হোম ডেলিভারি"
                : "Delivery Across Bangladesh"}
            </span>
          </div>
        </div>

        {/* ============ RIGHT (DIRECT CONTACTS) ============ */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#e8f3ea] sm:gap-3 sm:text-xs">
          {/* ============ WhatsApp Order ============ */}
          <Link
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order on WhatsApp"
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-white/10 hover:text-[#96d88b]"
          >
            <MessageCircle size={13} className="shrink-0 text-[#4ade80]" />
            <span className="hidden sm:inline">
              {isBangla ? "হোয়াটসঅ্যাপে অর্ডার" : "WhatsApp"}
            </span>
          </Link>

          <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />

          {/* ============ Messenger ============ */}
          <Link
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Messenger"
            className="hidden items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-white/10 hover:text-[#96d88b] sm:flex"
          >
            <Send size={12} className="shrink-0 text-[#60a5fa]" />
            <span>{isBangla ? "ইনবক্স" : "Messenger"}</span>
          </Link>

          <span className="h-3 w-px bg-white/20" />

          {/* ============ Direct Phone Call ============ */}
          <Link
            href={`tel:${rawPhone}`}
            aria-label={`Call ${displayPhone}`}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-[#96d88b] transition-colors hover:bg-white/10 hover:text-white"
          >
            <Phone size={12} className="shrink-0" />
            <span>{displayPhone}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;