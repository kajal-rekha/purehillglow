import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Leaf, ShieldCheck, ShoppingBag } from "lucide-react";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { useState } from "react";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const CheckoutPage = () => {
  const language = useSelector((state) => state.language.language);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const userAndToken = useSelector((state) => state.auth.userAndToken);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBangla = language === "bn";
  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.cartQuantity) || 0),
    0
  );
  const deliveryCharge = cartItems.length > 0 ? 150 : 0;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userAndToken?.token) {
      toast.error(isBangla ? "অর্ডার করতে আগে লগইন করুন" : "Please sign in to place an order");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const customer = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      district: formData.get("district"),
      thana: formData.get("thana"),
      note: formData.get("note"),
    };

    const whatsappTab = window.open("about:blank", "_blank");
    if (whatsappTab) whatsappTab.opener = null;
    setIsSubmitting(true);

    try {
      const { data } = await axios.post(
        "/api/orders",
        {
          orderItems: cartItems.map((item) => ({
            product_id: item._id,
            cartQuantity: item.cartQuantity,
          })),
          deliveryDetails: customer,
          language,
        },
        { headers: { Authorization: `Bearer ${userAndToken.token}` } }
      );

      const order = data.order;
      const orderSubtotal = order.totalAmount - order.deliveryCharge;
      const orderDate = new Date(
        order.createdAt || Date.now()
      ).toLocaleString(isBangla ? "bn-BD" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const orderMessage = [
        isBangla ? "নতুন অর্ডার — Pure Hill Glow" : "New order — Pure Hill Glow",
        `${isBangla ? "অর্ডার আইডি" : "Order ID"}: ${order.tran_id}`,
        `${isBangla ? "অর্ডারের তারিখ ও সময়" : "Order date"}: ${orderDate}`,
        `${isBangla ? "ওয়েবসাইট অ্যাকাউন্ট" : "Website account"}: ${
          userAndToken.user.username
        }`,
        "",
        isBangla ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
        "",
        `${isBangla ? "গ্রাহকের নাম" : "Customer name"}: ${customer.name}`,
        `${isBangla ? "ফোন নম্বর" : "Phone number"}: ${customer.phone}`,
        `${isBangla ? "ডেলিভারির ঠিকানা" : "Delivery address"}: ${customer.address}`,
        `${isBangla ? "জেলা" : "District"}: ${customer.district}`,
        `${isBangla ? "থানা" : "Thana"}: ${customer.thana}`,
        ...(customer.note
          ? [`${isBangla ? "বিশেষ নোট" : "Special note"}: ${customer.note}`]
          : []),
        "",
        isBangla ? "অর্ডার করা পণ্য:" : "Ordered products:",
        ...order.orderItems.map(
          (item, index) =>
            `${index + 1}. ${item.name} × ${item.cartQuantity} — ${formatPrice(
              item.price * item.cartQuantity
            )}`
        ),
        "",
        `${isBangla ? "পণ্যের সাবটোটাল" : "Subtotal"}: ${formatPrice(orderSubtotal)}`,
        `${isBangla ? "ডেলিভারি চার্জ" : "Delivery charge"}: ${formatPrice(
          order.deliveryCharge
        )}`,
        `${isBangla ? "সর্বমোট" : "Grand total"}: ${formatPrice(
          order.totalAmount
        )}`,
      ].join("\n");
      const whatsappUrl = `https://wa.me/8801762144200?text=${encodeURIComponent(
        orderMessage
      )}`;

      dispatch(clearCart());
      toast.success(
        isBangla
          ? "অর্ডারটি আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে"
          : "Order saved to your account"
      );
      if (whatsappTab) {
        whatsappTab.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      whatsappTab?.close();
      console.error("Order submission failed:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          (isBangla ? "অর্ডার সংরক্ষণ করা যায়নি" : "Could not save your order")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-12 pt-[125px]">
      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
        />
        <div className="wrapper relative mx-auto flex min-h-40 flex-col justify-center px-4 py-7 sm:px-6">
          <nav
            aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
            className="mb-3 flex items-center gap-2 text-[11px] text-white/75"
          >
            <Link href="/" className="hover:text-white">
              {isBangla ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={13} />
            <span>{isBangla ? "অর্ডার সম্পন্ন করুন" : "Checkout"}</span>
          </nav>
          <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
            {isBangla ? (
              <>
                অর্ডার <span className="text-[#efc477]">সম্পন্ন করুন</span>
              </>
            ) : (
              <>
                Complete Your <span className="text-[#efc477]">Order</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-xs text-white/80 sm:text-sm">
            {isBangla
              ? "ডেলিভারির তথ্য দিন এবং আপনার অর্ডার নিশ্চিত করুন"
              : "Enter your delivery details and confirm your order"}
          </p>
        </div>
      </section>

      <div className="wrapper mx-auto px-4 sm:px-6">
        {!userAndToken ? (
          <section className="mx-auto my-10 flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-[#24452c]">
              <ShieldCheck size={30} />
            </span>
            <p className="mt-4 text-sm text-dark/70">
              {isBangla
                ? "অর্ডারটি আপনার অ্যাকাউন্টে সংরক্ষণ করতে আগে লগইন করুন।"
                : "Please sign in first so your order can be saved to your account."}
            </p>
            <Link
              href="/auth/login"
              className="mt-5 inline-flex rounded-lg bg-[#20452b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17351f]"
            >
              {isBangla ? "লগইন করুন" : "Sign in"}
            </Link>
          </section>
        ) : cartItems.length === 0 ? (
          <section className="mx-auto my-10 flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-[#24452c]">
              <ShoppingBag size={30} />
            </span>
            <p className="mt-4 text-sm text-dark/70">
              {isBangla ? "আপনার কার্ট খালি।" : "Your cart is empty."}
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-lg bg-[#20452b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17351f]"
            >
              {isBangla ? "পণ্য দেখুন" : "Browse Products"}
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="relative z-10 -mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)] lg:gap-5"
          >
            <section className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
              <header className="flex items-center justify-between border-b border-[#eee8df] px-4 py-3.5 sm:px-5">
                <h2 className="font-playfair text-lg font-bold text-[#203c28]">
                  {isBangla ? "ডেলিভারির তথ্য" : "Delivery details"}
                </h2>
                <ShieldCheck size={19} className="text-[#43804e]" />
              </header>
              <div className="space-y-5 p-4 sm:p-5">
                <div className="flex items-start gap-3 rounded-xl bg-[#f0f2e4] p-3.5 text-sm text-[#344b31]">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-[#315d3b]"
                    size={19}
                  />
                  <div>
                    <h3 className="font-semibold text-[#24452c]">
                      {isBangla
                        ? "ক্যাশ অন ডেলিভারিতে অর্ডার করুন"
                        : "Cash on Delivery"}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-dark/70 sm:text-sm">
                      {isBangla
                        ? "অর্ডার নিশ্চিত করতে নিচের তথ্যগুলো পূরণ করুন। পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।"
                        : "Fill in your details to confirm your order. Pay when your products are delivered."}
                    </p>
                  </div>
                </div>

                <section aria-labelledby="delivery-details-heading">
                  <h3
                    id="delivery-details-heading"
                    className="mb-3 text-sm font-bold text-[#203c28]"
                  >
                    {isBangla ? "আপনার ডেলিভারি ঠিকানা" : "Your delivery address"}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-[#344a31]">
                      {isBangla ? "আপনার নাম" : "Customer name"}
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        defaultValue={userAndToken.user?.username || ""}
                        required
                        className="mt-1.5 w-full rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2.5 text-sm font-normal text-[#344a31] outline-none transition focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/15"
                      />
                    </label>

                    <label className="text-xs font-semibold text-[#344a31]">
                      {isBangla ? "ফোন নম্বর" : "Phone number"}
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        inputMode="tel"
                        defaultValue={userAndToken.user?.phone || ""}
                        required
                        className="mt-1.5 w-full rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2.5 text-sm font-normal text-[#344a31] outline-none transition focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/15"
                      />
                    </label>

                    <label className="text-xs font-semibold text-[#344a31] sm:col-span-2">
                      {isBangla ? "ডেলিভারির ঠিকানা" : "Delivery address"}
                      <textarea
                        name="address"
                        autoComplete="street-address"
                        rows={2}
                        defaultValue={userAndToken.user?.address || ""}
                        required
                        className="mt-1.5 w-full resize-y rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2.5 text-sm font-normal text-[#344a31] outline-none transition focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/15"
                      />
                    </label>

                    <label className="text-xs font-semibold text-[#344a31]">
                      {isBangla ? "জেলা" : "District"}
                      <input
                        type="text"
                        name="district"
                        autoComplete="address-level1"
                        required
                        className="mt-1.5 w-full rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2.5 text-sm font-normal text-[#344a31] outline-none transition focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/15"
                      />
                    </label>

                    <label className="text-xs font-semibold text-[#344a31]">
                      {isBangla ? "থানা" : "Thana"}
                      <input
                        type="text"
                        name="thana"
                        required
                        className="mt-1.5 w-full rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2.5 text-sm font-normal text-[#344a31] outline-none transition focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/15"
                      />
                    </label>

                    <label className="text-xs font-semibold text-[#344a31] sm:col-span-2">
                      {isBangla ? "বিশেষ নোট (ঐচ্ছিক)" : "Special note (optional)"}
                      <textarea
                        name="note"
                        rows={2}
                        className="mt-1.5 w-full resize-y rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2.5 text-sm font-normal text-[#344a31] outline-none transition focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/15"
                      />
                    </label>
                  </div>
                </section>
              </div>
            </section>

            <aside className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)] lg:sticky lg:top-32">
              <h2 className="flex items-center gap-2 bg-[#183d23] px-4 py-3 font-playfair text-lg font-bold text-white">
                <ShoppingBag size={18} />
                {isBangla ? "অর্ডারের সারাংশ" : "Order Summary"}
              </h2>
              <div className="p-4 sm:p-5">
                <section aria-labelledby="checkout-products-heading">
                  <h3
                    id="checkout-products-heading"
                    className="mb-2 text-sm font-bold text-[#203c28]"
                  >
                    {isBangla ? "আপনার অর্ডারের পণ্য" : "Your order"}
                  </h3>
                  <ul className="divide-y divide-[#eee8df]">
                    {cartItems.map((item) => {
                      const name =
                        localized(item.name, language) ||
                        (isBangla ? "পণ্য" : "Product");
                      const quantity = Number(item.cartQuantity) || 0;

                      return (
                        <li
                          key={item._id}
                          className="flex items-center gap-3 py-3"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f7f5ef]">
                            {item.images?.[0] && (
                              <Image
                                src={item.images[0]}
                                alt={name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-semibold text-[#253c2b]">
                              {name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-dark/60">
                              {quantity.toLocaleString(
                                isBangla ? "bn-BD" : "en-BD"
                              )}{" "}
                              × {formatPrice(item.price)}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-bold text-[#203c28]">
                            {formatPrice(Number(item.price) * quantity)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <div className="mt-2 space-y-3 border-t border-dashed border-[#ddd7ca] pt-3 text-xs">
                  <div className="flex justify-between gap-3 text-dark/75">
                    <span>{isBangla ? "সাবটোটাল" : "Subtotal"}</span>
                    <span className="font-medium text-dark">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-dark/75">
                    <span>{isBangla ? "ডেলিভারি চার্জ" : "Delivery Charge"}</span>
                    <span className="font-medium text-dark">
                      {formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-[#ddd7ca] pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-playfair text-base font-bold text-[#203c28]">
                        {isBangla ? "সর্বমোট" : "Grand Total"}
                      </span>
                      <span className="text-xl font-bold text-[#203c28]">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#edbd68] px-4 text-sm font-bold text-[#33240c] shadow-sm transition hover:bg-[#e6ad4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78904f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShoppingBag size={17} />
                  {isSubmitting
                    ? isBangla
                      ? "অর্ডার করা হচ্ছে..."
                      : "Placing order..."
                    : isBangla
                      ? "অর্ডার করুন"
                      : "Place Order"}
                </button>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#f0f2e4] px-3 py-2 text-center text-[10px] leading-4 text-[#344b31]">
                  <ShieldCheck size={16} className="shrink-0" />
                  {isBangla
                    ? "আপনার অর্ডার নিরাপদ ও সুরক্ষিত"
                    : "Your order is safe & secure"}
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
