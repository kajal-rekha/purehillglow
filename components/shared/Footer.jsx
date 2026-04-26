"use client";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light mt-auto">
            {/*====== Main Footer Content =======*/}
            <div className="wrapper py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/*======= Brand Section =======*/}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 text-primary font-playfair">
                            PureHillGlow
                        </h3>
                        <p className="text-gray text-sm mb-6">
                            Authentic Bandarban products bringing natural beauty
                            and tradition to your life.
                        </p>

                        <div className="flex gap-4">
                            {[
                                { icon: <Facebook size={18} />, link: "#" },
                                { icon: <Instagram size={18} />, link: "#" },
                                { icon: <Twitter size={18} />, link: "#" },
                            ].map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-primary hover:bg-secondary transition-all duration-300 flex items-center justify-center text-accent hover:scale-110"
                                >
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/*========== Quick Links =========*/}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Shop", href: "/products" },
                                { label: "About", href: "/about" },
                                { label: "Contact", href: "/contact" },
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link
                                        href={link.href}
                                        className="text-gray hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/*========== Categories ==========*/}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Categories</h4>
                        <ul className="space-y-3">
                            {[
                                "Beauty & Skincare",
                                "Organic Hill Pickles",
                                "Hill Accessories",
                                "Traditional Hill Clothes",
                            ].map((cat, i) => (
                                <li key={i}>
                                    <Link
                                        href="#"
                                        className="text-gray hover:text-primary transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/*========== Contact Info ===========*/}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contact Info</h4>
                        <ul className="space-y-4 text-gray text-sm">
                            <li className="flex gap-3">
                                <span className="text-primary">📍</span>
                                <span>
                                    Bandarban,
                                    <br />
                                    Bangladesh
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary">📞</span>
                                <Link
                                    href="tel:+8801234567890"
                                    className="hover:text-primary transition-colors"
                                >
                                    +880 123 456 7890
                                </Link>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary">✉️</span>
                                <Link
                                    href="mailto:hello@purehillglow.com"
                                    className="hover:text-primary transition-colors"
                                >
                                    hello@purehillglow.com
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/*============ Newsletter ============*/}
                <div className="border-t border-gray/30 pt-12 mb-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <h4 className="text-xl font-bold mb-4">
                            Subscribe to Our Newsletter
                        </h4>
                        <p className="text-gray mb-6">
                            Get exclusive offers and updates on new authentic
                            Bandarban products
                        </p>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 rounded-lg bg-gray/20 text-light border border-primary focus:outline-none focus:bg-gray/30 transition-colors"
                            />
                            <button className="bg-primary hover:bg-secondary text-dark px-6 py-2 rounded-lg font-semibold transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/*=========== Bottom Footer ===========*/}
                <div className="border-t border-gray/30 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray">
                        <div>
                            <p>
                                &copy; {currentYear} PureHillGlow. All rights
                                reserved.
                            </p>
                        </div>

                        <div className="md:text-center">
                            <p>
                                Made with{" "}
                                <span className="text-primary">❤️</span> for
                                Bandarban Communities
                            </p>
                        </div>

                        <div className="md:text-right">
                            <div className="flex gap-4 justify-end">
                                <Link
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href="#"
                                    className="hover:text-primary transition-colors"
                                >
                                    Terms & Conditions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
