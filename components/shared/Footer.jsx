"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
    Facebook,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    Truck,
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const language = useSelector((state) => state.language.language);
    const isBangla = language === "bn";

    const quickLinks = [
        { label: isBangla ? "হোম" : "Home", href: "/" },
        { label: isBangla ? "সব পণ্য" : "All Products", href: "/products" },
        { label: isBangla ? "সেরা পণ্য" : "Best Sellers", href: "/#best-sellers" },
        {
            label: isBangla ? "আমাদের অঙ্গীকার" : "Our Promise",
            href: "/#authenticity-promise",
        },
    ];

    const careLinks = [
        {
            label: isBangla ? "অর্ডার ও পণ্য" : "Orders & Products",
            href: "/products",
        },
        {
            label: isBangla ? "ডেলিভারি তথ্য" : "Delivery Information",
            href: "https://wa.me/8801762144200",
            external: true,
        },
        {
            label: isBangla ? "রিটার্ন ও রিফান্ড" : "Returns & Refunds",
            href: "mailto:hello@purehillglow.com?subject=Returns%20and%20Refunds",
            external: true,
        },
        {
            label: isBangla ? "যোগাযোগ করুন" : "Contact Us",
            href: "https://m.me/purehillglow",
            external: true,
        },
    ];

    const textLinkClass =
        "text-[11px] leading-5 text-white/75 transition-colors hover:text-white sm:text-xs";

    return (
        <footer className="mt-auto bg-[#203b1c] text-white">
            <div className="wrapper px-5 py-9 sm:px-6 sm:py-11">
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-2 md:gap-8 lg:grid-cols-[1.2fr_0.8fr_1fr_1.15fr_0.75fr]">
                    <div className="col-span-2 md:col-span-1">
                        <Link
                            href="/"
                            aria-label="Pure Hill Glow home"
                            className="relative mb-3 block h-10 w-36"
                        >
                            <Image
                                src="/assets/purehillglowweblogo.png"
                                alt="Pure Hill Glow"
                                fill
                                sizes="144px"
                                className="object-contain object-left"
                            />
                        </Link>
                        <p className="max-w-[260px] !text-[11px] leading-5 text-white/70 sm:!text-xs">
                            {isBangla
                                ? "বান্দরবানের প্রাকৃতিক সৌন্দর্য ও ঐতিহ্য থেকে অনুপ্রাণিত খাঁটি পণ্য—আপনার প্রতিদিনের যত্নে।"
                                : "Authentic products inspired by the natural beauty and traditions of Bandarban, thoughtfully selected for your everyday care."}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <Link
                                href="https://wa.me/8801762144200"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white"
                            >
                                <MessageCircle size={15} />
                            </Link>
                            <Link
                                href="https://m.me/purehillglow"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Messenger"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white"
                            >
                                <Facebook size={15} />
                            </Link>
                            <a
                                href="mailto:hello@purehillglow.com"
                                aria-label="Email"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white"
                            >
                                <Mail size={15} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-3 text-xs font-semibold text-white sm:text-sm">
                            {isBangla ? "দ্রুত লিংক" : "Quick Links"}
                        </h4>
                        <ul className="space-y-1">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={textLinkClass}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-3 text-xs font-semibold text-white sm:text-sm">
                            {isBangla ? "কাস্টমার কেয়ার" : "Customer Care"}
                        </h4>
                        <ul className="space-y-1">
                            {careLinks.map((link) => (
                                <li key={link.label}>
                                    {link.external ? (
                                        <a
                                            href={link.href}
                                            target={
                                                link.href.startsWith("https://")
                                                    ? "_blank"
                                                    : undefined
                                            }
                                            rel={
                                                link.href.startsWith("https://")
                                                    ? "noopener noreferrer"
                                                    : undefined
                                            }
                                            className={textLinkClass}
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link href={link.href} className={textLinkClass}>
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-3 text-xs font-semibold text-white sm:text-sm">
                            {isBangla ? "যোগাযোগ" : "Contact Us"}
                        </h4>
                        <ul className="space-y-2.5">
                            <li className="flex items-start gap-2">
                                <MapPin
                                    size={14}
                                    className="mt-0.5 shrink-0 text-[#c5d29a]"
                                />
                                <span className="text-[11px] leading-4 text-white/75 sm:text-xs">
                                    {isBangla ? "বান্দরবান, বাংলাদেশ" : "Bandarban, Bangladesh"}
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone
                                    size={14}
                                    className="shrink-0 text-[#c5d29a]"
                                />
                                <a
                                    href="tel:+8801762144200"
                                    className={textLinkClass}
                                >
                                    +880 1762 144200
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail
                                    size={14}
                                    className="shrink-0 text-[#c5d29a]"
                                />
                                <a
                                    href="mailto:hello@purehillglow.com"
                                    className={`${textLinkClass} break-all`}
                                >
                                    hello@purehillglow.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <h4 className="mb-3 text-xs font-semibold text-white sm:text-sm">
                            {isBangla ? "পেমেন্ট পদ্ধতি" : "We Accept"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "bKash", className: "font-bold text-[#e2136e]" },
                                { label: isBangla ? "ব্যাংক" : "Bank", className: "font-semibold text-[#305d8c]" },
                                { label: "COD", className: "font-bold text-[#55713e]" },
                            ].map((method) => (
                                <span
                                    key={method.label}
                                    className={`rounded border border-white/20 bg-white px-2 py-1 text-[9px] ${method.className}`}
                                >
                                    {method.label}
                                </span>
                            ))}
                        </div>
                        <p className="mt-2 !text-[9px] text-white/60">
                            {isBangla
                                ? "নিরাপদ পেমেন্টে নিশ্চিন্ত কেনাকাটা"
                                : "Secure and convenient checkout"}
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="!text-[10px] text-white/60 sm:!text-[11px]">
                        © {currentYear} Pure Hill Glow.{" "}
                        {isBangla ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[9px] text-white/65 sm:text-[10px]">
                        <span className="inline-flex items-center gap-1">
                            <ShieldCheck size={13} className="text-[#c5d29a]" />
                            {isBangla ? "নিরাপদ কেনাকাটা" : "Secure shopping"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Truck size={13} className="text-[#c5d29a]" />
                            {isBangla ? "সারাদেশে ডেলিভারি" : "Delivery across Bangladesh"}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
