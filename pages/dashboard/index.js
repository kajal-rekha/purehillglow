"use client";

import { login, logout } from "@/redux/features/auth/authSlice";
import { setLanguage } from "@/redux/features/language/languageSlice";
import axios from "axios";
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Bell,
    Box,
    Calendar,
    Camera,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    Edit3,
    ExternalLink,
    FolderTree,
    Image as ImageIcon,
    ImagePlus,
    LayoutDashboard,
    Leaf,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Package,
    Phone,
    Plus,
    RefreshCw,
    Save,
    Search,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Trash2,
    TrendingUp,
    Truck,
    User,
    UserRound,
    Users,
    X,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const localized = (value, language) => {
    if (typeof value === "string") return value;
    return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const ORDER_STATUS_OPTIONS = [
    {
        value: "pending",
        en: "Pending",
        bn: "পেন্ডিং",
        icon: Clock,
        activeClass:
            "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20",
        badgeClass:
            "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
        value: "processing",
        en: "Processing",
        bn: "প্রসেসিং",
        icon: Truck,
        activeClass:
            "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20",
        badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    {
        value: "delivered",
        en: "Delivered",
        bn: "ডেলিভারড",
        icon: CheckCircle2,
        activeClass:
            "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20",
        badgeClass:
            "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
        value: "cancelled",
        en: "Cancelled",
        bn: "বাতিল",
        icon: XCircle,
        activeClass:
            "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20",
        badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: "pending", en: "Pending", bn: "পেন্ডিং" },
    { value: "paid", en: "Paid", bn: "পেইড" },
    { value: "unpaid", en: "Unpaid", bn: "আনপেইড" },
    { value: "failed", en: "Failed", bn: "ব্যর্থ" },
];

const compressImageFile = (file, maxSize = 600) =>
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
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const parseListField = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value !== "string") return [];
    return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const formatListField = (arr) => {
    if (!Array.isArray(arr)) return "";
    return arr.filter(Boolean).join("\n");
};

const INITIAL_PRODUCT_FORM = {
    nameEn: "",
    nameBn: "",
    descEn: "",
    descBn: "",
    benefitsEn: "",
    benefitsBn: "",
    ingredientsEn: "",
    ingredientsBn: "",
    usageEn: "Apply gently on clean skin",
    usageBn: "পরিষ্কার ত্বকে আলতোভাবে ব্যবহার করুন",
    unitEn: "100g",
    unitBn: "১০০ গ্রাম",
    originEn: "Bandarban, Bangladesh",
    originBn: "বান্দরবান, বাংলাদেশ",
    price: "",
    discount: "0",
    stock: "20",
    category: "",
    subCategory: "",
    featured: false,
    tags: "",
    images: [],
};

const DashboardPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { userAndToken } = useSelector((state) => state.auth);
    const language = useSelector((state) => state.language?.language);
    const isBangla = language === "bn";

    const user = userAndToken?.user;
    const token = userAndToken?.token;
    const isAdmin = user?.role === "admin";

    const [activeSection, setActiveSection] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Overview Chart State
    const [revenueRange, setRevenueRange] = useState("7d");
    const [hoveredChartIdx, setHoveredChartIdx] = useState(null);

    // Order Filters
    const [orderFilter, setOrderFilter] = useState("all");
    const [orderSearch, setOrderSearch] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState("");
    const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);

    useEffect(() => {
        if (!openStatusDropdownId) return;
        const handleOutsideClick = (e) => {
            if (!e.target.closest("[data-status-dropdown]")) {
                setOpenStatusDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [openStatusDropdownId]);

    // Product Filters & Edit State
    const [productSearch, setProductSearch] = useState("");
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
    const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);

    // Category & Subcategory Form State
    const [catForm, setCatForm] = useState({
        nameEn: "",
        nameBn: "",
        image: "",
    });
    const [editingCatId, setEditingCatId] = useState(null);
    const [isSubmittingCat, setIsSubmittingCat] = useState(false);
    const [subCatForm, setSubCatForm] = useState({
        category: "",
        nameEn: "",
        nameBn: "",
        image: "",
    });
    const [editingSubCatId, setEditingSubCatId] = useState(null);
    const [isSubmittingSubCat, setIsSubmittingSubCat] = useState(false);

    // Hero Banner Form State
    const [heroForm, setHeroForm] = useState({
        titleEn: "",
        titleBn: "",
        descEn: "",
        descBn: "",
        imageURL: "",
    });
    const [editingHeroId, setEditingHeroId] = useState(null);
    const [isSubmittingHero, setIsSubmittingHero] = useState(false);

    // User Search
    const [userSearch, setUserSearch] = useState("");

    // Admin Profile Form State
    const [profileForm, setProfileForm] = useState({
        username: "",
        email: "",
        phone: "",
        address: "",
        image: "",
        password: "",
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Order Notification State
    const SEEN_ORDERS_STORAGE_KEY = "phg_admin_seen_order_ids";
    const [seenOrderIds, setSeenOrderIds] = useState(null);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [checkedSnapshot, setCheckedSnapshot] = useState([]);
    const knownOrderIdsRef = useRef(null);

    // Data Stores
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [heroes, setHeroes] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = localStorage.getItem(SEEN_ORDERS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setSeenOrderIds(parsed);
                    return;
                }
            }
        } catch {
            // ignore storage errors
        }
        setSeenOrderIds([]);
    }, []);

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
                localStorage.setItem(
                    SEEN_ORDERS_STORAGE_KEY,
                    JSON.stringify(uniqueIds)
                );
            } catch {
                // ignore storage errors
            }
        }
    }, []);

    // Seed seen non-pending orders only on very first visit when storage has no record
    useEffect(() => {
        if (orders.length === 0 || seenOrderIds === null) return;
        if (
            typeof window !== "undefined" &&
            localStorage.getItem(SEEN_ORDERS_STORAGE_KEY) === null
        ) {
            const nonPendingIds = orders
                .filter((o) => o.orderStatus !== "pending")
                .map((o) => o._id);
            persistSeenOrderIds(nonPendingIds);
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
        // Snapshot currently unread orders so the admin can review them in the panel,
        // and immediately mark all current orders as seen so the notification badge becomes empty.
        setCheckedSnapshot(unreadOrders);
        setShowNotifDropdown(true);
        if (unreadOrders.length > 0) {
            persistSeenOrderIds([
                ...(seenOrderIds || []),
                ...orders.map((o) => o._id),
            ]);
        }
    };

    const handleClearNotifications = () => {
        persistSeenOrderIds([
            ...(seenOrderIds || []),
            ...orders.map((o) => o._id),
        ]);
        setCheckedSnapshot([]);
        setShowNotifDropdown(false);
    };

    useEffect(() => {
        if (user) {
            setProfileForm({
                username: user.username || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                image: user.image || "",
                password: "",
            });
        }
    }, [user]);

    // Sync user role from DB on load
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
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, [user?._id, user?.role, token, dispatch]);

    const fetchAdminData = useCallback(async () => {
        if (!token || !isAdmin) return;
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [
                ordersRes,
                prodsRes,
                catsRes,
                subsRes,
                herosRes,
                usersRes,
            ] = await Promise.allSettled([
                axios.get("/api/orders", { headers }),
                axios.get("/api/products"),
                axios.get("/api/categories"),
                axios.get("/api/subcategories"),
                axios.get("/api/heros"),
                axios.get("/api/users", { headers }),
            ]);

            const fetchedOrders =
                ordersRes.status === "fulfilled" &&
                Array.isArray(ordersRes.value.data)
                    ? ordersRes.value.data
                    : [];
            knownOrderIdsRef.current = new Set(fetchedOrders.map((o) => o._id));
            setOrders(fetchedOrders);
            if (
                prodsRes.status === "fulfilled" &&
                Array.isArray(prodsRes.value.data)
            ) {
                setProducts(prodsRes.value.data);
            }
            if (
                catsRes.status === "fulfilled" &&
                Array.isArray(catsRes.value.data)
            ) {
                setCategories(catsRes.value.data);
            }
            if (
                subsRes.status === "fulfilled" &&
                Array.isArray(subsRes.value.data)
            ) {
                setSubcategories(subsRes.value.data);
            }
            if (
                herosRes.status === "fulfilled" &&
                Array.isArray(herosRes.value.data)
            ) {
                setHeroes(herosRes.value.data);
            }
            if (
                usersRes.status === "fulfilled" &&
                Array.isArray(usersRes.value.data)
            ) {
                setUsers(usersRes.value.data);
            }
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // Live background polling for new incoming orders
    useEffect(() => {
        if (!token || !isAdmin) return;
        const interval = setInterval(async () => {
            try {
                const { data } = await axios.get("/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!Array.isArray(data)) return;

                if (knownOrderIdsRef.current) {
                    const newlyArrived = data.filter(
                        (o) => !knownOrderIdsRef.current.has(o._id)
                    );
                    if (newlyArrived.length > 0) {
                        toast.success(
                            isBangla
                                ? `নতুন ${newlyArrived.length}টি অর্ডার এসেছে!`
                                : `${newlyArrived.length} new order${
                                      newlyArrived.length > 1 ? "s" : ""
                                  } received!`
                        );
                    }
                }
                knownOrderIdsRef.current = new Set(data.map((o) => o._id));
                setOrders(data);
            } catch {
                // ignore background polling failures
            }
        }, 12000);
        return () => clearInterval(interval);
    }, [token, isAdmin, isBangla]);

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

    // ================= HANDLERS =================
    const handleOrderStatusChange = async (orderId, updates) => {
        setUpdatingOrderId(orderId);
        try {
            const { data } = await axios.put(
                `/api/orders/${orderId}`,
                updates,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? data.updatedOrder || { ...o, ...updates }
                        : o
                )
            );
            toast.success(
                isBangla
                    ? "অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!"
                    : "Order status updated!"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to update order status"
            );
        } finally {
            setUpdatingOrderId("");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await axios.delete(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            toast.success(isBangla ? "অর্ডার মুছে ফেলা হয়েছে" : "Order deleted");
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to delete order");
        }
    };

    const openCreateProduct = () => {
        setEditingProductId(null);
        setProductForm(INITIAL_PRODUCT_FORM);
        setShowProductModal(true);
    };

    const openEditProduct = (product) => {
        setEditingProductId(product._id);
        setProductForm({
            nameEn: product.name?.en || "",
            nameBn: product.name?.bn || "",
            descEn: product.description?.en || "",
            descBn: product.description?.bn || "",
            benefitsEn: formatListField(product.benefits?.en),
            benefitsBn: formatListField(product.benefits?.bn),
            ingredientsEn: formatListField(product.ingredients?.en),
            ingredientsBn: formatListField(product.ingredients?.bn),
            usageEn:
                formatListField(product.usage?.en) ||
                "Apply gently on clean skin",
            usageBn:
                formatListField(product.usage?.bn) ||
                "পরিষ্কার ত্বকে আলতোভাবে ব্যবহার করুন",
            unitEn: product.unit?.en || "100g",
            unitBn: product.unit?.bn || "১০০ গ্রাম",
            originEn: product.origin?.en || "Bandarban, Bangladesh",
            originBn: product.origin?.bn || "বান্দরবান, বাংলাদেশ",
            price: String(product.price ?? ""),
            discount: String(product.discount ?? "0"),
            stock: String(product.stock ?? "0"),
            category: String(
                product.category_id?._id || product.category_id || ""
            ),
            subCategory: String(
                product.subcategory_id?._id || product.subcategory_id || ""
            ),
            featured: Boolean(product.featured),
            tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
            images: Array.isArray(product.images)
                ? product.images.filter(Boolean)
                : [],
        });
        setShowProductModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const cleanedImages = Array.isArray(productForm.images)
            ? productForm.images.filter(Boolean)
            : [];

        if (
            !productForm.nameEn.trim() ||
            !productForm.nameBn.trim() ||
            !productForm.descEn.trim() ||
            !productForm.descBn.trim() ||
            !productForm.unitEn.trim() ||
            !productForm.unitBn.trim() ||
            !productForm.originEn.trim() ||
            !productForm.originBn.trim() ||
            !productForm.price ||
            !productForm.category ||
            cleanedImages.length === 0
        ) {
            toast.error(
                isBangla
                    ? "নাম, বিবরণ, ইউনিট, উৎপত্তিস্থল, দাম, ক্যাটাগরি এবং অন্তত ১টি ছবি আবশ্যক।"
                    : "Name, description, unit, origin, price, category, and at least 1 image are required."
            );
            return;
        }

        const matchedSub =
            productForm.subCategory ||
            subcategories.find(
                (s) =>
                    String(s.category_id?._id || s.category_id) ===
                    String(productForm.category)
            )?._id;

        if (!matchedSub) {
            toast.error(
                isBangla
                    ? "অনুগ্রহ করে একটি সাব-ক্যাটাগরি নির্বাচন বা তৈরি করুন।"
                    : "Please select or create a subcategory for this category."
            );
            return;
        }

        const usageEnList = parseListField(productForm.usageEn);
        const usageBnList = parseListField(productForm.usageBn);

        if (usageEnList.length === 0 || usageBnList.length === 0) {
            toast.error(
                isBangla
                    ? "ব্যবহারের নিয়ম (ইংরেজি ও বাংলা) আবশ্যক।"
                    : "Usage instructions (English & Bangla) are required."
            );
            return;
        }

        setIsSubmittingProduct(true);
        try {
            const payload = {
                name: {
                    en: productForm.nameEn.trim(),
                    bn: productForm.nameBn.trim(),
                },
                description: {
                    en: productForm.descEn.trim(),
                    bn: productForm.descBn.trim(),
                },
                benefits: {
                    en: parseListField(productForm.benefitsEn),
                    bn: parseListField(productForm.benefitsBn),
                },
                ingredients: {
                    en: parseListField(productForm.ingredientsEn),
                    bn: parseListField(productForm.ingredientsBn),
                },
                usage: {
                    en: usageEnList,
                    bn: usageBnList,
                },
                unit: {
                    en: productForm.unitEn.trim(),
                    bn: productForm.unitBn.trim(),
                },
                origin: {
                    en: productForm.originEn.trim(),
                    bn: productForm.originBn.trim(),
                },
                price: Number(productForm.price),
                discount: Number(productForm.discount) || 0,
                stock: Number(productForm.stock) || 0,
                featured: Boolean(productForm.featured),
                category: productForm.category,
                subCategory: matchedSub,
                tags: parseListField(productForm.tags),
                images: cleanedImages,
            };

            if (editingProductId) {
                const { data } = await axios.put(
                    `/api/products/${editingProductId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProducts((prev) =>
                    prev.map((p) => (p._id === editingProductId ? data : p))
                );
                toast.success(
                    isBangla ? "পণ্য আপডেট হয়েছে!" : "Product updated!"
                );
            } else {
                const { data } = await axios.post("/api/products", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProducts((prev) => [data, ...prev]);
                toast.success(
                    isBangla ? "নতুন পণ্য যোগ হয়েছে!" : "Product added!"
                );
            }

            setShowProductModal(false);
            setEditingProductId(null);
            setProductForm(INITIAL_PRODUCT_FORM);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to save product");
        } finally {
            setIsSubmittingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts((prev) => prev.filter((p) => p._id !== productId));
            toast.success(isBangla ? "পণ্য ডিলিট হয়েছে" : "Product deleted");
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to delete product"
            );
        }
    };

    const openEditCategory = (cat) => {
        setEditingCatId(cat._id);
        setCatForm({
            nameEn: cat.name?.en || "",
            nameBn: cat.name?.bn || "",
            image: cat.image || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEditCategory = () => {
        setEditingCatId(null);
        setCatForm({ nameEn: "", nameBn: "", image: "" });
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (
            !catForm.nameEn.trim() ||
            !catForm.nameBn.trim() ||
            !catForm.image
        ) {
            toast.error(
                isBangla
                    ? "ক্যাটাগরির নাম ও ছবি আবশ্যক।"
                    : "Category names and image are required."
            );
            return;
        }
        setIsSubmittingCat(true);
        try {
            const payload = {
                name: {
                    en: catForm.nameEn.trim(),
                    bn: catForm.nameBn.trim(),
                },
                image: catForm.image,
            };

            if (editingCatId) {
                const { data } = await axios.put(
                    `/api/categories/${editingCatId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCategories((prev) =>
                    prev.map((c) => (c._id === editingCatId ? data : c))
                );
                toast.success(
                    isBangla
                        ? "ক্যাটাগরি আপডেট হয়েছে!"
                        : "Category updated!"
                );
                cancelEditCategory();
            } else {
                const { data } = await axios.post("/api/categories", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategories((prev) => [...prev, data]);
                setCatForm({ nameEn: "", nameBn: "", image: "" });
                toast.success(
                    isBangla ? "ক্যাটাগরি তৈরি হয়েছে!" : "Category created!"
                );
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to save category"
            );
        } finally {
            setIsSubmittingCat(false);
        }
    };

    const handleDeleteCategory = async (catId) => {
        try {
            await axios.delete(`/api/categories/${catId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories((prev) => prev.filter((c) => c._id !== catId));
            if (editingCatId === catId) {
                cancelEditCategory();
            }
            toast.success(
                isBangla ? "ক্যাটাগরি মুছে ফেলা হয়েছে" : "Category deleted"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to delete category"
            );
        }
    };

    const openEditSubCategory = (sub) => {
        setEditingSubCatId(sub._id);
        setSubCatForm({
            category: String(sub.category_id?._id || sub.category_id || ""),
            nameEn: sub.name?.en || "",
            nameBn: sub.name?.bn || "",
            image: sub.image || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEditSubCategory = () => {
        setEditingSubCatId(null);
        setSubCatForm({ category: "", nameEn: "", nameBn: "", image: "" });
    };

    const handleSaveSubCategory = async (e) => {
        e.preventDefault();
        if (
            !subCatForm.category ||
            !subCatForm.nameEn.trim() ||
            !subCatForm.nameBn.trim()
        ) {
            toast.error(
                isBangla
                    ? "ক্যাটাগরি এবং সাব-ক্যাটাগরির নাম আবশ্যক।"
                    : "Parent category and subcategory names are required."
            );
            return;
        }
        const fallbackImg =
            subCatForm.image ||
            categories.find((c) => c._id === subCatForm.category)?.image ||
            "/assets/purehillglowpr.jpg";

        setIsSubmittingSubCat(true);
        try {
            const payload = {
                category: subCatForm.category,
                category_id: subCatForm.category,
                name: {
                    en: subCatForm.nameEn.trim(),
                    bn: subCatForm.nameBn.trim(),
                },
                image: fallbackImg,
            };

            if (editingSubCatId) {
                const { data } = await axios.put(
                    `/api/subcategories/${editingSubCatId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSubcategories((prev) =>
                    prev.map((s) => (s._id === editingSubCatId ? data : s))
                );
                toast.success(
                    isBangla
                        ? "সাব-ক্যাটাগরি আপডেট হয়েছে!"
                        : "Subcategory updated!"
                );
                cancelEditSubCategory();
            } else {
                const { data } = await axios.post(
                    "/api/subcategories",
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSubcategories((prev) => [...prev, data]);
                setSubCatForm({
                    category: "",
                    nameEn: "",
                    nameBn: "",
                    image: "",
                });
                toast.success(
                    isBangla
                        ? "সাব-ক্যাটাগরি তৈরি হয়েছে!"
                        : "Subcategory created!"
                );
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to save subcategory"
            );
        } finally {
            setIsSubmittingSubCat(false);
        }
    };

    const handleDeleteSubCategory = async (subId) => {
        try {
            await axios.delete(`/api/subcategories/${subId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubcategories((prev) => prev.filter((s) => s._id !== subId));
            if (editingSubCatId === subId) {
                cancelEditSubCategory();
            }
            toast.success(
                isBangla
                    ? "সাব-ক্যাটাগরি মুছে ফেলা হয়েছে"
                    : "Subcategory deleted"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to delete subcategory"
            );
        }
    };

    const openEditHero = (hero) => {
        setEditingHeroId(hero._id);
        setHeroForm({
            titleEn: hero.title?.en || "",
            titleBn: hero.title?.bn || "",
            descEn: hero.description?.en || "",
            descBn: hero.description?.bn || "",
            imageURL: hero.imageURL || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEditHero = () => {
        setEditingHeroId(null);
        setHeroForm({
            titleEn: "",
            titleBn: "",
            descEn: "",
            descBn: "",
            imageURL: "",
        });
    };

    const handleSaveHero = async (e) => {
        e.preventDefault();
        if (
            !heroForm.titleEn.trim() ||
            !heroForm.titleBn.trim() ||
            !heroForm.descEn.trim() ||
            !heroForm.descBn.trim() ||
            !heroForm.imageURL
        ) {
            toast.error(
                isBangla
                    ? "হিরো ব্যানারের সব তথ্য ও ছবি আবশ্যক।"
                    : "All hero banner fields and image are required."
            );
            return;
        }
        setIsSubmittingHero(true);
        try {
            const payload = {
                title: {
                    en: heroForm.titleEn.trim(),
                    bn: heroForm.titleBn.trim(),
                },
                description: {
                    en: heroForm.descEn.trim(),
                    bn: heroForm.descBn.trim(),
                },
                imageURL: heroForm.imageURL,
            };

            if (editingHeroId) {
                const { data } = await axios.put(
                    `/api/heros/${editingHeroId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const updated = data?.updatedHero || data;
                if (updated?._id) {
                    setHeroes((prev) =>
                        prev.map((h) => (h._id === editingHeroId ? updated : h))
                    );
                }
                toast.success(
                    isBangla
                        ? "হিরো ব্যানার আপডেট হয়েছে!"
                        : "Hero banner updated!"
                );
                cancelEditHero();
            } else {
                const { data } = await axios.post("/api/heros", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (data?.hero) {
                    setHeroes((prev) => [data.hero, ...prev]);
                }
                setHeroForm({
                    titleEn: "",
                    titleBn: "",
                    descEn: "",
                    descBn: "",
                    imageURL: "",
                });
                toast.success(
                    isBangla
                        ? "নতুন হিরো ব্যানার যোগ হয়েছে!"
                        : "Hero banner added!"
                );
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Failed to save hero banner"
            );
        } finally {
            setIsSubmittingHero(false);
        }
    };

    const handleDeleteHero = async (heroId) => {
        try {
            await axios.delete(`/api/heros/${heroId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHeroes((prev) => prev.filter((h) => h._id !== heroId));
            if (editingHeroId === heroId) {
                cancelEditHero();
            }
            toast.success(
                isBangla ? "হিরো ব্যানার ডিলিট হয়েছে" : "Hero banner deleted"
            );
        } catch (err) {
            toast.error("Failed to delete hero banner");
        }
    };

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            const { data } = await axios.put(
                `/api/users/${targetUserId}`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers((prev) =>
                prev.map((u) => (u._id === targetUserId ? data : u))
            );
            toast.success(
                isBangla
                    ? `ইউজারের রোল ${newRole} করা হয়েছে`
                    : `Role updated to ${newRole}`
            );
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to update role");
        }
    };

    const handleDeleteUser = async (targetUserId) => {
        if (targetUserId === user?._id) {
            toast.error("You cannot delete your own admin account.");
            return;
        }
        try {
            await axios.delete(`/api/users/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prev) => prev.filter((u) => u._id !== targetUserId));
            toast.success(isBangla ? "ইউজার ডিলিট হয়েছে" : "User deleted");
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to delete user");
        }
    };

    const handleSaveAdminProfile = async (e) => {
        e.preventDefault();
        if (!user?._id) return;
        setIsSavingProfile(true);
        try {
            const payload = {
                username: profileForm.username.trim(),
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim(),
                address: profileForm.address.trim(),
                image: profileForm.image,
            };
            if (profileForm.password.trim()) {
                payload.password = profileForm.password.trim();
            }

            const { data } = await axios.put(
                `/api/users/${user._id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            dispatch(login({ user: data, token }));
            setProfileForm((prev) => ({ ...prev, password: "" }));
            toast.success(
                isBangla
                    ? "অ্যাডমিন প্রোফাইল সফলভাবে আপডেট হয়েছে!"
                    : "Admin profile updated!"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to update profile"
            );
        } finally {
            setIsSavingProfile(false);
        }
    };

    // ================= COMPUTED DATA =================
    const orderCounts = useMemo(() => {
        const counts = {
            all: orders.length,
            pending: 0,
            processing: 0,
            delivered: 0,
            cancelled: 0,
        };
        orders.forEach((o) => {
            if (counts[o.orderStatus] !== undefined) {
                counts[o.orderStatus] += 1;
            }
        });
        return counts;
    }, [orders]);

    const totalRevenue = useMemo(
        () =>
            orders
                .filter((o) => o.orderStatus !== "cancelled")
                .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
        [orders]
    );

    const deliveredRevenue = useMemo(
        () =>
            orders
                .filter((o) => o.orderStatus === "delivered")
                .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
        [orders]
    );

    const lowStockProducts = useMemo(
        () => products.filter((p) => Number(p.stock) <= 5),
        [products]
    );

    const revenueAnalytics = useMemo(() => {
        const latestOrderTs = orders.reduce((max, o) => {
            const ts = o.createdAt ? new Date(o.createdAt).getTime() : 0;
            return ts > max ? ts : max;
        }, 0);
        const anchorDate = new Date(Math.max(Date.now(), latestOrderTs));

        const pad2 = (n) => String(n).padStart(2, "0");
        const toDateKey = (d) =>
            `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        const toMonthKey = (d) =>
            `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

        const buckets = [];
        const bucketMap = new Map();

        if (revenueRange === "6m") {
            for (let i = 5; i >= 0; i -= 1) {
                const d = new Date(
                    anchorDate.getFullYear(),
                    anchorDate.getMonth() - i,
                    1
                );
                const key = toMonthKey(d);
                const label = d.toLocaleDateString(
                    isBangla ? "bn-BD" : "en-US",
                    { month: "short" }
                );
                const fullLabel = d.toLocaleDateString(
                    isBangla ? "bn-BD" : "en-US",
                    { month: "long", year: "numeric" }
                );
                const item = {
                    key,
                    label,
                    fullLabel,
                    total: 0,
                    delivered: 0,
                    count: 0,
                };
                buckets.push(item);
                bucketMap.set(key, item);
            }
            orders.forEach((ord) => {
                if (!ord.createdAt) return;
                const d = new Date(ord.createdAt);
                const bucket = bucketMap.get(toMonthKey(d));
                if (!bucket) return;
                if (ord.orderStatus !== "cancelled") {
                    bucket.total += Number(ord.totalAmount) || 0;
                    bucket.count += 1;
                }
                if (ord.orderStatus === "delivered") {
                    bucket.delivered += Number(ord.totalAmount) || 0;
                }
            });
        } else {
            const days = revenueRange === "14d" ? 14 : 7;
            for (let i = days - 1; i >= 0; i -= 1) {
                const d = new Date(
                    anchorDate.getFullYear(),
                    anchorDate.getMonth(),
                    anchorDate.getDate() - i
                );
                const key = toDateKey(d);
                const label = d.toLocaleDateString(
                    isBangla ? "bn-BD" : "en-US",
                    { day: "numeric", month: "short" }
                );
                const fullLabel = d.toLocaleDateString(
                    isBangla ? "bn-BD" : "en-US",
                    { weekday: "short", month: "short", day: "numeric" }
                );
                const item = {
                    key,
                    label,
                    fullLabel,
                    total: 0,
                    delivered: 0,
                    count: 0,
                };
                buckets.push(item);
                bucketMap.set(key, item);
            }
            orders.forEach((ord) => {
                if (!ord.createdAt) return;
                const d = new Date(ord.createdAt);
                const bucket = bucketMap.get(toDateKey(d));
                if (!bucket) return;
                if (ord.orderStatus !== "cancelled") {
                    bucket.total += Number(ord.totalAmount) || 0;
                    bucket.count += 1;
                }
                if (ord.orderStatus === "delivered") {
                    bucket.delivered += Number(ord.totalAmount) || 0;
                }
            });
        }

        const rawMax = Math.max(...buckets.map((b) => b.total), 0);
        const step =
            rawMax <= 1000
                ? 250
                : rawMax <= 5000
                ? 1000
                : rawMax <= 20000
                ? 5000
                : 10000;
        const chartMax = Math.max(Math.ceil((rawMax || 1000) / step) * step, 1000);
        const rangeTotal = buckets.reduce((s, b) => s + b.total, 0);
        const rangeDelivered = buckets.reduce((s, b) => s + b.delivered, 0);
        const rangeOrders = buckets.reduce((s, b) => s + b.count, 0);
        const avgOrderValue =
            rangeOrders > 0 ? Math.round(rangeTotal / rangeOrders) : 0;
        const peakBucket = buckets.reduce(
            (best, cur) => (cur.total > best.total ? cur : best),
            buckets[0] || { label: "-", total: 0 }
        );

        return {
            buckets,
            chartMax,
            rangeTotal,
            rangeDelivered,
            rangeOrders,
            avgOrderValue,
            peakBucket,
        };
    }, [orders, revenueRange, isBangla]);

    const statusAnalytics = useMemo(() => {
        const defs = [
            {
                key: "delivered",
                en: "Delivered",
                bn: "ডেলিভারড",
                color: "#10b981",
                barClass: "bg-emerald-500",
                textClass: "text-emerald-400",
            },
            {
                key: "processing",
                en: "Processing",
                bn: "প্রসেসিং",
                color: "#38bdf8",
                barClass: "bg-sky-400",
                textClass: "text-sky-400",
            },
            {
                key: "pending",
                en: "Pending",
                bn: "পেন্ডিং",
                color: "#f59e0b",
                barClass: "bg-amber-400",
                textClass: "text-amber-400",
            },
            {
                key: "cancelled",
                en: "Cancelled",
                bn: "বাতিল",
                color: "#f43f5e",
                barClass: "bg-rose-500",
                textClass: "text-rose-400",
            },
        ];

        const totalOrdersCount = orders.length || 0;
        const rows = defs.map((def) => {
            const matching = orders.filter((o) => o.orderStatus === def.key);
            const count = matching.length;
            const amount = matching.reduce(
                (sum, o) => sum + (Number(o.totalAmount) || 0),
                0
            );
            const pct =
                totalOrdersCount > 0
                    ? Math.round((count / totalOrdersCount) * 100)
                    : 0;
            return { ...def, count, amount, pct };
        });

        const deliveryRate =
            totalOrdersCount > 0
                ? Math.round((orderCounts.delivered / totalOrdersCount) * 100)
                : 0;

        return { rows, totalOrdersCount, deliveryRate };
    }, [orders, orderCounts.delivered]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (orderFilter !== "all" && order.orderStatus !== orderFilter) {
                return false;
            }
            if (orderSearch.trim()) {
                const q = orderSearch.trim().toLowerCase();
                const hay = [
                    order.tran_id,
                    order.deliveryDetails?.name,
                    order.deliveryDetails?.phone,
                    order.deliveryDetails?.district,
                    order.user_id?.username,
                    order.user_id?.email,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [orders, orderFilter, orderSearch]);

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const q = productSearch.trim().toLowerCase();
        return products.filter(
            (p) =>
                (p.name?.en || "").toLowerCase().includes(q) ||
                (p.name?.bn || "").toLowerCase().includes(q)
        );
    }, [products, productSearch]);

    const filteredUsers = useMemo(() => {
        if (!userSearch.trim()) return users;
        const q = userSearch.trim().toLowerCase();
        return users.filter(
            (u) =>
                (u.username || "").toLowerCase().includes(q) ||
                (u.email || "").toLowerCase().includes(q) ||
                (u.phone || "").toLowerCase().includes(q)
        );
    }, [users, userSearch]);

    // ================= AUTH GUARD =================
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
                        <span>
                            {isBangla ? "মেইন সাইটে ফিরুন" : "Back to Storefront"}
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    const navItems = [
        {
            key: "overview",
            icon: BarChart3,
            en: "Dashboard",
            bn: "ড্যাশবোর্ড",
        },
        {
            key: "orders",
            icon: Package,
            en: "Orders",
            bn: "অর্ডার ম্যানেজমেন্ট",
            badge: orderCounts.pending || null,
            badgeColor: "bg-amber-500 text-slate-950",
        },
        {
            key: "products",
            icon: Box,
            en: "Products",
            bn: "পণ্যসমূহ",
            badge: products.length,
        },
        {
            key: "categories",
            icon: FolderTree,
            en: "Categories",
            bn: "ক্যাটাগরি ও সাব-ক্যাটাগরি",
            badge: categories.length,
        },
        {
            key: "heros",
            icon: ImageIcon,
            en: "Hero Banners",
            bn: "হোম ব্যানার",
            badge: heroes.length,
        },
        {
            key: "users",
            icon: Users,
            en: "Customers",
            bn: "কাস্টমার ও রোল",
            badge: users.length,
        },
        {
            key: "profile",
            icon: Settings,
            en: "Admin Profile",
            bn: "অ্যাডমিন প্রোফাইল",
        },
    ];

    const darkInput =
        "w-full rounded-xl border border-white/10 bg-[#0b1015] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15";

    return (
        <div className="flex min-h-screen bg-[#080c0f] text-slate-100">
            {/* ================= MOBILE SIDEBAR BACKDROP ================= */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* ================= DARK SIDEBAR ================= */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-white/8 bg-[#0c1217] transition-transform duration-300 lg:static lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Admin Header */}
                <div className="flex h-18 items-center justify-between border-b border-white/8 px-4">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveSection("profile");
                            setSidebarOpen(false);
                        }}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-white/[0.04]"
                    >
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.username || "Purehillglow"}
                                width={40}
                                height={40}
                                className="h-10 w-10 shrink-0 rounded-full border border-emerald-500/40 object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                <UserRound size={18} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold tracking-wide text-white">
                                {user?.username || "Purehillglow"}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                                <Sparkles size={10} />
                                {isBangla ? "অ্যাডমিন পোর্টাল" : "Admin Console"}
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Links */}
                <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
                    {navItems.map(
                        ({ key, icon: Icon, en, bn, badge, badgeColor }) => {
                            const isActive = activeSection === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setActiveSection(key);
                                        setSidebarOpen(false);
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                                        isActive
                                            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon size={17} />
                                        <span>{isBangla ? bn : en}</span>
                                    </span>

                                    {badge !== undefined && badge !== null && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                badgeColor ||
                                                (isActive
                                                    ? "bg-emerald-500/20 text-emerald-300"
                                                    : "bg-white/8 text-slate-400")
                                            }`}
                                        >
                                            {badge}
                                        </span>
                                    )}
                                </button>
                            );
                        }
                    )}
                </nav>

                {/* Sidebar Bottom Actions */}
                <div className="space-y-2 border-t border-white/8 p-4">
                    <Link
                        href="/"
                        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                        <span>
                            {isBangla ? "মেইন ওয়েবসাইট দেখুন" : "Visit Storefront"}
                        </span>
                        <ExternalLink size={14} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            dispatch(logout());
                            router.push("/auth/login");
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
                    >
                        <LogOut size={16} />
                        <span>{isBangla ? "লগআউট করুন" : "Logout"}</span>
                    </button>
                </div>
            </aside>

            {/* ================= MAIN CONTENT AREA ================= */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top Sticky Header */}
                <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-white/8 bg-[#080c0f]/90 px-4 backdrop-blur-md sm:px-7">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white lg:hidden"
                        >
                            <Menu size={19} />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 sm:flex">
                                <Leaf size={18} strokeWidth={2.2} />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-base font-bold tracking-wide text-white sm:text-lg">
                                        Pure Hill Glow
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                                        {isBangla ? "লাইভ স্টোর" : "Live Store"}
                                    </span>
                                </div>
                                <p className="mt-0.5 hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex">
                                    <span className="font-semibold text-emerald-400">
                                        {isBangla
                                            ? navItems.find(
                                                  (i) => i.key === activeSection
                                              )?.bn
                                            : navItems.find(
                                                  (i) => i.key === activeSection
                                              )?.en}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span>
                                        {new Date().toLocaleDateString(
                                            isBangla ? "bn-BD" : "en-US",
                                            {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            }
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Order Notifications Bell */}
                        <div className="relative" data-notif-dropdown>
                            <button
                                type="button"
                                onClick={handleToggleNotifications}
                                aria-label={
                                    isBangla
                                        ? "অর্ডার নোটিফিকেশন"
                                        : "Order Notifications"
                                }
                                className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition ${
                                    showNotifDropdown
                                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                                        : unreadOrders.length > 0
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-400"
                                        : "border-white/10 bg-[#11181f] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400"
                                }`}
                            >
                                <Bell
                                    size={16}
                                    className={
                                        unreadOrders.length > 0
                                            ? "animate-pulse"
                                            : ""
                                    }
                                />
                                {unreadOrders.length > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-md shadow-rose-500/40">
                                        {unreadOrders.length > 99
                                            ? "99+"
                                            : unreadOrders.length}
                                    </span>
                                )}
                            </button>

                            {showNotifDropdown && (
                                <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-white/12 bg-[#10171e] shadow-2xl sm:w-96">
                                    <div className="flex items-center justify-between border-b border-white/8 bg-[#0c1218] px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Bell
                                                size={14}
                                                className="text-emerald-400"
                                            />
                                            <h3 className="text-xs font-bold text-white">
                                                {isBangla
                                                    ? "নতুন অর্ডার নোটিফিকেশন"
                                                    : "New Order Notifications"}
                                            </h3>
                                        </div>
                                        {checkedSnapshot.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleClearNotifications
                                                }
                                                className="cursor-pointer text-[11px] font-semibold text-emerald-400 hover:underline"
                                            >
                                                {isBangla
                                                    ? "সব ক্লিয়ার করুন"
                                                    : "Clear All"}
                                            </button>
                                        )}
                                    </div>

                                    {checkedSnapshot.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center gap-2 px-5 py-9 text-center">
                                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-slate-500">
                                                <Bell size={20} />
                                            </span>
                                            <p className="text-xs font-semibold text-slate-300">
                                                {isBangla
                                                    ? "কোনো নতুন অর্ডার নোটিফিকেশন নেই"
                                                    : "No new order notifications"}
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
                                                        setShowNotifDropdown(
                                                            false
                                                        );
                                                        setCheckedSnapshot([]);
                                                        setActiveSection(
                                                            "orders"
                                                        );
                                                        setOrderFilter("all");
                                                    }}
                                                    className="flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-bold text-white">
                                                            {ord.deliveryDetails
                                                                ?.name ||
                                                                "Customer"}{" "}
                                                            <span className="font-normal text-slate-400">
                                                                placed a new
                                                                order
                                                            </span>
                                                        </p>
                                                        <p className="mt-0.5 font-mono text-[11px] text-emerald-400">
                                                            {ord.tran_id}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                            {
                                                                ord.orderItems
                                                                    ?.length ||
                                                                    0
                                                            }{" "}
                                                            item(s) •{" "}
                                                            {new Date(
                                                                ord.createdAt
                                                            ).toLocaleString(
                                                                isBangla
                                                                    ? "bn-BD"
                                                                    : "en-US",
                                                                {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-extrabold text-emerald-400">
                                                        {formatPrice(
                                                            ord.totalAmount
                                                        )}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Language Switcher */}
                        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#11181f]">
                            <button
                                type="button"
                                onClick={() => dispatch(setLanguage("en"))}
                                className={`cursor-pointer px-2.5 py-1.5 text-[11px] font-bold transition ${
                                    language === "en"
                                        ? "bg-emerald-500 text-slate-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                onClick={() => dispatch(setLanguage("bn"))}
                                className={`cursor-pointer px-2.5 py-1.5 text-[11px] font-bold transition ${
                                    language === "bn"
                                        ? "bg-emerald-500 text-slate-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                BN
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={fetchAdminData}
                            disabled={loading}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#11181f] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-400"
                        >
                            <RefreshCw
                                size={14}
                                className={loading ? "animate-spin" : ""}
                            />
                            <span className="hidden sm:inline">
                                {isBangla ? "রিফ্রেশ" : "Sync Data"}
                            </span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-7">
                    {/* =========================================================
                        1. OVERVIEW & ANALYTICS
                    ========================================================= */}
                    {activeSection === "overview" && (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-400">
                                            {isBangla
                                                ? "মোট অর্ডার ভ্যালু"
                                                : "Total Order Revenue"}
                                        </span>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                                            <TrendingUp size={19} />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-2xl font-extrabold text-white">
                                        {formatPrice(totalRevenue)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-emerald-400">
                                        {isBangla
                                            ? `ডেলিভারড আয়: ${formatPrice(
                                                  deliveredRevenue
                                              )}`
                                            : `Delivered revenue: ${formatPrice(
                                                  deliveredRevenue
                                              )}`}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-400">
                                            {isBangla
                                                ? "পেন্ডিং ও প্রসেসিং"
                                                : "Pending & Processing"}
                                        </span>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                                            <Clock size={19} />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-2xl font-extrabold text-white">
                                        {orderCounts.pending +
                                            orderCounts.processing}
                                    </p>
                                    <p className="mt-1 text-[11px] text-amber-400">
                                        {orderCounts.pending} Pending •{" "}
                                        {orderCounts.processing} Processing
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-400">
                                            {isBangla
                                                ? "সম্পন্ন ডেলিভারি"
                                                : "Completed Orders"}
                                        </span>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                                            <CheckCircle2 size={19} />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-2xl font-extrabold text-white">
                                        {orderCounts.delivered}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        {isBangla
                                            ? `মোট ${orders.length}টি অর্ডারের মধ্যে`
                                            : `Out of ${orders.length} total orders`}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-400">
                                            {isBangla
                                                ? "পণ্য ও কাস্টমার"
                                                : "Catalog & Customers"}
                                        </span>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                                            <Box size={19} />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-2xl font-extrabold text-white">
                                        {products.length}{" "}
                                        <span className="text-sm font-normal text-slate-400">
                                            items
                                        </span>
                                    </p>
                                    <p className="mt-1 text-[11px] text-purple-400">
                                        {categories.length} Categories •{" "}
                                        {users.length} Users
                                    </p>
                                </div>
                            </div>

                            {/* Revenue Overview Chart & Order Distribution */}
                            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                                {/* Revenue Analytics SVG Area/Bar Chart */}
                                <section className="rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <BarChart3
                                                    size={16}
                                                    className="text-emerald-400"
                                                />
                                                <h2 className="text-sm font-bold text-white">
                                                    {isBangla
                                                        ? "রেভিনিউ রিভিউ চার্ট (Revenue Overview)"
                                                        : "Revenue Overview"}
                                                </h2>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                {isBangla
                                                    ? `${revenueAnalytics.rangeOrders}টি অর্ডার • মোট ${formatPrice(
                                                          revenueAnalytics.rangeTotal
                                                      )} • ডেলিভারড ${formatPrice(
                                                          revenueAnalytics.rangeDelivered
                                                      )}`
                                                    : `${revenueAnalytics.rangeOrders} orders • Total ${formatPrice(
                                                          revenueAnalytics.rangeTotal
                                                      )} • Delivered ${formatPrice(
                                                          revenueAnalytics.rangeDelivered
                                                      )}`}
                                            </p>
                                        </div>

                                        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#0b1015] p-0.5">
                                            {[
                                                {
                                                    key: "7d",
                                                    en: "7 Days",
                                                    bn: "৭ দিন",
                                                },
                                                {
                                                    key: "14d",
                                                    en: "14 Days",
                                                    bn: "১৪ দিন",
                                                },
                                                {
                                                    key: "6m",
                                                    en: "6 Months",
                                                    bn: "৬ মাস",
                                                },
                                            ].map((tab) => (
                                                <button
                                                    key={tab.key}
                                                    type="button"
                                                    onClick={() => {
                                                        setRevenueRange(
                                                            tab.key
                                                        );
                                                        setHoveredChartIdx(
                                                            null
                                                        );
                                                    }}
                                                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                                        revenueRange === tab.key
                                                            ? "bg-emerald-500 text-slate-950"
                                                            : "text-slate-400 hover:text-white"
                                                    }`}
                                                >
                                                    {isBangla
                                                        ? tab.bn
                                                        : tab.en}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary Metrics Strip */}
                                    <div className="mb-4 grid grid-cols-3 gap-2.5">
                                        <div className="rounded-xl border border-white/6 bg-[#0b1015] px-3 py-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                {isBangla
                                                    ? "গড় অর্ডার (AOV)"
                                                    : "Avg. Order"}
                                            </p>
                                            <p className="mt-0.5 text-sm font-extrabold text-white">
                                                {formatPrice(
                                                    revenueAnalytics.avgOrderValue
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-white/6 bg-[#0b1015] px-3 py-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                {isBangla
                                                    ? "ডেলিভারড আয়"
                                                    : "Delivered"}
                                            </p>
                                            <p className="mt-0.5 text-sm font-extrabold text-emerald-400">
                                                {formatPrice(
                                                    revenueAnalytics.rangeDelivered
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-white/6 bg-[#0b1015] px-3 py-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                {isBangla
                                                    ? "সর্বোচ্চ সেল"
                                                    : "Peak Period"}
                                            </p>
                                            <p className="mt-0.5 truncate text-sm font-extrabold text-amber-400">
                                                {formatPrice(
                                                    revenueAnalytics.peakBucket
                                                        ?.total || 0
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Responsive Interactive SVG Chart */}
                                    {(() => {
                                        const buckets =
                                            revenueAnalytics.buckets;
                                        const chartW = 640;
                                        const chartH = 210;
                                        const padL = 54;
                                        const padR = 18;
                                        const padT = 18;
                                        const padB = 34;
                                        const plotW = chartW - padL - padR;
                                        const plotH = chartH - padT - padB;
                                        const maxVal =
                                            revenueAnalytics.chartMax;
                                        const count = buckets.length || 1;
                                        const colW = plotW / count;

                                        const pts = buckets.map((b, idx) => {
                                            const x =
                                                padL + colW * idx + colW / 2;
                                            const y =
                                                padT +
                                                plotH -
                                                (b.total / maxVal) * plotH;
                                            const yDel =
                                                padT +
                                                plotH -
                                                (b.delivered / maxVal) * plotH;
                                            return { ...b, x, y, yDel };
                                        });

                                        const linePath = pts
                                            .map(
                                                (p, i) =>
                                                    `${i === 0 ? "M" : "L"} ${p.x.toFixed(
                                                        1
                                                    )} ${p.y.toFixed(1)}`
                                            )
                                            .join(" ");

                                        const areaPath =
                                            pts.length > 0
                                                ? `${linePath} L ${pts[
                                                      pts.length - 1
                                                  ].x.toFixed(1)} ${(
                                                      padT + plotH
                                                  ).toFixed(1)} L ${pts[0].x.toFixed(
                                                      1
                                                  )} ${(padT + plotH).toFixed(
                                                      1
                                                  )} Z`
                                                : "";

                                        const activePt =
                                            hoveredChartIdx !== null
                                                ? pts[hoveredChartIdx]
                                                : null;

                                        return (
                                            <div className="relative select-none">
                                                {/* Hover Tooltip */}
                                                {activePt && (
                                                    <div className="pointer-events-none absolute right-2 top-0 z-10 rounded-xl border border-emerald-500/35 bg-[#0b1015]/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur-sm">
                                                        <p className="font-bold text-white">
                                                            {activePt.fullLabel}
                                                        </p>
                                                        <p className="mt-0.5 text-slate-300">
                                                            {isBangla
                                                                ? "মোট অর্ডার:"
                                                                : "Total Orders:"}{" "}
                                                            <span className="font-bold text-white">
                                                                {formatPrice(
                                                                    activePt.total
                                                                )}
                                                            </span>{" "}
                                                            ({activePt.count})
                                                        </p>
                                                        <p className="text-emerald-400">
                                                            {isBangla
                                                                ? "ডেলিভারড:"
                                                                : "Delivered:"}{" "}
                                                            <span className="font-bold">
                                                                {formatPrice(
                                                                    activePt.delivered
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                                <svg
                                                    viewBox={`0 0 ${chartW} ${chartH}`}
                                                    className="h-52 w-full overflow-visible"
                                                    onMouseLeave={() =>
                                                        setHoveredChartIdx(null)
                                                    }
                                                >
                                                    <defs>
                                                        <linearGradient
                                                            id="revAreaGrad"
                                                            x1="0"
                                                            y1="0"
                                                            x2="0"
                                                            y2="1"
                                                        >
                                                            <stop
                                                                offset="0%"
                                                                stopColor="#10b981"
                                                                stopOpacity="0.28"
                                                            />
                                                            <stop
                                                                offset="100%"
                                                                stopColor="#10b981"
                                                                stopOpacity="0.01"
                                                            />
                                                        </linearGradient>
                                                    </defs>

                                                    {/* Horizontal Gridlines & Y Ticks */}
                                                    {[0, 0.25, 0.5, 0.75, 1].map(
                                                        (ratio) => {
                                                            const yPos =
                                                                padT +
                                                                plotH -
                                                                ratio * plotH;
                                                            const tickVal =
                                                                Math.round(
                                                                    maxVal *
                                                                        ratio
                                                                );
                                                            return (
                                                                <g key={ratio}>
                                                                    <line
                                                                        x1={
                                                                            padL
                                                                        }
                                                                        x2={
                                                                            chartW -
                                                                            padR
                                                                        }
                                                                        y1={
                                                                            yPos
                                                                        }
                                                                        y2={
                                                                            yPos
                                                                        }
                                                                        stroke="rgba(255,255,255,0.07)"
                                                                        strokeDasharray={
                                                                            ratio ===
                                                                            0
                                                                                ? undefined
                                                                                : "4 4"
                                                                        }
                                                                    />
                                                                    <text
                                                                        x={
                                                                            padL -
                                                                            8
                                                                        }
                                                                        y={
                                                                            yPos +
                                                                            3.5
                                                                        }
                                                                        textAnchor="end"
                                                                        className="fill-slate-500 text-[10px]"
                                                                    >
                                                                        {tickVal >=
                                                                        1000
                                                                            ? `৳${(
                                                                                  tickVal /
                                                                                  1000
                                                                              ).toFixed(
                                                                                  tickVal %
                                                                                      1000 ===
                                                                                  0
                                                                                      ? 0
                                                                                      : 1
                                                                              )}k`
                                                                            : `৳${tickVal}`}
                                                                    </text>
                                                                </g>
                                                            );
                                                        }
                                                    )}

                                                    {/* Area Fill */}
                                                    {areaPath && (
                                                        <path
                                                            d={areaPath}
                                                            fill="url(#revAreaGrad)"
                                                        />
                                                    )}

                                                    {/* Bars (Total vs Delivered) */}
                                                    {pts.map((p, idx) => {
                                                        const barW = Math.min(
                                                            20,
                                                            Math.max(
                                                                8,
                                                                colW * 0.42
                                                            )
                                                        );
                                                        const barH = Math.max(
                                                            0,
                                                            padT + plotH - p.y
                                                        );
                                                        const delH = Math.max(
                                                            0,
                                                            padT +
                                                                plotH -
                                                                p.yDel
                                                        );
                                                        const isHovered =
                                                            hoveredChartIdx ===
                                                            idx;
                                                        const showLabel =
                                                            revenueRange !==
                                                                "14d" ||
                                                            idx % 2 === 0 ||
                                                            idx ===
                                                                pts.length - 1;

                                                        return (
                                                            <g
                                                                key={p.key}
                                                                className="cursor-pointer"
                                                                onMouseEnter={() =>
                                                                    setHoveredChartIdx(
                                                                        idx
                                                                    )
                                                                }
                                                            >
                                                                {/* Hover Hit Area */}
                                                                <rect
                                                                    x={
                                                                        p.x -
                                                                        colW / 2
                                                                    }
                                                                    y={padT}
                                                                    width={colW}
                                                                    height={
                                                                        plotH
                                                                    }
                                                                    fill={
                                                                        isHovered
                                                                            ? "rgba(255,255,255,0.03)"
                                                                            : "transparent"
                                                                    }
                                                                    rx="6"
                                                                />
                                                                {/* Total Order Bar */}
                                                                {barH > 0 && (
                                                                    <rect
                                                                        x={
                                                                            p.x -
                                                                            barW /
                                                                                2
                                                                        }
                                                                        y={p.y}
                                                                        width={
                                                                            barW
                                                                        }
                                                                        height={
                                                                            barH
                                                                        }
                                                                        rx="4"
                                                                        fill={
                                                                            isHovered
                                                                                ? "rgba(56,189,248,0.45)"
                                                                                : "rgba(56,189,248,0.22)"
                                                                        }
                                                                    />
                                                                )}
                                                                {/* Delivered Revenue Bar */}
                                                                {delH > 0 && (
                                                                    <rect
                                                                        x={
                                                                            p.x -
                                                                            barW /
                                                                                2
                                                                        }
                                                                        y={
                                                                            p.yDel
                                                                        }
                                                                        width={
                                                                            barW
                                                                        }
                                                                        height={
                                                                            delH
                                                                        }
                                                                        rx="4"
                                                                        fill={
                                                                            isHovered
                                                                                ? "#34d399"
                                                                                : "#10b981"
                                                                        }
                                                                    />
                                                                )}
                                                                {/* X-axis Label */}
                                                                {showLabel && (
                                                                    <text
                                                                        x={p.x}
                                                                        y={
                                                                            chartH -
                                                                            10
                                                                        }
                                                                        textAnchor="middle"
                                                                        className={`text-[10px] ${
                                                                            isHovered
                                                                                ? "fill-emerald-400 font-bold"
                                                                                : "fill-slate-400"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            p.label
                                                                        }
                                                                    </text>
                                                                )}
                                                            </g>
                                                        );
                                                    })}

                                                    {/* Smooth Trend Line */}
                                                    {linePath && (
                                                        <path
                                                            d={linePath}
                                                            fill="none"
                                                            stroke="#10b981"
                                                            strokeWidth="2.2"
                                                            strokeLinejoin="round"
                                                            strokeLinecap="round"
                                                        />
                                                    )}

                                                    {/* Data Points */}
                                                    {pts.map((p, idx) => {
                                                        const isHovered =
                                                            hoveredChartIdx ===
                                                            idx;
                                                        return (
                                                            <circle
                                                                key={`dot-${p.key}`}
                                                                cx={p.x}
                                                                cy={p.y}
                                                                r={
                                                                    isHovered
                                                                        ? 5
                                                                        : 3
                                                                }
                                                                fill={
                                                                    isHovered
                                                                        ? "#34d399"
                                                                        : "#080c0f"
                                                                }
                                                                stroke="#10b981"
                                                                strokeWidth="2"
                                                                className="pointer-events-none"
                                                            />
                                                        );
                                                    })}
                                                </svg>

                                                {/* Legend */}
                                                <div className="mt-2 flex flex-wrap items-center justify-end gap-4 text-[11px] text-slate-400">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/60" />
                                                        {isBangla
                                                            ? "মোট অর্ডার"
                                                            : "Total Orders"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                                        {isBangla
                                                            ? "ডেলিভারড আয়"
                                                            : "Delivered Revenue"}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </section>

                                {/* Order Status & Revenue Breakdown Donut */}
                                <section className="flex flex-col justify-between rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
                                    <div>
                                        <h2 className="text-sm font-bold text-white">
                                            {isBangla
                                                ? "অর্ডার ও আয়ের ব্রেকডাউন"
                                                : "Order & Revenue Breakdown"}
                                        </h2>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            {isBangla
                                                ? "স্ট্যাটাস অনুযায়ী মোট অর্ডার ও আয়ের অনুপাত"
                                                : "Order distribution & value by status"}
                                        </p>
                                    </div>

                                    {/* Donut Ring */}
                                    {(() => {
                                        const r = 46;
                                        const c = 2 * Math.PI * r;
                                        const total =
                                            statusAnalytics.totalOrdersCount ||
                                            1;
                                        let accOffset = 0;

                                        return (
                                            <div className="my-4 flex items-center justify-center">
                                                <div className="relative flex h-34 w-34 items-center justify-center">
                                                    <svg
                                                        viewBox="0 0 120 120"
                                                        className="-rotate-90 h-full w-full"
                                                    >
                                                        <circle
                                                            cx="60"
                                                            cy="60"
                                                            r={r}
                                                            fill="none"
                                                            stroke="rgba(255,255,255,0.06)"
                                                            strokeWidth="12"
                                                        />
                                                        {statusAnalytics.totalOrdersCount >
                                                            0 &&
                                                            statusAnalytics.rows.map(
                                                                (row) => {
                                                                    const segLen =
                                                                        (row.count /
                                                                            total) *
                                                                        c;
                                                                    const dashOffset =
                                                                        -accOffset;
                                                                    accOffset +=
                                                                        segLen;
                                                                    if (
                                                                        row.count ===
                                                                        0
                                                                    ) {
                                                                        return null;
                                                                    }
                                                                    return (
                                                                        <circle
                                                                            key={
                                                                                row.key
                                                                            }
                                                                            cx="60"
                                                                            cy="60"
                                                                            r={
                                                                                r
                                                                            }
                                                                            fill="none"
                                                                            stroke={
                                                                                row.color
                                                                            }
                                                                            strokeWidth="12"
                                                                            strokeDasharray={`${segLen} ${c}`}
                                                                            strokeDashoffset={
                                                                                dashOffset
                                                                            }
                                                                        />
                                                                    );
                                                                }
                                                            )}
                                                    </svg>
                                                    <div className="absolute text-center">
                                                        <p className="text-xl font-extrabold text-white">
                                                            {
                                                                statusAnalytics.deliveryRate
                                                            }
                                                            %
                                                        </p>
                                                        <p className="text-[10px] font-medium text-slate-400">
                                                            {isBangla
                                                                ? "ডেলিভারি রেট"
                                                                : "Delivered"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Status Progress Rows */}
                                    <div className="space-y-2.5">
                                        {statusAnalytics.rows.map((row) => (
                                            <div key={row.key}>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-2 font-semibold text-slate-200">
                                                        <span
                                                            className={`h-2 w-2 rounded-full ${row.barClass}`}
                                                        />
                                                        {isBangla
                                                            ? row.bn
                                                            : row.en}{" "}
                                                        <span className="text-[11px] font-normal text-slate-400">
                                                            ({row.count})
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={`font-bold ${row.textClass}`}
                                                    >
                                                        {formatPrice(
                                                            row.amount
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                                                    <div
                                                        className={`h-full rounded-full ${row.barClass}`}
                                                        style={{
                                                            width: `${row.pct}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Recent Orders & Low Stock Grid */}
                            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                                {/* Recent Orders Quick Table */}
                                <section className="rounded-2xl border border-white/8 bg-[#10171e] p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-sm font-bold text-white">
                                                {isBangla
                                                    ? "সাম্প্রতিক অর্ডারসমূহ (দ্রুত স্ট্যাটাস পরিবর্তন)"
                                                    : "Recent Orders — Quick Action"}
                                            </h2>
                                            <p className="text-[11px] text-slate-400">
                                                {isBangla
                                                    ? "সর্বশেষ অর্ডারগুলোর স্ট্যাটাস এখান থেকেই পরিবর্তন করুন"
                                                    : "Update the latest incoming orders directly"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveSection("orders")
                                            }
                                            className="cursor-pointer text-xs font-semibold text-emerald-400 hover:underline"
                                        >
                                            {isBangla
                                                ? "সব অর্ডার দেখুন →"
                                                : "View All →"}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {orders.slice(0, 5).map((order) => {
                                            const currentStatus =
                                                order.orderStatus || "pending";
                                            const currentOpt =
                                                ORDER_STATUS_OPTIONS.find(
                                                    (opt) =>
                                                        opt.value ===
                                                        currentStatus
                                                ) || ORDER_STATUS_OPTIONS[0];
                                            const CurrentIcon = currentOpt.icon;
                                            const otherOptions =
                                                ORDER_STATUS_OPTIONS.filter(
                                                    (opt) =>
                                                        opt.value !==
                                                        currentStatus
                                                );
                                            const isDropdownOpen =
                                                openStatusDropdownId ===
                                                order._id;
                                            const isUpdating =
                                                updatingOrderId === order._id;

                                            return (
                                                <div
                                                    key={order._id}
                                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/6 bg-[#0b1015] p-3.5"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-white">
                                                                {order.tran_id}
                                                            </span>
                                                            <span className="text-xs font-bold text-emerald-400">
                                                                {formatPrice(
                                                                    order.totalAmount
                                                                )}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            {
                                                                order
                                                                    .deliveryDetails
                                                                    ?.name
                                                            }{" "}
                                                            •{" "}
                                                            {
                                                                order
                                                                    .deliveryDetails
                                                                    ?.phone
                                                            }{" "}
                                                            •{" "}
                                                            {
                                                                order
                                                                    .deliveryDetails
                                                                    ?.district
                                                            }
                                                        </p>
                                                    </div>

                                                    <div
                                                        className="relative"
                                                        data-status-dropdown
                                                    >
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating}
                                                            onClick={() =>
                                                                setOpenStatusDropdownId(
                                                                    isDropdownOpen
                                                                        ? null
                                                                        : order._id
                                                                )
                                                            }
                                                            className={`inline-flex min-w-[132px] cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${currentOpt.badgeClass} hover:brightness-110 disabled:opacity-60`}
                                                        >
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <CurrentIcon
                                                                    size={13}
                                                                />
                                                                <span>
                                                                    {isBangla
                                                                        ? currentOpt.bn
                                                                        : currentOpt.en}
                                                                </span>
                                                            </span>
                                                            <ChevronDown
                                                                size={14}
                                                                className={`transition-transform ${
                                                                    isDropdownOpen
                                                                        ? "rotate-180"
                                                                        : ""
                                                                }`}
                                                            />
                                                        </button>

                                                        {isDropdownOpen && (
                                                            <div className="absolute right-0 z-30 mt-1.5 w-40 overflow-hidden rounded-xl border border-white/12 bg-[#121a24] p-1 shadow-2xl">
                                                                {otherOptions.map(
                                                                    (opt) => {
                                                                        const OptIcon =
                                                                            opt.icon;
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    opt.value
                                                                                }
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setOpenStatusDropdownId(
                                                                                        null
                                                                                    );
                                                                                    handleOrderStatusChange(
                                                                                        order._id,
                                                                                        {
                                                                                            orderStatus:
                                                                                                opt.value,
                                                                                        }
                                                                                    );
                                                                                }}
                                                                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-white/8 hover:text-white"
                                                                            >
                                                                                <OptIcon
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                    className={
                                                                                        opt.value ===
                                                                                        "processing"
                                                                                            ? "text-sky-400"
                                                                                            : opt.value ===
                                                                                              "delivered"
                                                                                            ? "text-emerald-400"
                                                                                            : opt.value ===
                                                                                              "cancelled"
                                                                                            ? "text-rose-400"
                                                                                            : "text-amber-400"
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    {isBangla
                                                                                        ? opt.bn
                                                                                        : opt.en}
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Low Stock Alert */}
                                <section className="rounded-2xl border border-white/8 bg-[#10171e] p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle
                                                size={16}
                                                className="text-amber-400"
                                            />
                                            <h2 className="text-sm font-bold text-white">
                                                {isBangla
                                                    ? "স্টক অ্যালার্ট (কম স্টক)"
                                                    : "Low Stock Watchlist"}
                                            </h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveSection("products")
                                            }
                                            className="cursor-pointer text-xs font-semibold text-emerald-400 hover:underline"
                                        >
                                            {isBangla
                                                ? "পণ্য ম্যানেজ →"
                                                : "Manage →"}
                                        </button>
                                    </div>

                                    {lowStockProducts.length === 0 ? (
                                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-xs text-emerald-300">
                                            {isBangla
                                                ? "সব পণ্যের পর্যাপ্ত স্টক রয়েছে!"
                                                : "All products are well-stocked!"}
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {lowStockProducts
                                                .slice(0, 6)
                                                .map((prod) => (
                                                    <div
                                                        key={prod._id}
                                                        className="flex items-center justify-between rounded-xl border border-white/6 bg-[#0b1015] p-3"
                                                    >
                                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                                            {prod
                                                                .images?.[0] && (
                                                                <Image
                                                                    src={
                                                                        prod
                                                                            .images[0]
                                                                    }
                                                                    alt=""
                                                                    width={36}
                                                                    height={36}
                                                                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <p className="truncate text-xs font-semibold text-white">
                                                                {localized(
                                                                    prod.name,
                                                                    language
                                                                )}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                                                            Stock: {prod.stock}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    )}

                    {/* =========================================================
                        2. ORDERS MANAGEMENT
                    ========================================================= */}
                    {activeSection === "orders" && (
                        <div className="space-y-5">
                            {/* Filter Tabs & Search */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#10171e] p-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    {[
                                        {
                                            key: "all",
                                            en: "All Orders",
                                            bn: "সব অর্ডার",
                                        },
                                        {
                                            key: "pending",
                                            en: "Pending",
                                            bn: "পেন্ডিং",
                                        },
                                        {
                                            key: "processing",
                                            en: "Processing",
                                            bn: "প্রসেসিং",
                                        },
                                        {
                                            key: "delivered",
                                            en: "Delivered",
                                            bn: "ডেলিভারড",
                                        },
                                        {
                                            key: "cancelled",
                                            en: "Cancelled",
                                            bn: "বাতিল",
                                        },
                                    ].map((tab) => {
                                        const active = orderFilter === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() =>
                                                    setOrderFilter(tab.key)
                                                }
                                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                                    active
                                                        ? "bg-emerald-500 text-slate-950 font-bold"
                                                        : "bg-[#0b1015] text-slate-400 hover:bg-white/8 hover:text-white"
                                                }`}
                                            >
                                                <span>
                                                    {isBangla ? tab.bn : tab.en}
                                                </span>
                                                <span
                                                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                                        active
                                                            ? "bg-slate-950/20 text-slate-950"
                                                            : "bg-white/10 text-slate-300"
                                                    }`}
                                                >
                                                    {orderCounts[tab.key] || 0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="relative flex items-center sm:w-80">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-3.5 text-slate-500"
                                    />
                                    <input
                                        type="text"
                                        value={orderSearch}
                                        onChange={(e) =>
                                            setOrderSearch(e.target.value)
                                        }
                                        placeholder={
                                            isBangla
                                                ? "অর্ডার আইডি, নাম বা ফোন খুঁজুন..."
                                                : "Search Order ID, name, or phone..."
                                        }
                                        className={`${darkInput} pl-9`}
                                    />
                                </div>
                            </div>

                            {filteredOrders.length === 0 ? (
                                <div className="rounded-2xl border border-white/8 bg-[#10171e] p-12 text-center text-sm text-slate-400">
                                    {isBangla
                                        ? "কোনো অর্ডার পাওয়া যায়নি।"
                                        : "No matching orders found."}
                                </div>
                            ) : (
                                filteredOrders.map((order) => {
                                    const currentStatusObj =
                                        ORDER_STATUS_OPTIONS.find(
                                            (s) => s.value === order.orderStatus
                                        ) || ORDER_STATUS_OPTIONS[0];
                                    const isUpdating =
                                        updatingOrderId === order._id;

                                    return (
                                        <article
                                            key={order._id}
                                            className="overflow-hidden rounded-2xl border border-white/8 bg-[#10171e] shadow-xl"
                                        >
                                            {/* Header */}
                                            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#0c1218] px-5 py-3.5">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                            Order ID
                                                        </span>
                                                        <p className="font-mono text-sm font-bold text-white">
                                                            {order.tran_id}
                                                        </p>
                                                    </div>

                                                    <span className="hidden h-6 w-px bg-white/10 sm:block" />

                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Calendar size={14} />
                                                        <span>
                                                            {new Date(
                                                                order.createdAt
                                                            ).toLocaleString(
                                                                isBangla
                                                                    ? "bn-BD"
                                                                    : "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    {/* Payment Status Selector */}
                                                    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0b1015] px-2.5 py-1 text-xs">
                                                        <CreditCard
                                                            size={13}
                                                            className="text-emerald-400"
                                                        />
                                                        <span className="uppercase text-slate-400">
                                                            {order.paymentMethod ||
                                                                "COD"}
                                                            :
                                                        </span>
                                                        <select
                                                            value={
                                                                order.paymentStatus ||
                                                                "pending"
                                                            }
                                                            onChange={(e) =>
                                                                handleOrderStatusChange(
                                                                    order._id,
                                                                    {
                                                                        paymentStatus:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            className="bg-transparent font-semibold text-white outline-none"
                                                        >
                                                            {PAYMENT_STATUS_OPTIONS.map(
                                                                (p) => (
                                                                    <option
                                                                        key={
                                                                            p.value
                                                                        }
                                                                        value={
                                                                            p.value
                                                                        }
                                                                        className="bg-[#10171e] text-white"
                                                                    >
                                                                        {isBangla
                                                                            ? p.bn
                                                                            : p.en}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${currentStatusObj.badgeClass}`}
                                                    >
                                                        <currentStatusObj.icon
                                                            size={13}
                                                        />
                                                        {isBangla
                                                            ? currentStatusObj.bn
                                                            : currentStatusObj.en}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteOrder(
                                                                order._id
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500 hover:text-white"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </header>

                                            {/* Body */}
                                            <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_1fr]">
                                                {/* Ordered Items */}
                                                <div className="space-y-2.5">
                                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                        {isBangla
                                                            ? `অর্ডারকৃত পণ্য (${
                                                                  order
                                                                      .orderItems
                                                                      ?.length ||
                                                                  0
                                                              })`
                                                            : `Ordered Items (${
                                                                  order
                                                                      .orderItems
                                                                      ?.length ||
                                                                  0
                                                              })`}
                                                    </h3>
                                                    <div className="divide-y divide-white/6 rounded-xl border border-white/8 bg-[#0b1015]">
                                                        {order.orderItems?.map(
                                                            (item, idx) => {
                                                                const popProd =
                                                                    typeof item.product_id ===
                                                                    "object"
                                                                        ? item.product_id
                                                                        : null;
                                                                const thumb =
                                                                    popProd
                                                                        ?.images?.[0];
                                                                const itemName =
                                                                    localized(
                                                                        popProd?.name,
                                                                        language
                                                                    ) ||
                                                                    item.name;
                                                                const itemUnit =
                                                                    localized(
                                                                        popProd?.unit,
                                                                        language
                                                                    ) ||
                                                                    item.unit;
                                                                const qty =
                                                                    Number(
                                                                        item.cartQuantity
                                                                    ) || 1;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            item._id ||
                                                                            idx
                                                                        }
                                                                        className="flex items-center justify-between gap-3 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                                            {thumb ? (
                                                                                <Image
                                                                                    src={
                                                                                        thumb
                                                                                    }
                                                                                    alt={
                                                                                        itemName
                                                                                    }
                                                                                    width={
                                                                                        44
                                                                                    }
                                                                                    height={
                                                                                        44
                                                                                    }
                                                                                    className="h-11 w-11 shrink-0 rounded-lg border border-white/10 object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                                                                                    <Package
                                                                                        size={
                                                                                            18
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div className="overflow-hidden">
                                                                                <p className="truncate text-xs font-bold text-white sm:text-sm">
                                                                                    {
                                                                                        itemName
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs text-slate-400">
                                                                                    {
                                                                                        itemUnit
                                                                                    }{" "}
                                                                                    •{" "}
                                                                                    {formatPrice(
                                                                                        item.price
                                                                                    )}{" "}
                                                                                    ×{" "}
                                                                                    {
                                                                                        qty
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="shrink-0 text-xs font-bold text-emerald-400 sm:text-sm">
                                                                            {formatPrice(
                                                                                (Number(
                                                                                    item.price
                                                                                ) ||
                                                                                    0) *
                                                                                    qty
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Customer Info + Status Changer */}
                                                <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/8 bg-[#0b1015] p-4">
                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex items-center justify-between border-b border-white/8 pb-2">
                                                            <span className="font-bold uppercase tracking-wider text-slate-400">
                                                                {isBangla
                                                                    ? "ডেলিভারি তথ্য"
                                                                    : "Delivery Info"}
                                                            </span>
                                                            <span className="text-sm font-extrabold text-emerald-400">
                                                                Total:{" "}
                                                                {formatPrice(
                                                                    order.totalAmount
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="flex items-center gap-2 font-semibold text-white">
                                                            <User
                                                                size={14}
                                                                className="text-emerald-400"
                                                            />
                                                            <span>
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.name
                                                                }
                                                            </span>
                                                        </p>
                                                        <p className="flex items-center gap-2 text-slate-300">
                                                            <Phone
                                                                size={14}
                                                                className="text-emerald-400"
                                                            />
                                                            <span>
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.phone
                                                                }
                                                            </span>
                                                        </p>
                                                        <p className="flex items-start gap-2 text-slate-300">
                                                            <MapPin
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-emerald-400"
                                                            />
                                                            <span>
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.address
                                                                }
                                                                ,{" "}
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.thana
                                                                }
                                                                ,{" "}
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.district
                                                                }
                                                            </span>
                                                        </p>
                                                        {order.deliveryDetails
                                                            ?.note && (
                                                            <p className="rounded-lg border border-white/6 bg-white/[0.03] px-2.5 py-1.5 text-[11px] italic text-slate-300">
                                                                Note:{" "}
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        .note
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Status Buttons */}
                                                    <div className="border-t border-white/8 pt-3">
                                                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                                                            {isBangla
                                                                ? "অর্ডার স্ট্যাটাস পরিবর্তন করুন:"
                                                                : "Update Order Status:"}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                            {ORDER_STATUS_OPTIONS.map(
                                                                (opt) => {
                                                                    const Icon =
                                                                        opt.icon;
                                                                    const isCurrent =
                                                                        order.orderStatus ===
                                                                        opt.value;
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                opt.value
                                                                            }
                                                                            type="button"
                                                                            disabled={
                                                                                isCurrent ||
                                                                                isUpdating
                                                                            }
                                                                            onClick={() =>
                                                                                handleOrderStatusChange(
                                                                                    order._id,
                                                                                    {
                                                                                        orderStatus:
                                                                                            opt.value,
                                                                                    }
                                                                                )
                                                                            }
                                                                            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
                                                                                isCurrent
                                                                                    ? opt.activeClass
                                                                                    : "border-white/10 bg-[#121a22] text-slate-300 hover:border-emerald-500/40 hover:text-white"
                                                                            } disabled:cursor-default`}
                                                                        >
                                                                            <Icon
                                                                                size={
                                                                                    13
                                                                                }
                                                                            />
                                                                            <span>
                                                                                {isBangla
                                                                                    ? opt.bn
                                                                                    : opt.en}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* =========================================================
                        3. PRODUCTS MANAGEMENT
                    ========================================================= */}
                    {activeSection === "products" && (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#10171e] p-4">
                                <div className="relative flex items-center sm:w-80">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-3.5 text-slate-500"
                                    />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) =>
                                            setProductSearch(e.target.value)
                                        }
                                        placeholder={
                                            isBangla
                                                ? "পণ্য খুঁজুন..."
                                                : "Search products..."
                                        }
                                        className={`${darkInput} pl-9`}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateProduct}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                                >
                                    <Plus size={16} />
                                    <span>
                                        {isBangla
                                            ? "নতুন পণ্য যোগ করুন"
                                            : "Add New Product"}
                                    </span>
                                </button>
                            </div>

                            {/* Create / Edit Product Form (All Product Schema Fields) */}
                            {showProductModal && (
                                <form
                                    onSubmit={handleSaveProduct}
                                    className="space-y-5 rounded-2xl border border-emerald-500/30 bg-[#10171e] p-6 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between border-b border-white/8 pb-3.5">
                                        <div>
                                            <h3 className="text-base font-bold text-white">
                                                {editingProductId
                                                    ? isBangla
                                                        ? "পণ্য এডিট করুন (সব ফিল্ড)"
                                                        : "Edit Product (Full Schema)"
                                                    : isBangla
                                                    ? "নতুন পণ্য যোগ করুন (সব ফিল্ড)"
                                                    : "Add New Product (Full Schema)"}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {isBangla
                                                    ? "Product মডেলের সকল ফিল্ড নিচে পূরণ করুন (EN ও BN)"
                                                    : "Complete all fields from the Product model (English & Bangla)"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowProductModal(false)
                                            }
                                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* 1. Product Name & Category / Subcategory */}
                                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                            {isBangla
                                                ? "১. মৌলিক তথ্য ও ক্যাটাগরি (Basic Info & Category)"
                                                : "1. Basic Info & Category"}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Product Name (EN) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Natural Thanaka Face Pack"
                                                    value={productForm.nameEn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            nameEn: e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    পণ্যের নাম (BN) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="যেমন: ন্যাচারাল থানাকা ফেস প্যাক"
                                                    value={productForm.nameBn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            nameBn: e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Category (category_id) <span className="text-rose-400">*</span>
                                                </label>
                                                <select
                                                    required
                                                    value={productForm.category}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            category: e.target.value,
                                                            subCategory: "",
                                                        })
                                                    }
                                                    className={darkInput}
                                                >
                                                    <option value="">
                                                        Select Category
                                                    </option>
                                                    {categories.map((cat) => (
                                                        <option
                                                            key={cat._id}
                                                            value={cat._id}
                                                        >
                                                            {localized(
                                                                cat.name,
                                                                language
                                                            )}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Subcategory (subcategory_id) <span className="text-rose-400">*</span>
                                                </label>
                                                <select
                                                    required
                                                    value={productForm.subCategory}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            subCategory:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                >
                                                    <option value="">
                                                        Select Subcategory
                                                    </option>
                                                    {subcategories
                                                        .filter(
                                                            (s) =>
                                                                !productForm.category ||
                                                                String(
                                                                    s.category_id
                                                                        ?._id ||
                                                                        s.category_id
                                                                ) ===
                                                                    String(
                                                                        productForm.category
                                                                    )
                                                        )
                                                        .map((sub) => (
                                                            <option
                                                                key={sub._id}
                                                                value={sub._id}
                                                            >
                                                                {localized(
                                                                    sub.name,
                                                                    language
                                                                )}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Pricing, Stock, Unit, Origin & Featured */}
                                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                            {isBangla
                                                ? "২. মূল্য, স্টক, ইউনিট এবং উৎপত্তিস্থল (Pricing, Inventory, Unit & Origin)"
                                                : "2. Pricing, Inventory, Unit & Origin"}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Price (৳) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    placeholder="e.g. 350"
                                                    value={productForm.price}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            price: e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Discount (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="99"
                                                    placeholder="0"
                                                    value={productForm.discount}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            discount:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Stock Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="20"
                                                    value={productForm.stock}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            stock: e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b1015] px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/40">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            productForm.featured
                                                        }
                                                        onChange={(e) =>
                                                            setProductForm({
                                                                ...productForm,
                                                                featured:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                        className="h-4 w-4 accent-emerald-500"
                                                    />
                                                    <span>
                                                        Featured Product (জনপ্রিয় পণ্য)
                                                    </span>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Unit (EN) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. 100g / 120ml"
                                                    value={productForm.unitEn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            unitEn: e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    পরিমাণ / ইউনিট (BN) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="যেমন: ১০০ গ্রাম / ১২০ মিলি"
                                                    value={productForm.unitBn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            unitBn: e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Origin (EN) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Bandarban, Bangladesh"
                                                    value={productForm.originEn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            originEn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    উৎপত্তিস্থল (BN) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="যেমন: বান্দরবান, বাংলাদেশ"
                                                    value={productForm.originBn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            originBn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={darkInput}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Description (EN & BN) */}
                                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                            {isBangla
                                                ? "৩. পণ্যের বিস্তারিত বিবরণ (Description)"
                                                : "3. Product Description (EN & BN)"}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Description (English) <span className="text-rose-400">*</span>
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    required
                                                    placeholder="Write detailed product description in English..."
                                                    value={productForm.descEn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            descEn: e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    বিবরণ (বাংলা) <span className="text-rose-400">*</span>
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    required
                                                    placeholder="বাংলায় পণ্যের বিস্তারিত বিবরণ লিখুন..."
                                                    value={productForm.descBn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            descBn: e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Benefits, Ingredients & Usage (Array Fields: EN & BN) */}
                                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                                {isBangla
                                                    ? "৪. উপকারিতা, উপাদান এবং ব্যবহারের নিয়ম (Benefits, Ingredients & Usage)"
                                                    : "4. Benefits, Ingredients & Usage"}
                                            </h4>
                                            <span className="text-[11px] text-slate-400">
                                                {isBangla
                                                    ? "টিপস: কমা (,) অথবা নতুন লাইন দিয়ে একাধিক পয়েন্ট আলাদা করুন"
                                                    : "Tip: Separate multiple items with commas (,) or new lines"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Benefits (EN) — `[String]`
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder={"Brightens skin tone\nReduces dark spots\n100% natural cooling effect"}
                                                    value={productForm.benefitsEn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            benefitsEn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    উপকারিতা / Benefits (BN) — `[String]`
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder={"ত্বকের উজ্জ্বলতা বৃদ্ধি করে\nকালো দাগ দূর করে\n১০০% প্রাকৃতিক ও নিরাপদ"}
                                                    value={productForm.benefitsBn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            benefitsBn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    Ingredients (EN) — `[String]`
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Pure Thanaka Bark, Sandalwood, Organic Aloe Vera"
                                                    value={
                                                        productForm.ingredientsEn
                                                    }
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            ingredientsEn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    উপাদান / Ingredients (BN) — `[String]`
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="খাঁটি থানাকা বার্ক, চন্দন, অর্গানিক অ্যালোভেরা"
                                                    value={
                                                        productForm.ingredientsBn
                                                    }
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            ingredientsBn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    How to Use / Usage (EN) <span className="text-rose-400">*</span> — `[String]`
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    required
                                                    placeholder={"Mix with rose water or plain water\nApply gently on clean skin and rinse after 15 mins"}
                                                    value={productForm.usageEn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            usageEn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                    ব্যবহারের নিয়ম / Usage (BN) <span className="text-rose-400">*</span> — `[String]`
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    required
                                                    placeholder={"পরিষ্কার ত্বকে আলতোভাবে লাগান\n১৫ মিনিট পর ঠান্ডা পানি দিয়ে ধুয়ে ফেলুন"}
                                                    value={productForm.usageBn}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            usageBn:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 5. Tags & Multiple Images Gallery */}
                                    <div className="space-y-4 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                            {isBangla
                                                ? "৫. ট্যাগ ও পণ্যের ছবি গ্যালারি (Tags & Product Images)"
                                                : "5. Search Tags & Product Images Gallery"}
                                        </h4>

                                        <div>
                                            <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                                Tags (`[String]` — comma separated)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. thanaka, skincare, organic, face pack, bandarban"
                                                value={productForm.tags}
                                                onChange={(e) =>
                                                    setProductForm({
                                                        ...productForm,
                                                        tags: e.target.value,
                                                    })
                                                }
                                                className={darkInput}
                                            />
                                            {parseListField(productForm.tags)
                                                .length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {parseListField(
                                                        productForm.tags
                                                    ).map((tag, idx) => (
                                                        <span
                                                            key={`${tag}-${idx}`}
                                                            className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-[11px] font-semibold text-slate-300">
                                                Product Images (`images: [String]`) <span className="text-rose-400">*</span>{" "}
                                                <span className="text-slate-400 font-normal">
                                                    ({productForm.images?.length || 0} uploaded — you can select multiple images)
                                                </span>
                                            </label>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">
                                                    <ImagePlus size={16} />
                                                    <span>
                                                        {isBangla
                                                            ? "ডিভাইস থেকে ছবি যোগ করুন (একাধিক)"
                                                            : "Upload Product Images (Multiple)"}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const files = Array.from(
                                                                e.target.files || []
                                                            );
                                                            if (files.length === 0)
                                                                return;
                                                            try {
                                                                const compressedList =
                                                                    await Promise.all(
                                                                        files.map(
                                                                            (f) =>
                                                                                compressImageFile(
                                                                                    f
                                                                                )
                                                                        )
                                                                    );
                                                                setProductForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        images: [
                                                                            ...(prev.images ||
                                                                                []),
                                                                            ...compressedList,
                                                                        ],
                                                                    })
                                                                );
                                                            } catch {
                                                                toast.error(
                                                                    "Failed to load one or more images"
                                                                );
                                                            } finally {
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                    />
                                                </label>

                                                {productForm.images?.map(
                                                    (imgSrc, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group relative h-16 w-16 overflow-hidden rounded-xl border border-white/15 bg-[#0b1015]"
                                                        >
                                                            <Image
                                                                src={imgSrc}
                                                                alt={`Product ${idx + 1}`}
                                                                fill
                                                                sizes="64px"
                                                                className="object-cover"
                                                            />
                                                            {idx === 0 && (
                                                                <span className="absolute bottom-0 inset-x-0 bg-emerald-500/90 py-0.5 text-center text-[9px] font-bold text-slate-950">
                                                                    MAIN
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setProductForm(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            images: prev.images.filter(
                                                                                (
                                                                                    _,
                                                                                    i
                                                                                ) =>
                                                                                    i !==
                                                                                    idx
                                                                            ),
                                                                        })
                                                                    )
                                                                }
                                                                className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white opacity-90 shadow hover:bg-rose-600"
                                                                title="Remove image"
                                                            >
                                                                <X size={11} />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/8 pt-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowProductModal(false)
                                            }
                                            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                                        >
                                            {isBangla ? "বাতিল" : "Cancel"}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingProduct}
                                            className="cursor-pointer rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            {isSubmittingProduct
                                                ? isBangla
                                                    ? "সেভ হচ্ছে..."
                                                    : "Saving..."
                                                : editingProductId
                                                ? isBangla
                                                    ? "পণ্য আপডেট করুন"
                                                    : "Update Product"
                                                : isBangla
                                                ? "পণ্য সেভ করুন"
                                                : "Save Product"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#10171e] p-4 transition hover:border-white/15"
                                    >
                                        <div className="flex items-center gap-3.5 overflow-hidden">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt=""
                                                    width={52}
                                                    height={52}
                                                    className="h-13 w-13 shrink-0 rounded-xl border border-white/10 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                                                    <Box size={20} />
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="truncate text-xs font-bold text-white sm:text-sm">
                                                    {localized(
                                                        product.name,
                                                        language
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                                                    {formatPrice(product.price)}{" "}
                                                    {product.discount > 0 && (
                                                        <span className="text-[10px] text-amber-400">
                                                            (-{product.discount}
                                                            %)
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-400">
                                                    Stock: {product.stock} •{" "}
                                                    {localized(
                                                        product.unit,
                                                        language
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditProduct(product)
                                                }
                                                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400"
                                                title="Edit Product"
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteProduct(
                                                        product._id
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* =========================================================
                        4. CATEGORIES & SUBCATEGORIES
                    ========================================================= */}
                    {activeSection === "categories" && (
                        <div className="space-y-6">
                            {/* Create / Edit Category & Subcategory Forms */}
                            <div className="grid gap-5 lg:grid-cols-2">
                                {/* Add / Edit Category */}
                                <form
                                    onSubmit={handleSaveCategory}
                                    className={`space-y-3.5 rounded-2xl border p-5 transition ${
                                        editingCatId
                                            ? "border-emerald-500/50 bg-[#10171e] shadow-lg shadow-emerald-500/10"
                                            : "border-white/8 bg-[#10171e]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white">
                                            {editingCatId
                                                ? isBangla
                                                    ? "ক্যাটাগরি এডিট করুন"
                                                    : "Edit Category"
                                                : isBangla
                                                ? "নতুন ক্যাটাগরি তৈরি করুন"
                                                : "Create Category"}
                                        </h3>
                                        {editingCatId && (
                                            <button
                                                type="button"
                                                onClick={cancelEditCategory}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                                            >
                                                <X size={12} />
                                                <span>
                                                    {isBangla
                                                        ? "বাতিল"
                                                        : "Cancel"}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <input
                                            type="text"
                                            placeholder="Category Name (EN)"
                                            value={catForm.nameEn}
                                            onChange={(e) =>
                                                setCatForm({
                                                    ...catForm,
                                                    nameEn: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                        <input
                                            type="text"
                                            placeholder="ক্যাটাগরির নাম (BN)"
                                            value={catForm.nameBn}
                                            onChange={(e) =>
                                                setCatForm({
                                                    ...catForm,
                                                    nameBn: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20">
                                                <ImagePlus size={15} />
                                                <span>
                                                    {catForm.image
                                                        ? isBangla
                                                            ? "ছবি পরিবর্তন ✓"
                                                            : "Change Image ✓"
                                                        : isBangla
                                                        ? "ক্যাটাগরি ছবি আপলোড"
                                                        : "Upload Category Image"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        if (!file) return;
                                                        try {
                                                            const dataUrl =
                                                                await compressImageFile(
                                                                    file,
                                                                    350
                                                                );
                                                            setCatForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    image: dataUrl,
                                                                })
                                                            );
                                                        } catch {
                                                            toast.error(
                                                                "Invalid image"
                                                            );
                                                        } finally {
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {catForm.image && (
                                                <div className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-[#0b1015]">
                                                    <Image
                                                        src={catForm.image}
                                                        alt="Category Preview"
                                                        fill
                                                        sizes="44px"
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCatForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    image: "",
                                                                })
                                                            )
                                                        }
                                                        aria-label={
                                                            isBangla
                                                                ? "ছবি সরান"
                                                                : "Remove image"
                                                        }
                                                        title={
                                                            isBangla
                                                                ? "ছবি সরান"
                                                                : "Remove image"
                                                        }
                                                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 focus:opacity-100"
                                                    >
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
                                                            <X
                                                                size={13}
                                                                strokeWidth={2.5}
                                                            />
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingCat}
                                            className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            {isSubmittingCat
                                                ? isBangla
                                                    ? "সেভ হচ্ছে..."
                                                    : "Saving..."
                                                : editingCatId
                                                ? isBangla
                                                    ? "আপডেট করুন"
                                                    : "Update Category"
                                                : isBangla
                                                ? "ক্যাটাগরি যোগ করুন"
                                                : "Add Category"}
                                        </button>
                                    </div>
                                </form>

                                {/* Add / Edit Subcategory */}
                                <form
                                    onSubmit={handleSaveSubCategory}
                                    className={`space-y-3.5 rounded-2xl border p-5 transition ${
                                        editingSubCatId
                                            ? "border-emerald-500/50 bg-[#10171e] shadow-lg shadow-emerald-500/10"
                                            : "border-white/8 bg-[#10171e]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white">
                                            {editingSubCatId
                                                ? isBangla
                                                    ? "সাব-ক্যাটাগরি এডিট করুন"
                                                    : "Edit Subcategory"
                                                : isBangla
                                                ? "নতুন সাব-ক্যাটাগরি তৈরি করুন"
                                                : "Create Subcategory"}
                                        </h3>
                                        {editingSubCatId && (
                                            <button
                                                type="button"
                                                onClick={cancelEditSubCategory}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                                            >
                                                <X size={12} />
                                                <span>
                                                    {isBangla
                                                        ? "বাতিল"
                                                        : "Cancel"}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <select
                                            value={subCatForm.category}
                                            onChange={(e) =>
                                                setSubCatForm({
                                                    ...subCatForm,
                                                    category: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        >
                                            <option value="">
                                                Parent Category
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat._id}
                                                    value={cat._id}
                                                >
                                                    {localized(
                                                        cat.name,
                                                        language
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Subcategory (EN)"
                                            value={subCatForm.nameEn}
                                            onChange={(e) =>
                                                setSubCatForm({
                                                    ...subCatForm,
                                                    nameEn: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                        <input
                                            type="text"
                                            placeholder="সাব-ক্যাটাগরি (BN)"
                                            value={subCatForm.nameBn}
                                            onChange={(e) =>
                                                setSubCatForm({
                                                    ...subCatForm,
                                                    nameBn: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20">
                                                <ImagePlus size={15} />
                                                <span>
                                                    {subCatForm.image
                                                        ? isBangla
                                                            ? "ছবি পরিবর্তন ✓"
                                                            : "Change Image ✓"
                                                        : isBangla
                                                        ? "ছবি (ঐচ্ছিক)"
                                                        : "Image (Optional)"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        if (!file) return;
                                                        try {
                                                            const dataUrl =
                                                                await compressImageFile(
                                                                    file,
                                                                    350
                                                                );
                                                            setSubCatForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    image: dataUrl,
                                                                })
                                                            );
                                                        } catch {
                                                            toast.error(
                                                                "Invalid image"
                                                            );
                                                        } finally {
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {subCatForm.image && (
                                                <div className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-[#0b1015]">
                                                    <Image
                                                        src={subCatForm.image}
                                                        alt="Subcategory Preview"
                                                        fill
                                                        sizes="44px"
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSubCatForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    image: "",
                                                                })
                                                            )
                                                        }
                                                        aria-label={
                                                            isBangla
                                                                ? "ছবি সরান"
                                                                : "Remove image"
                                                        }
                                                        title={
                                                            isBangla
                                                                ? "ছবি সরান"
                                                                : "Remove image"
                                                        }
                                                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 focus:opacity-100"
                                                    >
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
                                                            <X
                                                                size={13}
                                                                strokeWidth={2.5}
                                                            />
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingSubCat}
                                            className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            {isSubmittingSubCat
                                                ? isBangla
                                                    ? "সেভ হচ্ছে..."
                                                    : "Saving..."
                                                : editingSubCatId
                                                ? isBangla
                                                    ? "আপডেট করুন"
                                                    : "Update Subcategory"
                                                : isBangla
                                                ? "সাব-ক্যাটাগরি যোগ করুন"
                                                : "Add Subcategory"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Categories & Subcategories List */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {categories.map((cat) => {
                                    const childSubs = subcategories.filter(
                                        (s) =>
                                            String(
                                                s.category_id?._id ||
                                                    s.category_id
                                            ) === String(cat._id)
                                    );
                                    const isEditingThisCat =
                                        editingCatId === cat._id;
                                    return (
                                        <div
                                            key={cat._id}
                                            className={`rounded-2xl border p-4 transition ${
                                                isEditingThisCat
                                                    ? "border-emerald-500/50 bg-[#10171e]"
                                                    : "border-white/8 bg-[#10171e]"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between border-b border-white/8 pb-3">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {cat.image && (
                                                        <Image
                                                            src={cat.image}
                                                            alt=""
                                                            width={42}
                                                            height={42}
                                                            className="h-10.5 w-10.5 shrink-0 rounded-xl object-cover"
                                                        />
                                                    )}
                                                    <div className="overflow-hidden">
                                                        <p className="truncate text-xs font-bold text-white">
                                                            {localized(
                                                                cat.name,
                                                                language
                                                            )}
                                                        </p>
                                                        <p className="truncate text-[11px] text-slate-400">
                                                            {isBangla
                                                                ? `${childSubs.length}টি সাব-ক্যাটাগরি`
                                                                : `${
                                                                      childSubs.length
                                                                  } subcategor${
                                                                      childSubs.length ===
                                                                      1
                                                                          ? "y"
                                                                          : "ies"
                                                                  }`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditCategory(
                                                                cat
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg p-1.5 text-slate-300 transition hover:bg-emerald-500/15 hover:text-emerald-400"
                                                        title={
                                                            isBangla
                                                                ? "ক্যাটাগরি এডিট করুন"
                                                                : "Edit Category"
                                                        }
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteCategory(
                                                                cat._id
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-500/15"
                                                        title={
                                                            isBangla
                                                                ? "ক্যাটাগরি ডিলিট করুন"
                                                                : "Delete Category"
                                                        }
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {childSubs.length === 0 ? (
                                                    <span className="text-[11px] text-slate-500">
                                                        No subcategories
                                                    </span>
                                                ) : (
                                                    childSubs.map((sub) => {
                                                        const isEditingThisSub =
                                                            editingSubCatId ===
                                                            sub._id;
                                                        return (
                                                            <span
                                                                key={sub._id}
                                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition ${
                                                                    isEditingThisSub
                                                                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                                                                        : "border-white/8 bg-[#0b1015] text-slate-300"
                                                                }`}
                                                            >
                                                                <span>
                                                                    {localized(
                                                                        sub.name,
                                                                        language
                                                                    )}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditSubCategory(
                                                                            sub
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-slate-400 transition hover:text-emerald-400"
                                                                    title={
                                                                        isBangla
                                                                            ? "সাব-ক্যাটাগরি এডিট করুন"
                                                                            : "Edit Subcategory"
                                                                    }
                                                                >
                                                                    <Edit3
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteSubCategory(
                                                                            sub._id
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-slate-500 transition hover:text-rose-400"
                                                                    title={
                                                                        isBangla
                                                                            ? "সাব-ক্যাটাগরি ডিলিট করুন"
                                                                            : "Delete Subcategory"
                                                                    }
                                                                >
                                                                    <X
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </button>
                                                            </span>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* =========================================================
                        5. HERO BANNERS
                    ========================================================= */}
                    {activeSection === "heros" && (
                        <div className="space-y-6">
                            <form
                                onSubmit={handleSaveHero}
                                className={`space-y-4 rounded-2xl border p-5 transition ${
                                    editingHeroId
                                        ? "border-emerald-500/50 bg-[#10171e] shadow-lg shadow-emerald-500/10"
                                        : "border-white/8 bg-[#10171e]"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white">
                                        {editingHeroId
                                            ? isBangla
                                                ? "হিরো ব্যানার এডিট করুন"
                                                : "Edit Hero Banner"
                                            : isBangla
                                            ? "নতুন হোমপেজ হিরো স্লাইড যোগ করুন"
                                            : "Add Homepage Hero Banner"}
                                    </h3>
                                    {editingHeroId && (
                                        <button
                                            type="button"
                                            onClick={cancelEditHero}
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                                        >
                                            <X size={12} />
                                            <span>
                                                {isBangla ? "বাতিল" : "Cancel"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Hero Title (English)"
                                        value={heroForm.titleEn}
                                        onChange={(e) =>
                                            setHeroForm({
                                                ...heroForm,
                                                titleEn: e.target.value,
                                            })
                                        }
                                        className={darkInput}
                                    />
                                    <input
                                        type="text"
                                        placeholder="হিরো টাইটেল (বাংলা)"
                                        value={heroForm.titleBn}
                                        onChange={(e) =>
                                            setHeroForm({
                                                ...heroForm,
                                                titleBn: e.target.value,
                                            })
                                        }
                                        className={darkInput}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Subtitle / Description (English)"
                                        value={heroForm.descEn}
                                        onChange={(e) =>
                                            setHeroForm({
                                                ...heroForm,
                                                descEn: e.target.value,
                                            })
                                        }
                                        className={darkInput}
                                    />
                                    <input
                                        type="text"
                                        placeholder="সাবটাইটেল / বিবরণ (বাংলা)"
                                        value={heroForm.descBn}
                                        onChange={(e) =>
                                            setHeroForm({
                                                ...heroForm,
                                                descBn: e.target.value,
                                            })
                                        }
                                        className={darkInput}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20">
                                            <ImagePlus size={15} />
                                            <span>
                                                {heroForm.imageURL
                                                    ? isBangla
                                                        ? "ব্যানার ছবি পরিবর্তন ✓"
                                                        : "Change Banner Image ✓"
                                                    : isBangla
                                                    ? "ব্যানার ছবি আপলোড"
                                                    : "Upload Banner Image"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        const dataUrl =
                                                            await compressImageFile(
                                                                file,
                                                                700
                                                            );
                                                        setHeroForm((prev) => ({
                                                            ...prev,
                                                            imageURL: dataUrl,
                                                        }));
                                                    } catch {
                                                        toast.error(
                                                            "Invalid image"
                                                        );
                                                    } finally {
                                                        e.target.value = "";
                                                    }
                                                }}
                                            />
                                        </label>
                                        {heroForm.imageURL && (
                                            <div className="group relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-[#0b1015]">
                                                <Image
                                                    src={heroForm.imageURL}
                                                    alt="Banner Preview"
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setHeroForm((prev) => ({
                                                            ...prev,
                                                            imageURL: "",
                                                        }))
                                                    }
                                                    aria-label={
                                                        isBangla
                                                            ? "ছবি সরান"
                                                            : "Remove image"
                                                    }
                                                    title={
                                                        isBangla
                                                            ? "ছবি সরান"
                                                            : "Remove image"
                                                    }
                                                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
                                                        <X
                                                            size={13}
                                                            strokeWidth={2.5}
                                                        />
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingHero}
                                        className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                                    >
                                        {isSubmittingHero
                                            ? isBangla
                                                ? "সেভ হচ্ছে..."
                                                : "Saving..."
                                            : editingHeroId
                                            ? isBangla
                                                ? "ব্যানার আপডেট করুন"
                                                : "Update Hero Banner"
                                            : isBangla
                                            ? "ব্যানার যোগ করুন"
                                            : "Add Hero Banner"}
                                    </button>
                                </div>
                            </form>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {heroes.map((hero) => {
                                    const isEditingThisHero =
                                        editingHeroId === hero._id;
                                    return (
                                        <div
                                            key={hero._id}
                                            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                                                isEditingThisHero
                                                    ? "border-emerald-500/50 bg-[#10171e]"
                                                    : "border-white/8 bg-[#10171e]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 overflow-hidden">
                                                {hero.imageURL && (
                                                    <Image
                                                        src={hero.imageURL}
                                                        alt=""
                                                        width={64}
                                                        height={64}
                                                        className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
                                                    />
                                                )}
                                                <div className="overflow-hidden">
                                                    <p className="truncate text-sm font-bold text-white">
                                                        {localized(
                                                            hero.title,
                                                            language
                                                        )}
                                                    </p>
                                                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                                                        {localized(
                                                            hero.description,
                                                            language
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditHero(hero)
                                                    }
                                                    className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
                                                    title={
                                                        isBangla
                                                            ? "ব্যানার এডিট করুন"
                                                            : "Edit Hero Banner"
                                                    }
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteHero(
                                                            hero._id
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500 hover:text-white"
                                                    title={
                                                        isBangla
                                                            ? "ব্যানার ডিলিট করুন"
                                                            : "Delete Hero Banner"
                                                    }
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* =========================================================
                        6. CUSTOMERS & ROLES
                    ========================================================= */}
                    {activeSection === "users" && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#10171e] p-4">
                                <div className="relative flex items-center sm:w-80">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-3.5 text-slate-500"
                                    />
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) =>
                                            setUserSearch(e.target.value)
                                        }
                                        placeholder={
                                            isBangla
                                                ? "নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                                                : "Search users by name, email, phone..."
                                        }
                                        className={`${darkInput} pl-9`}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-slate-400">
                                    Total: {filteredUsers.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                                {filteredUsers.map((u) => (
                                    <div
                                        key={u._id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#10171e] p-4"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {u.image ? (
                                                <Image
                                                    src={u.image}
                                                    alt={u.username}
                                                    width={46}
                                                    height={46}
                                                    className="h-11.5 w-11.5 shrink-0 rounded-full border border-white/10 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                                    <UserRound size={20} />
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="truncate text-sm font-bold text-white">
                                                    {u.username}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {u.email}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {u.phone || "No phone"} •{" "}
                                                    {u.address || "No address"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <select
                                                value={u.role || "user"}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        u._id,
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-xl border border-white/10 bg-[#0b1015] px-2.5 py-1.5 text-xs font-bold capitalize text-emerald-400 outline-none"
                                            >
                                                <option value="user">
                                                    User
                                                </option>
                                                <option value="admin">
                                                    Admin
                                                </option>
                                            </select>

                                            {u._id !== user?._id && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteUser(u._id)
                                                    }
                                                    className="cursor-pointer rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* =========================================================
                        7. ADMIN PROFILE & SETTINGS
                    ========================================================= */}
                    {activeSection === "profile" && (
                        <div className="mx-auto max-w-2xl rounded-2xl border border-white/8 bg-[#10171e] p-6 shadow-xl sm:p-8">
                            <div className="flex flex-col items-center gap-4 border-b border-white/8 pb-6 sm:flex-row">
                                <div className="relative">
                                    {profileForm.image ? (
                                        <Image
                                            src={profileForm.image}
                                            alt={user?.username}
                                            width={84}
                                            height={84}
                                            className="h-21 w-21 rounded-full border-2 border-emerald-500 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-21 w-21 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                            <UserRound size={36} />
                                        </div>
                                    )}
                                    <label
                                        title="Change Avatar"
                                        className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md hover:bg-emerald-400"
                                    >
                                        <Camera size={14} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    const dataUrl =
                                                        await compressImageFile(
                                                            file,
                                                            300
                                                        );
                                                    setProfileForm((prev) => ({
                                                        ...prev,
                                                        image: dataUrl,
                                                    }));
                                                } catch {
                                                    toast.error(
                                                        "Failed to load image"
                                                    );
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h2 className="text-lg font-bold text-white">
                                        {user?.username}
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        {user?.email}
                                    </p>
                                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 text-[11px] font-bold uppercase text-emerald-400">
                                        <ShieldCheck size={12} />
                                        Administrator
                                    </span>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSaveAdminProfile}
                                className="mt-6 space-y-4"
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                                            {isBangla ? "নাম" : "Username"}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.username}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    username: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                                            {isBangla ? "ইমেইল" : "Email"}
                                        </label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                                            {isBangla ? "ফোন নম্বর" : "Phone"}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                                            {isBangla
                                                ? "নতুন পাসওয়ার্ড (ঐচ্ছিক)"
                                                : "New Password (Optional)"}
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={profileForm.password}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    password: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                                            {isBangla ? "ঠিকানা" : "Address"}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.address}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    address: e.target.value,
                                                })
                                            }
                                            className={darkInput}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                                    >
                                        <Save size={15} />
                                        <span>
                                            {isSavingProfile
                                                ? "Saving..."
                                                : isBangla
                                                ? "প্রোফাইল সেভ করুন"
                                                : "Save Profile"}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
