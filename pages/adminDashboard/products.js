"use client";

import AdminDashboardLayout, {
    compressImageFile,
    DARK_INPUT_CLASS,
    formatListField,
    localized,
    parseListField,
    useAdminDashboard,
} from "@/components/admin/AdminDashboardLayout";
import axios from "axios";
import {
    Box,
    ChevronLeft,
    ChevronRight,
    Edit3,
    ImagePlus,
    Plus,
    Search,
    Star,
    Trash2,
    X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

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

function AdminProductsContent() {
    const {
        token,
        language,
        isBangla,
        products,
        setProducts,
        categories,
        subcategories,
        formatPrice,
    } = useAdminDashboard();

    const [productSearch, setProductSearch] = useState("");
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
    const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
    const [dragImageIdx, setDragImageIdx] = useState(null);

    /* ============ Reorder Product Images Helper ============ */
    const moveProductImage = (fromIdx, toIdx) => {
        setProductForm((prev) => {
            const list = [...(prev.images || [])];
            if (
                fromIdx < 0 ||
                toIdx < 0 ||
                fromIdx >= list.length ||
                toIdx >= list.length ||
                fromIdx === toIdx
            ) {
                return prev;
            }
            const [moved] = list.splice(fromIdx, 1);
            list.splice(toIdx, 0, moved);
            return { ...prev, images: list };
        });
    };

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const q = productSearch.trim().toLowerCase();
        return products.filter(
            (p) =>
                (p.name?.en || "").toLowerCase().includes(q) ||
                (p.name?.bn || "").toLowerCase().includes(q)
        );
    }, [products, productSearch]);

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
            toast.error(
                err?.response?.data?.error || "Failed to save product"
            );
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

    return (
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
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={
                            isBangla ? "পণ্য খুঁজুন..." : "Search products..."
                        }
                        className={`${DARK_INPUT_CLASS} pl-9`}
                    />
                </div>

                <button
                    type="button"
                    onClick={openCreateProduct}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                    <Plus size={16} />
                    <span>
                        {isBangla ? "নতুন পণ্য যোগ করুন" : "Add New Product"}
                    </span>
                </button>
            </div>

            {/* ============ Create / Edit Product Form ============ */}
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
                            onClick={() => setShowProductModal(false)}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* ============ 1. Product Name & Category / Subcategory ============ */}
                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            {isBangla
                                ? "১. মৌলিক তথ্য ও ক্যাটাগরি (Basic Info & Category)"
                                : "1. Basic Info & Category"}
                        </h4>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Product Name (EN){" "}
                                    <span className="text-rose-400">*</span>
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
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    পণ্যের নাম (BN){" "}
                                    <span className="text-rose-400">*</span>
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
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Category (category_id){" "}
                                    <span className="text-rose-400">*</span>
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
                                    className={DARK_INPUT_CLASS}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {localized(cat.name, language)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Subcategory (subcategory_id){" "}
                                    <span className="text-rose-400">*</span>
                                </label>
                                <select
                                    required
                                    value={productForm.subCategory}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            subCategory: e.target.value,
                                        })
                                    }
                                    className={DARK_INPUT_CLASS}
                                >
                                    <option value="">Select Subcategory</option>
                                    {subcategories
                                        .filter(
                                            (s) =>
                                                !productForm.category ||
                                                String(
                                                    s.category_id?._id ||
                                                    s.category_id
                                                ) ===
                                                String(productForm.category)
                                        )
                                        .map((sub) => (
                                            <option
                                                key={sub._id}
                                                value={sub._id}
                                            >
                                                {localized(sub.name, language)}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ============ 2. Pricing, Stock, Unit, Origin & Featured ============ */}
                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            {isBangla
                                ? "২. মূল্য, স্টক, ইউনিট এবং উৎপত্তিস্থল (Pricing, Inventory, Unit & Origin)"
                                : "2. Pricing, Inventory, Unit & Origin"}
                        </h4>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Price (৳){" "}
                                    <span className="text-rose-400">*</span>
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
                                    className={DARK_INPUT_CLASS}
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
                                            discount: e.target.value,
                                        })
                                    }
                                    className={DARK_INPUT_CLASS}
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
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b1015] px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/40">
                                    <input
                                        type="checkbox"
                                        checked={productForm.featured}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                featured: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 accent-emerald-500"
                                    />
                                    <span>Featured Product (জনপ্রিয় পণ্য)</span>
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Unit (EN){" "}
                                    <span className="text-rose-400">*</span>
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
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    পরিমাণ / ইউনিট (BN){" "}
                                    <span className="text-rose-400">*</span>
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
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Origin (EN){" "}
                                    <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Bandarban, Bangladesh"
                                    value={productForm.originEn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            originEn: e.target.value,
                                        })
                                    }
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    উৎপত্তিস্থল (BN){" "}
                                    <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="যেমন: বান্দরবান, বাংলাদেশ"
                                    value={productForm.originBn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            originBn: e.target.value,
                                        })
                                    }
                                    className={DARK_INPUT_CLASS}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ 3. Description (EN & BN) ============ */}
                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            {isBangla
                                ? "৩. পণ্যের বিস্তারিত বিবরণ (Description)"
                                : "3. Product Description (EN & BN)"}
                        </h4>
                        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Description (English){" "}
                                    <span className="text-rose-400">*</span>
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
                                    বিবরণ (বাংলা){" "}
                                    <span className="text-rose-400">*</span>
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

                    {/* ============ 4. Benefits, Ingredients & Usage ============ */}
                    <div className="space-y-3 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                {isBangla
                                    ? "৪. উপকারিতা, উপাদান এবং ব্যবহারের নিয়ম"
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
                                    Benefits (EN)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={
                                        "Brightens skin tone\nReduces dark spots\n100% natural cooling effect"
                                    }
                                    value={productForm.benefitsEn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            benefitsEn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    উপকারিতা / Benefits (BN)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={
                                        "ত্বকের উজ্জ্বলতা বৃদ্ধি করে\nকালো দাগ দূর করে\n১০০% প্রাকৃতিক ও নিরাপদ"
                                    }
                                    value={productForm.benefitsBn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            benefitsBn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    Ingredients (EN)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Pure Thanaka Bark, Sandalwood, Organic Aloe Vera"
                                    value={productForm.ingredientsEn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            ingredientsEn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    উপাদান / Ingredients (BN)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="খাঁটি থানাকা বার্ক, চন্দন, অর্গানিক অ্যালোভেরা"
                                    value={productForm.ingredientsBn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            ingredientsBn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    How to Use / Usage (EN){" "}
                                    <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    placeholder={
                                        "Mix with rose water or plain water\nApply gently on clean skin and rinse after 15 mins"
                                    }
                                    value={productForm.usageEn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            usageEn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                    ব্যবহারের নিয়ম / Usage (BN){" "}
                                    <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    placeholder={
                                        "পরিষ্কার ত্বকে আলতোভাবে লাগান\n১৫ মিনিট পর ঠান্ডা পানি দিয়ে ধুয়ে ফেলুন"
                                    }
                                    value={productForm.usageBn}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            usageBn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1015] p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ 5. Tags & Multiple Images Gallery ============ */}
                    <div className="space-y-4 rounded-xl border border-white/8 bg-[#0b1015]/60 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            {isBangla
                                ? "৫. ট্যাগ ও পণ্যের ছবি গ্যালারি (Tags & Product Images)"
                                : "5. Search Tags & Product Images Gallery"}
                        </h4>

                        <div>
                            <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                                Tags (comma separated)
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
                                className={DARK_INPUT_CLASS}
                            />
                            {parseListField(productForm.tags).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {parseListField(productForm.tags).map(
                                        (tag, idx) => (
                                            <span
                                                key={`${tag}-${idx}`}
                                                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300"
                                            >
                                                #{tag}
                                            </span>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <label className="block text-[11px] font-semibold text-slate-300">
                                    Product Images{" "}
                                    <span className="text-rose-400">*</span>{" "}
                                    <span className="font-normal text-slate-400">
                                        ({productForm.images?.length || 0} uploaded)
                                    </span>
                                </label>
                                {(productForm.images?.length || 0) > 1 && (
                                    <span className="text-[11px] text-emerald-400">
                                        {isBangla
                                            ? "টিপস: যেকোনো ছবিকে ১ম (Main) করতে ★ বাটনে ক্লিক করুন অথবা মাউস দিয়ে টেনে (Drag) সাজান"
                                            : "Tip: Click ★ to set as 1st (Main) image, use ←/→ arrows, or drag to reorder"}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <label className="inline-flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">
                                    <ImagePlus size={18} />
                                    <span>
                                        {isBangla
                                            ? "ছবি যোগ করুন"
                                            : "Add Images"}
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
                                            if (files.length === 0) return;
                                            try {
                                                const compressedList =
                                                    await Promise.all(
                                                        files.map((f) =>
                                                            compressImageFile(f)
                                                        )
                                                    );
                                                setProductForm((prev) => ({
                                                    ...prev,
                                                    images: [
                                                        ...(prev.images || []),
                                                        ...compressedList,
                                                    ],
                                                }));
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

                                {productForm.images?.map((imgSrc, idx) => {
                                    const totalImgs =
                                        productForm.images?.length || 0;
                                    return (
                                        <div
                                            key={`${idx}-${imgSrc.slice(-18)}`}
                                            draggable
                                            onDragStart={() =>
                                                setDragImageIdx(idx)
                                            }
                                            onDragOver={(e) =>
                                                e.preventDefault()
                                            }
                                            onDrop={() => {
                                                if (
                                                    dragImageIdx !== null &&
                                                    dragImageIdx !== idx
                                                ) {
                                                    moveProductImage(
                                                        dragImageIdx,
                                                        idx
                                                    );
                                                }
                                                setDragImageIdx(null);
                                            }}
                                            onDragEnd={() =>
                                                setDragImageIdx(null)
                                            }
                                            className={`group relative h-24 w-24 cursor-grab overflow-hidden rounded-xl border bg-[#0b1015] transition active:cursor-grabbing ${idx === 0
                                                    ? "border-emerald-500 ring-2 ring-emerald-500/25"
                                                    : dragImageIdx === idx
                                                        ? "border-emerald-400 opacity-50"
                                                        : "border-white/15 hover:border-white/35"
                                                }`}
                                        >
                                            <Image
                                                src={imgSrc}
                                                alt={`Product ${idx + 1}`}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />

                                            {/* ============ Top Bar: Position Badge & Remove Button ============ */}
                                            <div className="absolute inset-x-1 top-1 z-10 flex items-center justify-between">
                                                <span
                                                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold shadow ${idx === 0
                                                            ? "bg-emerald-500 text-slate-950"
                                                            : "bg-black/75 text-white"
                                                        }`}
                                                >
                                                    {idx === 0
                                                        ? "1st • MAIN"
                                                        : `#${idx + 1}`}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setProductForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                images: prev.images.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        idx
                                                                ),
                                                            })
                                                        )
                                                    }
                                                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white shadow hover:bg-rose-600"
                                                    title={
                                                        isBangla
                                                            ? "ছবি মুছে ফেলুন"
                                                            : "Remove image"
                                                    }
                                                >
                                                    <X size={11} />
                                                </button>
                                            </div>

                                            {/* ============ Bottom Reorder Controls Bar ============ */}
                                            {totalImgs > 1 && (
                                                <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-black/80 px-1 py-1 backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        disabled={idx === 0}
                                                        onClick={() =>
                                                            moveProductImage(
                                                                idx,
                                                                idx - 1
                                                            )
                                                        }
                                                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-white/10 text-white hover:bg-emerald-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
                                                        title={
                                                            isBangla
                                                                ? "বামে নিন"
                                                                : "Move Left"
                                                        }
                                                    >
                                                        <ChevronLeft
                                                            size={12}
                                                        />
                                                    </button>

                                                    {idx > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                moveProductImage(
                                                                    idx,
                                                                    0
                                                                )
                                                            }
                                                            className="inline-flex cursor-pointer items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                                                            title={
                                                                isBangla
                                                                    ? "১ম (Main) ছবি করুন"
                                                                    : "Make 1st (Main) Image"
                                                            }
                                                        >
                                                            <Star
                                                                size={9}
                                                                className="fill-current"
                                                            />
                                                            <span>
                                                                {isBangla
                                                                    ? "১ম"
                                                                    : "Main"}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-emerald-400">
                                                            ★ Cover
                                                        </span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            idx ===
                                                            totalImgs - 1
                                                        }
                                                        onClick={() =>
                                                            moveProductImage(
                                                                idx,
                                                                idx + 1
                                                            )
                                                        }
                                                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-white/10 text-white hover:bg-emerald-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
                                                        title={
                                                            isBangla
                                                                ? "ডানে নিন"
                                                                : "Move Right"
                                                        }
                                                    >
                                                        <ChevronRight
                                                            size={12}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/8 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowProductModal(false)}
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

            {/* ============ Products Grid ============ */}
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
                                    {localized(product.name, language)}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                                    {formatPrice(product.price)}{" "}
                                    {product.discount > 0 && (
                                        <span className="text-[10px] text-amber-400">
                                            (-{product.discount}%)
                                        </span>
                                    )}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Stock: {product.stock} •{" "}
                                    {localized(product.unit, language)}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => openEditProduct(product)}
                                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400"
                                title="Edit Product"
                            >
                                <Edit3 size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteProduct(product._id)}
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
    );
}

export default function AdminProductsPage() {
    return (
        <AdminDashboardLayout activeSection="products">
            <AdminProductsContent />
        </AdminDashboardLayout>
    );
}
