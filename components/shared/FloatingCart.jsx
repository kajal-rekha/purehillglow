import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  clearCart,
  decreaseCart,
  increaseCart,
  removeFromCart,
} from "@/redux/features/cart/cartSlice";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const FloatingCart = () => {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [isOpen, setIsOpen] = useState(false);
  const isBangla = language === "bn";
  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.cartQuantity) || 0),
    0
  );
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.cartQuantity) || 0),
    0
  );
  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;
  const formattedTotal = formatPrice(subtotal);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={
          isBangla
            ? `কার্ট খুলুন, ${cartCount} টি পণ্য, মোট ${formattedTotal}`
            : `Open cart, ${cartCount} items, subtotal ${formattedTotal}`
        }
        aria-expanded={isOpen}
        aria-controls="floating-cart-drawer"
        className="fixed right-0 top-[46%] z-[1001] w-16 overflow-hidden rounded-l-lg bg-white text-center shadow-lg  sm:w-20"
      >
        <span className="flex flex-col items-center justify-center bg-primary px-1.5 py-1.5 text-white">
          <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.8} />
          <span
            aria-live="polite"
            className="mt-1 text-[10px] font-bold uppercase leading-4 sm:text-xs"
          >
            {cartCount}{" "}
            {isBangla ? "টি পণ্য" : cartCount === 1 ? "Item" : "Items"}
          </span>
        </span>
        <span className="block px-1 py-1.5 text-xs font-bold text-dark sm:text-sm">
          {formattedTotal}
        </span>
      </button>

      <>
        <button
          type="button"
          aria-label={isBangla ? "কার্ট বন্ধ করুন" : "Close cart"}
          aria-hidden={!isOpen}
          tabIndex={isOpen ? 0 : -1}
          onClick={() => setIsOpen(false)}
          className={`fixed inset-0 z-[1098] bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />
        <aside
          id="floating-cart-drawer"
          role="dialog"
          aria-modal={isOpen}
          aria-hidden={!isOpen}
          aria-labelledby="floating-cart-title"
          inert={!isOpen}
          className={`fixed inset-y-0 right-0 z-[1099] flex w-full max-w-[380px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4">
              <h2
                id="floating-cart-title"
                className="text-lg font-semibold text-dark"
              >
                {isBangla ? "শপিং কার্ট" : "Shopping cart"}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-dark hover:bg-gray-100"
                aria-label={isBangla ? "কার্ট বন্ধ করুন" : "Close cart"}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-dark/65">
                  {isBangla ? "আপনার কার্ট খালি।" : "Your cart is empty."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 px-3">
                  {cartItems.map((item) => {
                    const name =
                      localized(item.name, language) ||
                      (isBangla ? "পণ্য" : "Product");
                    const quantity = Number(item.cartQuantity) || 1;
                    const stock =
                      item.stock == null
                        ? Infinity
                        : Math.max(Number(item.stock) || 0, 0);

                    return (
                      <li
                        key={item._id}
                        className="flex gap-3 py-4"
                      >
                        <Link
                          href={`/products/${item._id}`}
                          onClick={() => setIsOpen(false)}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-100 bg-[#f7f5ef]"
                          aria-label={name}
                        >
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={name}
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <ShoppingBag
                              aria-hidden="true"
                              className="m-auto h-full text-gray-400"
                              size={24}
                            />
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item._id}`}
                              onClick={() => setIsOpen(false)}
                              className="line-clamp-2 text-sm font-medium text-dark hover:text-primary"
                            >
                              {name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => dispatch(removeFromCart(item._id))}
                              aria-label={
                                isBangla
                                  ? `${name} কার্ট থেকে সরান`
                                  : `Remove ${name} from cart`
                              }
                              className="shrink-0 p-0.5 text-dark/50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => dispatch(decreaseCart(item))}
                              disabled={quantity <= 1}
                              aria-label={
                                isBangla ? "পরিমাণ কমান" : "Decrease quantity"
                              }
                              className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-dark hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              className="min-w-8 text-center text-sm text-dark/70"
                              aria-live="polite"
                            >
                              {quantity.toLocaleString(
                                isBangla ? "bn-BD" : "en-BD"
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => dispatch(increaseCart(item))}
                              disabled={quantity >= stock}
                              aria-label={
                                isBangla ? "পরিমাণ বাড়ান" : "Increase quantity"
                              }
                              className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-dark hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                            <span className="ml-1 text-xs text-dark/55">
                              {quantity} × {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="shrink-0 border-t border-gray-200 bg-white px-4 pb-4 pt-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-semibold text-dark">
                  {isBangla ? "সাবটোটাল:" : "Subtotal:"}
                </span>
                <span className="font-semibold text-primary">
                  {formattedTotal}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-10 flex-1 items-center justify-center rounded-md bg-primary px-2 text-center text-xs font-semibold text-white transition hover:bg-primary/90 sm:text-sm"
                >
                  {isBangla ? "কার্ট দেখুন" : "View Cart"}
                </Link>
                {cartItems.length > 0 ? (
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-10 flex-1 items-center justify-center rounded-md border border-primary px-2 text-center text-xs font-semibold text-primary transition hover:bg-primary/5 sm:text-sm"
                  >
                    {isBangla ? "অর্ডার করুন" : "Place Order"}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex min-h-10 flex-1 items-center justify-center rounded-md border border-gray-200 px-2 text-center text-xs font-semibold text-gray-400 sm:text-sm"
                  >
                    {isBangla ? "অর্ডার করুন" : "Place Order"}
                  </button>
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => dispatch(clearCart())}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    {isBangla ? "কার্ট খালি করুন" : "Clear Cart"}
                  </button>
                </div>
              )}
            </footer>
        </aside>
      </>
    </>
  );
};

export default FloatingCart;
