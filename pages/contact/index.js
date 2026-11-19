"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Clock,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

const ContactPage = () => {
  const language = useSelector((state) => state.language?.language);
  const isBangla = language === "bn";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error(
        isBangla
          ? "অনুগ্রহ করে আপনার নাম ও বার্তা লিখুন।"
          : "Please enter your name and message."
      );
      return;
    }

    const text = [
      isBangla ? "নতুন বার্তা — Pure Hill Glow" : "New Inquiry — Pure Hill Glow",
      `${isBangla ? "নাম" : "Name"}: ${form.name.trim()}`,
      ...(form.phone.trim()
        ? [`${isBangla ? "ফোন" : "Phone"}: ${form.phone.trim()}`]
        : []),
      ...(form.subject.trim()
        ? [`${isBangla ? "বিষয়" : "Subject"}: ${form.subject.trim()}`]
        : []),
      "",
      `${isBangla ? "বার্তা" : "Message"}:`,
      form.message.trim(),
    ].join("\n");

    const whatsappUrl = `https://wa.me/8801762144200?text=${encodeURIComponent(
      text
    )}`;

    toast.success(
      isBangla
        ? "WhatsApp-এ আপনার বার্তা পাঠানো হচ্ছে..."
        : "Opening WhatsApp with your message..."
    );
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setForm({ name: "", phone: "", subject: "", message: "" });
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-[#e3dac7] bg-[#fffdf8] px-3.5 py-2.5 text-sm text-[#18311d] outline-none transition placeholder:text-[#969c90] focus:border-[#24452c] focus:ring-2 focus:ring-[#24452c]/12";

  return (
    <main className="min-h-screen bg-[#faf6ee] pb-16 pt-[116px]">
      {/* ============ Editorial Hero Banner ============ */}
      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-[12%] h-36 w-36 rotate-[-32deg] text-white/10"
        />
        <div className="wrapper relative mx-auto flex min-h-44 flex-col justify-center px-4 py-8 sm:px-6">
          <nav
            aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
            className="mb-3 flex items-center gap-2 text-[11px] text-white/75"
          >
            <Link href="/" className="transition hover:text-white">
              {isBangla ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-[#efc477]">
              {isBangla ? "যোগাযোগ" : "Contact Us"}
            </span>
          </nav>

          <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
            {isBangla ? (
              <>
                আমাদের সাথে <span className="text-[#efc477]">যোগাযোগ করুন</span>
              </>
            ) : (
              <>
                Get in <span className="text-[#efc477]">Touch</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">
            {isBangla
              ? "পণ্য, অর্ডার বা স্কিনকেয়ার পরামর্শের জন্য যেকোনো সময় আমাদের সাথে যোগাযোগ করুন।"
              : "Have a question about our products, your order, or skincare recommendations? We're here to help."}
          </p>
        </div>
      </section>

      <div className="wrapper mx-auto px-4 sm:px-6">
        <div className="relative z-10 -mt-6 grid items-start gap-6 lg:grid-cols-12">
          {/* ============ Left Direct Contact Info (5 Cols) ============ */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl border border-[#e9e0cf] bg-white p-6 shadow-[0_12px_34px_rgba(24,52,30,0.05)]">
              <h2 className="font-playfair !text-xl !font-bold text-[#162d1b]">
                {isBangla ? "সরাসরি যোগাযোগের তথ্য" : "Direct Contact Info"}
              </h2>
              <p className="mt-1 !text-xs text-[#646e5f]">
                {isBangla
                  ? "দ্রুত উত্তরের জন্য কল বা WhatsApp করুন।"
                  : "Call or message us directly for the fastest response."}
              </p>

              <div className="mt-5 space-y-3.5">
                <a
                  href="tel:+8801762144200"
                  className="flex items-center gap-3.5 rounded-2xl border border-[#efe8da] bg-[#faf7f0] p-3.5 transition hover:border-[#24452c]/35"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e4] text-[#1e4326]">
                    <Phone size={18} />
                  </span>
                  <div>
                    <p className="!text-xs font-semibold text-[#646e5f]">
                      {isBangla ? "ফোন / হেল্পলাইন" : "Phone / Helpline"}
                    </p>
                    <p className="!text-sm font-bold text-[#162d1b]">
                      +880 1762-144200
                    </p>
                  </div>
                </a>

                <a
                  href="https://wa.me/8801762144200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 rounded-2xl border border-[#efe8da] bg-[#faf7f0] p-3.5 transition hover:border-[#24452c]/35"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e4] text-[#1e4326]">
                    <MessageCircle size={18} />
                  </span>
                  <div>
                    <p className="!text-xs font-semibold text-[#646e5f]">
                      WhatsApp & Messenger
                    </p>
                    <p className="!text-sm font-bold text-[#162d1b]">
                      {isBangla ? "সরাসরি চ্যাট করুন" : "Chat with Pure Hill Glow"}
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:hello@purehillglow.com"
                  className="flex items-center gap-3.5 rounded-2xl border border-[#efe8da] bg-[#faf7f0] p-3.5 transition hover:border-[#24452c]/35"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e4] text-[#1e4326]">
                    <Mail size={18} />
                  </span>
                  <div>
                    <p className="!text-xs font-semibold text-[#646e5f]">
                      {isBangla ? "ইমেইল" : "Email"}
                    </p>
                    <p className="!text-sm font-bold text-[#162d1b]">
                      hello@purehillglow.com
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 rounded-2xl border border-[#efe8da] bg-[#faf7f0] p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e4] text-[#1e4326]">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <p className="!text-xs font-semibold text-[#646e5f]">
                      {isBangla ? "অবস্থান" : "Location"}
                    </p>
                    <p className="!text-sm font-bold text-[#162d1b]">
                      {isBangla
                        ? "বান্দরবান সদর, বান্দরবান, বাংলাদেশ"
                        : "Bandarban Sadar, Bandarban, Bangladesh"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-[#efe8da] bg-[#faf7f0] p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5efe0] text-[#9b6c24]">
                    <Clock size={18} />
                  </span>
                  <div>
                    <p className="!text-xs font-semibold text-[#646e5f]">
                      {isBangla ? "সাপোর্ট সময়" : "Support Hours"}
                    </p>
                    <p className="!text-sm font-bold text-[#162d1b]">
                      {isBangla
                        ? "প্রতিদিন সকাল ৯টা – রাত ১০টা"
                        : "Everyday, 9:00 AM – 10:00 PM"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ Right Inquiry Form (7 Cols) ============ */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#e9e0cf] bg-white p-6 shadow-[0_12px_34px_rgba(24,52,30,0.05)] sm:p-8 lg:col-span-7"
          >
            <h2 className="font-playfair !text-2xl !font-bold text-[#162d1b]">
              {isBangla ? "আমাদের বার্তা পাঠান" : "Send Us a Message"}
            </h2>
            <p className="mt-1 !text-xs text-[#646e5f] sm:!text-sm">
              {isBangla
                ? "নিচের ফর্মটি পূরণ করে সাবমিট করলে সরাসরি আমাদের WhatsApp-এ বার্তাটি পৌঁছে যাবে।"
                : "Fill out the form below and your inquiry will open directly in our official WhatsApp chat."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#1e3f25]">
                {isBangla ? "আপনার নাম *" : "Your Name *"}
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={isBangla ? "আপনার পূর্ণ নাম" : "Enter your name"}
                  className={inputClass}
                />
              </label>

              <label className="text-xs font-semibold text-[#1e3f25]">
                {isBangla ? "ফোন নম্বর" : "Phone Number"}
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className={inputClass}
                />
              </label>

              <label className="text-xs font-semibold text-[#1e3f25] sm:col-span-2">
                {isBangla ? "বিষয়" : "Subject"}
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder={
                    isBangla
                      ? "যেমন: পণ্য সম্পর্কে জানতে চাই / অর্ডার সহায়তা"
                      : "e.g. Product advice, Order inquiry"
                  }
                  className={inputClass}
                />
              </label>

              <label className="text-xs font-semibold text-[#1e3f25] sm:col-span-2">
                {isBangla ? "আপনার বার্তা *" : "Your Message *"}
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder={
                    isBangla
                      ? "আপনার প্রশ্ন বা মতামত এখানে লিখুন..."
                      : "Write your message or question here..."
                  }
                  className={`${inputClass} resize-y`}
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1e3f25] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#142d1a] sm:w-auto"
            >
              <Send size={15} />
              <span>
                {isBangla ? "WhatsApp-এ বার্তা পাঠান" : "Send via WhatsApp"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
