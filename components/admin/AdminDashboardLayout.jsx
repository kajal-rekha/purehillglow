"use client";

import { login, logout } from "@/redux/features/auth/authSlice";
import { setLanguage } from "@/redux/features/language/languageSlice";
import axios from "axios";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderTree,
  Image as ImageIcon,
  Leaf,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

/* ============ Shared Helpers & Constants ============ */
export const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

export const ORDER_STATUS_OPTIONS = [
  {
    value: "pending",
    en: "Pending",
    bn: "পেন্ডিং",
    icon: Clock,
    activeClass: "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    value: "processing",
    en: "Processing",
    bn: "প্রসেসিং",
    icon: Truck,
    activeClass: "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20",
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  {
    value: "delivered",
    en: "Delivered",
    bn: "ডেলিভারড",
    icon: CheckCircle2,
    activeClass: "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  {
    value: "cancelled",
    en: "Cancelled",
    bn: "বাতিল",
    icon: XCircle,
    activeClass: "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", en: "Pending", bn: "পেন্ডিং" },
  { value: "paid", en: "Paid", bn: "পেইড" },
  { value: "unpaid", en: "Unpaid", bn: "আনপেইড" },
  { value: "failed", en: "Failed", bn: "ব্যর্থ" },
];

export const DARK_INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-[#0b1015] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15";

export const compressImageFile = (file, maxSize = 600) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Invalid image file"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const parseListField = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const formatListField = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join("\n") : "");

export const SECTION_ROUTES = {
  overview: "/adminDashboard",
  orders: "/adminDashboard/orders",
  products: "/adminDashboard/products",
  categories: "/adminDashboard/categories",
  heros: "/adminDashboard/heros",
  users: "/adminDashboard/customers",
  profile: "/adminDashboard/profile",
};

/* ============ In-Memory Cache for Instant Route Switching ============ */
const adminStoreCache = {
  hydrated: false,
  orders: [],
  products: [],
  categories: [],
  subcategories: [],
  heroes: [],
  users: [],
};

const SEEN_ORDERS_STORAGE_KEY = "phg_admin_seen_order_ids";
const AdminDashboardContext = createContext(null);

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error("useAdminDashboard must be used within AdminDashboardLayout");
  }
  return context;
};

export default function AdminDashboardLayout({ activeSection = "overview", children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userAndToken } = useSelector((state) => state.auth);
  const language = useSelector((state) => state.language?.language);
  const isBangla = language === "bn";

  const user = userAndToken?.user;
  const token = userAndToken?.token;
  const isAdmin = user?.role === "admin";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  /* ============ Order Notification State ============ */
  const [seenOrderIds, setSeenOrderIds] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [checkedSnapshot, setCheckedSnapshot] = useState([]);
  const knownOrderIdsRef = useRef(null);

  /* ============ Shared Data Stores (Initialized from Cache) ============ */
  const [orders, setOrdersState] = useState(adminStoreCache.orders);
  const [products, setProductsState] = useState(adminStoreCache.products);
  const [categories, setCategoriesState] = useState(adminStoreCache.categories);
  const [subcategories, setSubcategoriesState] = useState(adminStoreCache.subcategories);
  const [heroes, setHeroesState] = useState(adminStoreCache.heroes);
  const [users, setUsersState] = useState(adminStoreCache.users);

  /* ============ Cache-Synced Setters ============ */
  const setOrders = useCallback((updater) => {
    setOrdersState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      adminStoreCache.orders = next;
      return next;
    });
  }, []);

  const setProducts = useCallback((updater) => {
    setProductsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      adminStoreCache.products = next;
      return next;
    });
  }, []);

  const setCategories = useCallback((updater) => {
    setCategoriesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      adminStoreCache.categories = next;
      return next;
    });
  }, []);

  const setSubcategories = useCallback((updater) => {
    setSubcategoriesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      adminStoreCache.subcategories = next;
      return next;
    });
  }, []);

  const setHeroes = useCallback((updater) => {
    setHeroesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      adminStoreCache.heroes = next;
      return next;
    });
  }, []);

  const setUsers = useCallback((updater) => {
    setUsersState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      adminStoreCache.users = next;
      return next;
    });
  }, []);

  /* ============ Load Seen Order IDs from LocalStorage ============ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SEEN_ORDERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        setSeenOrderIds(parsed);
        return;
      }
    } catch {
      /* ignore storage errors */
    }
    setSeenOrderIds([]);
  }, []);

  /* ============ Close Notification Dropdown on Outside Click ============ */
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleOutside = (e) => {
      if (!e.target.closest("[data-notif-dropdown]")) {
        setShowNotifDropdown(false);
        setCheckedSnapshot([]);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showNotifDropdown]);

  const persistSeenOrderIds = useCallback((ids) => {
    const uniqueIds = Array.from(new Set(ids));
    setSeenOrderIds(uniqueIds);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SEEN_ORDERS_STORAGE_KEY, JSON.stringify(uniqueIds));
      } catch {
        /* ignore storage errors */
      }
    }
  }, []);

  useEffect(() => {
    if (orders.length === 0 || seenOrderIds === null) return;
    if (typeof window !== "undefined" && localStorage.getItem(SEEN_ORDERS_STORAGE_KEY) === null) {
      persistSeenOrderIds(orders.filter((o) => o.orderStatus !== "pending").map((o) => o._id));
    }
  }, [orders, seenOrderIds, persistSeenOrderIds]);

  const unreadOrders = useMemo(() => {
    if (!seenOrderIds) return [];
    const seenSet = new Set(seenOrderIds);
    return orders.filter((o) => !seenSet.has(o._id));
  }, [orders, seenOrderIds]);

  const handleToggleNotifications = () => {
    if (showNotifDropdown) {
      setShowNotifDropdown(false);
      setCheckedSnapshot([]);
      return;
    }
    setCheckedSnapshot(unreadOrders);
    setShowNotifDropdown(true);
    if (unreadOrders.length > 0) {
      persistSeenOrderIds([...(seenOrderIds || []), ...orders.map((o) => o._id)]);
    }
  };

  const handleClearNotifications = () => {
    persistSeenOrderIds([...(seenOrderIds || []), ...orders.map((o) => o._id)]);
    setCheckedSnapshot([]);
    setShowNotifDropdown(false);
  };

  /* ============ Sync User Role from DB ============ */
  useEffect(() => {
    if (!user?._id || !token) return;
    let isMounted = true;
    axios
      .get(`/api/users/${user._id}`)
      .then(({ data }) => {
        if (isMounted && data?._id && data.role !== user.role) {
          dispatch(login({ user: data, token }));
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, [user?._id, user?.role, token, dispatch]);

  /* ============ Fetch All Admin Data ============ */
  const fetchAdminData = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ordersRes, prodsRes, catsRes, subsRes, herosRes, usersRes] =
        await Promise.allSettled([
          axios.get("/api/orders", { headers }),
          axios.get("/api/products"),
          axios.get("/api/categories"),
          axios.get("/api/subcategories"),
          axios.get("/api/heros"),
          axios.get("/api/users", { headers }),
        ]);

      const extract = (res) =>
        res.status === "fulfilled" && Array.isArray(res.value.data) ? res.value.data : null;

      const fetchedOrders = extract(ordersRes) || [];
      knownOrderIdsRef.current = new Set(fetchedOrders.map((o) => o._id));
      setOrders(fetchedOrders);

      const prods = extract(prodsRes);
      if (prods) setProducts(prods);

      const cats = extract(catsRes);
      if (cats) setCategories(cats);

      const subs = extract(subsRes);
      if (subs) setSubcategories(subs);

      const heros = extract(herosRes);
      if (heros) setHeroes(heros);

      const usrs = extract(usersRes);
      if (usrs) setUsers(usrs);

      adminStoreCache.hydrated = true;
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, setOrders, setProducts, setCategories, setSubcategories, setHeroes, setUsers]);

  useEffect(() => {
    if (!adminStoreCache.hydrated) {
      fetchAdminData();
    } else {
      knownOrderIdsRef.current = new Set(adminStoreCache.orders.map((o) => o._id));
    }
  }, [fetchAdminData]);

  /* ============ Background Polling for New Orders ============ */
  useEffect(() => {
    if (!token || !isAdmin) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(data)) return;

        if (knownOrderIdsRef.current) {
          const newlyArrived = data.filter((o) => !knownOrderIdsRef.current.has(o._id));
          if (newlyArrived.length > 0) {
            toast.success(
              isBangla
                ? `নতুন ${newlyArrived.length}টি অর্ডার এসেছে!`
                : `${newlyArrived.length} new order${newlyArrived.length > 1 ? "s" : ""} received!`
            );
          }
        }
        knownOrderIdsRef.current = new Set(data.map((o) => o._id));
        setOrders(data);
      } catch {
        /* ignore background polling failures */
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [token, isAdmin, isBangla, setOrders]);

  /* ============ Order Helpers & Actions ============ */
  const formatPrice = useCallback(
    (price) => `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`,
    [isBangla]
  );

  const handleOrderStatusChange = useCallback(
    async (orderId, updates) => {
      setUpdatingOrderId(orderId);
      try {
        const { data } = await axios.put(`/api/orders/${orderId}`, updates, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.updatedOrder || { ...o, ...updates } : o))
        );
        toast.success(isBangla ? "অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!" : "Order status updated!");
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to update order status");
      } finally {
        setUpdatingOrderId("");
      }
    },
    [token, isBangla, setOrders]
  );

  const handleDeleteOrder = useCallback(
    async (orderId, onDeleted) => {
      try {
        await axios.delete(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        if (onDeleted) onDeleted(orderId);
        toast.success(isBangla ? "অর্ডার মুছে ফেলা হয়েছে" : "Order deleted");
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to delete order");
      }
    },
    [token, isBangla, setOrders]
  );

  const orderCounts = useMemo(() => {
    const counts = { all: orders.length, pending: 0, processing: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      if (counts[o.orderStatus] !== undefined) counts[o.orderStatus] += 1;
    }
    return counts;
  }, [orders]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAdmin,
      language,
      isBangla,
      loading,
      fetchAdminData,
      orders,
      setOrders,
      products,
      setProducts,
      categories,
      setCategories,
      subcategories,
      setSubcategories,
      heroes,
      setHeroes,
      users,
      setUsers,
      orderCounts,
      formatPrice,
      updatingOrderId,
      handleOrderStatusChange,
      handleDeleteOrder,
      dispatch,
    }),
    [
      user,
      token,
      isAdmin,
      language,
      isBangla,
      loading,
      fetchAdminData,
      orders,
      setOrders,
      products,
      setProducts,
      categories,
      setCategories,
      subcategories,
      setSubcategories,
      heroes,
      setHeroes,
      users,
      setUsers,
      orderCounts,
      formatPrice,
      updatingOrderId,
      handleOrderStatusChange,
      handleDeleteOrder,
      dispatch,
    ]
  );

  /* ============ Auth Guard Screens ============ */
  if (!userAndToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d10] px-4 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11181f] p-8 text-center shadow-2xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <ShieldCheck size={28} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-white">
            {isBangla ? "অ্যাডমিন পোর্টাল লগইন" : "Admin Portal Sign In"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isBangla
              ? "অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে আগে লগইন করুন।"
              : "Please sign in with an administrator account to access this portal."}
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            <span>{isBangla ? "লগইন পেজে যান" : "Sign In"}</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d10] px-4 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-[#11181f] p-8 text-center shadow-2xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
            <XCircle size={28} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-white">
            {isBangla ? "অ্যাক্সেস অনুমোদিত নয়" : "Admin Access Required"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isBangla
              ? "এই পোর্টালটি শুধুমাত্র অ্যাডমিনদের জন্য সংরক্ষিত।"
              : "This external control center is restricted to store administrators."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <span>{isBangla ? "মেইন সাইটে ফিরুন" : "Back to Storefront"}</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ============ Sidebar Navigation Config ============ */
  const navItemGroups = [
    {
      group: "MAIN",
      groupBn: "প্রধান",
      items: [
        { key: "overview", href: "/adminDashboard", icon: BarChart3, en: "Dashboard", bn: "ড্যাশবোর্ড" },
      ],
    },
    {
      group: "STORE MANAGEMENT",
      groupBn: "স্টোর ম্যানেজমেন্ট",
      items: [
        {
          key: "orders",
          href: "/adminDashboard/orders",
          icon: Package,
          en: "Orders",
          bn: "অর্ডার ম্যানেজমেন্ট",
          badge: orderCounts.pending || null,
          badgeColor: "bg-amber-500 text-slate-950",
        },
        { key: "products", href: "/adminDashboard/products", icon: Box, en: "Products", bn: "পণ্যসমূহ", badge: products.length },
        { key: "categories", href: "/adminDashboard/categories", icon: FolderTree, en: "Categories", bn: "ক্যাটাগরি ও সাব-ক্যাটাগরি", badge: categories.length },
        { key: "heros", href: "/adminDashboard/heros", icon: ImageIcon, en: "Hero Banners", bn: "হোম ব্যানার", badge: heroes.length },
      ],
    },
    {
      group: "COMMUNITY & USERS",
      groupBn: "গ্রাহক ও ব্যবহারকারী",
      items: [
        { key: "users", href: "/adminDashboard/customers", icon: Users, en: "Customers", bn: "কাস্টমার ও রোল", badge: users.length },
      ],
    },
    {
      group: "CONFIGURATION",
      groupBn: "কনফিগারেশন",
      items: [
        { key: "profile", href: "/adminDashboard/profile", icon: Settings, en: "Admin Profile", bn: "অ্যাডমিন প্রোফাইল" },
      ],
    },
  ];

  const activeNavItem = navItemGroups.flatMap((g) => g.items).find((i) => i.key === activeSection);

  return (
    <AdminDashboardContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-[#080c0f] text-slate-100">
        {/* ============ Mobile Sidebar Backdrop ============ */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ============ Fixed Left Sidebar ============ */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-white/8 bg-[#0a0f15] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* ============ Brand Logo Header ============ */}
          <div className="flex h-18 items-center justify-between border-b border-white/8 px-4">
            <Link
              href="/adminDashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20">
                <Leaf size={18} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white">Pure Hill Glow</p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {isBangla ? "অ্যাডমিন পোর্টাল" : "Store Console"}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* ============ Admin Mini Profile Card ============ */}
          <div className="px-3 pt-3">
            <Link
              href="/adminDashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-2.5 text-left transition ${activeSection === "profile"
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-white/6 bg-white/[0.03] hover:border-emerald-500/30 hover:bg-white/[0.05]"
                }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.username || "Purehillglow"}
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full border border-emerald-500/40 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <UserRound size={16} />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0f15] bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">
                    {user?.username || "Purehillglow"}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">
                    {isBangla ? "সুপার অ্যাডমিন" : "Store Administrator"}
                  </p>
                </div>
              </div>
              <Settings size={14} className="shrink-0 text-slate-500 hover:text-emerald-400" />
            </Link>
          </div>

          {/* ============ Categorized Navigation Links ============ */}
          <nav className="mt-3 flex-1 space-y-4 overflow-y-auto px-3 py-1">
            {navItemGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isBangla ? group.groupBn : group.group}
                </p>
                {group.items.map(({ key, href, icon: Icon, en, bn, badge, badgeColor }) => {
                  const isActive = activeSection === key;
                  return (
                    <Link
                      key={key}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${isActive
                        ? "border-l-2 border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-xs shadow-emerald-500/10"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                        }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                        <span>{isBangla ? bn : en}</span>
                      </span>

                      {badge !== undefined && badge !== null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor ||
                            (isActive
                              ? "bg-emerald-500/25 text-emerald-300"
                              : "bg-white/8 text-slate-400")
                            }`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* ============ Sidebar Bottom Actions ============ */}
          <div className="space-y-2 border-t border-white/8 p-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <span>{isBangla ? "স্টোরফ্রন্ট ভিজিট করুন" : "Visit Storefront"}</span>
              <ExternalLink size={13} />
            </Link>

            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                router.push("/auth/login");
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
            >
              <LogOut size={15} />
              <span>{isBangla ? "লগআউট করুন" : "Logout"}</span>
            </button>
          </div>
        </aside>

        {/* ============ Main Content Area ============ */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
          {/* ============ Top Sticky Header ============ */}
          <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-white/8 bg-[#0a0f15]/90 px-4 backdrop-blur-md sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white lg:hidden"
              >
                <Menu size={19} />
              </button>

              {/* ============ Breadcrumb & Date ============ */}
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <Link href="/adminDashboard" className="font-semibold text-slate-400 hover:text-white">
                    Pure Hill Glow
                  </Link>
                  <span className="text-slate-600">/</span>
                  <span className="font-bold capitalize text-emerald-400">
                    {isBangla ? activeNavItem?.bn : activeNavItem?.en}
                  </span>
                </div>
                <p className="mt-0.5 hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
                  <Calendar size={12} className="text-slate-500" />
                  <span>
                    {new Date().toLocaleDateString(isBangla ? "bn-BD" : "en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {isBangla ? "লাইভ স্টোর" : "Live Storefront Active"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* ============ Quick Storefront Link ============ */}
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400 md:inline-flex"
              >
                <span>{isBangla ? "স্টোর দেখুন" : "Visit Store"}</span>
                <ExternalLink size={12} />
              </Link>

              {/* ============ Order Notifications Bell ============ */}
              <div className="relative" data-notif-dropdown>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  aria-label={isBangla ? "অর্ডার নোটিফিকেশন" : "Order Notifications"}
                  className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition ${showNotifDropdown
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                    : unreadOrders.length > 0
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-400"
                      : "border-white/10 bg-[#11181f] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400"
                    }`}
                >
                  <Bell size={16} className={unreadOrders.length > 0 ? "animate-pulse" : ""} />
                  {unreadOrders.length > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-md shadow-rose-500/40">
                      {unreadOrders.length > 99 ? "99+" : unreadOrders.length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-white/12 bg-[#10171e] shadow-2xl sm:w-96">
                    <div className="flex items-center justify-between border-b border-white/8 bg-[#0c1218] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-emerald-400" />
                        <h3 className="text-xs font-bold text-white">
                          {isBangla ? "নতুন অর্ডার নোটিফিকেশন" : "New Order Notifications"}
                        </h3>
                      </div>
                      {checkedSnapshot.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearNotifications}
                          className="cursor-pointer text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          {isBangla ? "সব ক্লিয়ার করুন" : "Clear All"}
                        </button>
                      )}
                    </div>

                    {checkedSnapshot.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 px-5 py-9 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-slate-500">
                          <Bell size={20} />
                        </span>
                        <p className="text-xs font-semibold text-slate-300">
                          {isBangla ? "কোনো নতুন অর্ডার নোটিফিকেশন নেই" : "No new order notifications"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isBangla
                            ? "নতুন অর্ডার এলে এখানে দেখা যাবে"
                            : "You are all caught up! New orders will appear here."}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-80 divide-y divide-white/6 overflow-y-auto">
                        {checkedSnapshot.map((ord) => (
                          <button
                            key={ord._id}
                            type="button"
                            onClick={() => {
                              setShowNotifDropdown(false);
                              setCheckedSnapshot([]);
                              router.push("/adminDashboard/orders");
                            }}
                            className="flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-white">
                                {ord.deliveryDetails?.name || "Customer"}{" "}
                                <span className="font-normal text-slate-400">placed a new order</span>
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-emerald-400">{ord.tran_id}</p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {ord.orderItems?.length || 0} item(s) •{" "}
                                {new Date(ord.createdAt).toLocaleString(isBangla ? "bn-BD" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-extrabold text-emerald-400">
                              {formatPrice(ord.totalAmount)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ============ Language Switcher ============ */}
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#11181f]">
                {["en", "bn"].map((langKey) => (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => dispatch(setLanguage(langKey))}
                    className={`cursor-pointer px-2.5 py-1.5 text-[11px] font-bold uppercase transition ${language === langKey
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {langKey}
                  </button>
                ))}
              </div>

              {/* ============ Sync Data Button ============ */}
              <button
                type="button"
                onClick={fetchAdminData}
                disabled={loading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#11181f] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">{isBangla ? "রিফ্রেশ" : "Sync Data"}</span>
              </button>
            </div>
          </header>

          {/* ============ Page Main Content ============ */}
          <main className="flex-1 p-4 sm:p-7">{children}</main>
        </div>
      </div>
    </AdminDashboardContext.Provider>
  );
}
