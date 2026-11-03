import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, ShoppingBag } from "lucide-react";
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
      const orderMessage = [
        isBangla ? "নতুন অর্ডার — Pure Hill Glow" : "New order — Pure Hill Glow",
        `${isBangla ? "অর্ডার আইডি" : "Order ID"}: ${order.tran_id}`,
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
    <main className="min-h-screen bg-[#fbf8f2] pb-12 pt-[130px] md:pt-[178px]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="mb-6 text-center font-playfair text-2xl font-bold text-[#24452c] sm:text-3xl">
          {isBangla ? "অর্ডার সম্পন্ন করুন" : "Checkout"}
        </h1>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-dark">
          <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={20} />
          <div>
            <h2 className="font-semibold text-[#24452c]">
              {isBangla
                ? "ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার তথ্য দিন"
                : "Cash on Delivery"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-dark/70 sm:text-sm">
              {isBangla
                ? "অর্ডার নিশ্চিত করতে নিচের তথ্যগুলো পূরণ করুন। পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।"
                : "Fill in your details to confirm your order. Pay when your products are delivered."}
            </p>
          </div>
        </div>

        {!userAndToken ? (
          <section className="rounded-xl border border-[#eee5d6] bg-white p-8 text-center shadow-sm">
            <p className="text-dark/70">
              {isBangla
                ? "অর্ডারটি আপনার অ্যাকাউন্টে সংরক্ষণ করতে আগে লগইন করুন।"
                : "Please sign in first so your order can be saved to your account."}
            </p>
            <Link
              href="/auth/login"
              className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              {isBangla ? "লগইন করুন" : "Sign in"}
            </Link>
          </section>
        ) : cartItems.length === 0 ? (
          <section className="rounded-xl border border-[#eee5d6] bg-white p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-3 text-primary" size={32} />
            <p className="text-dark/70">
              {isBangla ? "আপনার কার্ট খালি।" : "Your cart is empty."}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              {isBangla ? "পণ্য দেখুন" : "Browse Products"}
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-[#eee5d6] bg-white p-4 shadow-sm sm:p-6"
          >
            <section aria-labelledby="delivery-details-heading">
              <h2
                id="delivery-details-heading"
                className="mb-4 text-lg font-semibold text-[#24452c]"
              >
                {isBangla ? "ডেলিভারির তথ্য" : "Delivery details"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-dark">
                  {isBangla ? "আপনার নাম" : "Customer name"}
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    defaultValue={userAndToken.user?.username || ""}
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>

                <label className="text-sm font-medium text-dark">
                  {isBangla ? "ফোন নম্বর" : "Phone number"}
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    defaultValue={userAndToken.user?.phone || ""}
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>

                <label className="text-sm font-medium text-dark sm:col-span-2">
                  {isBangla ? "ডেলিভারির ঠিকানা" : "Delivery address"}
                  <textarea
                    name="address"
                    autoComplete="street-address"
                    rows={2}
                    defaultValue={userAndToken.user?.address || ""}
                    required
                    className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>

                <label className="text-sm font-medium text-dark">
                  {isBangla ? "জেলা" : "District"}
                  <input
                    type="text"
                    name="district"
                    autoComplete="address-level1"
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>

                <label className="text-sm font-medium text-dark">
                  {isBangla ? "থানা" : "Thana"}
                  <input
                    type="text"
                    name="thana"
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>

                <label className="text-sm font-medium text-dark sm:col-span-2">
                  {isBangla ? "বিশেষ নোট (ঐচ্ছিক)" : "Special note (optional)"}
                  <textarea
                    name="note"
                    rows={2}
                    className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
              </div>
            </section>

            <section
              aria-labelledby="checkout-products-heading"
              className="border-t border-gray-100 pt-5"
            >
              <h2
                id="checkout-products-heading"
                className="mb-3 text-lg font-semibold text-[#24452c]"
              >
                {isBangla ? "আপনার অর্ডারের পণ্য" : "Your order"}
              </h2>
              <ul className="divide-y divide-gray-100">
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
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f7f5ef]">
                        {item.images?.[0] && (
                          <Image
                            src={item.images[0]}
                            alt={name}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-dark">
                          {name}
                        </p>
                        <p className="mt-1 text-xs text-dark/60">
                          {quantity.toLocaleString(
                            isBangla ? "bn-BD" : "en-BD"
                          )}{" "}
                          × {formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-dark">
                        {formatPrice(Number(item.price) * quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between gap-3 text-dark/70">
                  <span>{isBangla ? "সাবটোটাল" : "Subtotal"}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-3 text-dark/70">
                  <span>{isBangla ? "ডেলিভারি চার্জ" : "Delivery charge"}</span>
                  <span>{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-dashed border-gray-200 pt-2 font-bold text-[#24452c]">
                  <span>{isBangla ? "সর্বমোট" : "Grand total"}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingBag size={18} />
              {isSubmitting
                ? isBangla
                  ? "অর্ডার সংরক্ষণ হচ্ছে..."
                  : "Saving order..."
                : isBangla
                  ? "অর্ডার সংরক্ষণ করে WhatsApp-এ পাঠান"
                  : "Save Order and Continue to WhatsApp"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
