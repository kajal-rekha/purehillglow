"use client";

import AdminDashboardLayout, {
    compressImageFile,
    DARK_INPUT_CLASS,
    localized,
    useAdminDashboard,
} from "@/components/admin/AdminDashboardLayout";
import axios from "axios";
import { Edit3, ImagePlus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

function AdminCategoriesContent() {
    const {
        token,
        language,
        isBangla,
        categories,
        setCategories,
        subcategories,
        setSubcategories,
    } = useAdminDashboard();

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
                    isBangla ? "ক্যাটাগরি আপডেট হয়েছে!" : "Category updated!"
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

    return (
        <div className="space-y-6">
            {/* ============ Create / Edit Category & Subcategory Forms ============ */}
            <div className="grid gap-5 lg:grid-cols-2">
                {/* ============ Add / Edit Category ============ */}
                <form
                    onSubmit={handleSaveCategory}
                    className={`space-y-3.5 rounded-2xl border p-5 transition ${editingCatId
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
                                <span>{isBangla ? "বাতিল" : "Cancel"}</span>
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
                            className={DARK_INPUT_CLASS}
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
                            className={DARK_INPUT_CLASS}
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
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const dataUrl =
                                                await compressImageFile(
                                                    file,
                                                    350
                                                );
                                            setCatForm((prev) => ({
                                                ...prev,
                                                image: dataUrl,
                                            }));
                                        } catch {
                                            toast.error("Invalid image");
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
                                            setCatForm((prev) => ({
                                                ...prev,
                                                image: "",
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
                                            <X size={13} strokeWidth={2.5} />
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

                {/* ============ Add / Edit Subcategory ============ */}
                <form
                    onSubmit={handleSaveSubCategory}
                    className={`space-y-3.5 rounded-2xl border p-5 transition ${editingSubCatId
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
                                <span>{isBangla ? "বাতিল" : "Cancel"}</span>
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
                            className={DARK_INPUT_CLASS}
                        >
                            <option value="">Parent Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {localized(cat.name, language)}
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
                            className={DARK_INPUT_CLASS}
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
                            className={DARK_INPUT_CLASS}
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-3.5 py-2 text-xs text-slate-300 hover:border-emerald-500/40">
                                <ImagePlus size={15} />
                                <span>
                                    {subCatForm.image
                                        ? isBangla
                                            ? "ছবি পরিবর্তন ✓"
                                            : "Change Image ✓"
                                        : isBangla
                                            ? "ঐচ্ছিক ছবি"
                                            : "Optional Image"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const dataUrl =
                                                await compressImageFile(
                                                    file,
                                                    350
                                                );
                                            setSubCatForm((prev) => ({
                                                ...prev,
                                                image: dataUrl,
                                            }));
                                        } catch {
                                            toast.error("Invalid image");
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
                                            setSubCatForm((prev) => ({
                                                ...prev,
                                                image: "",
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
                                            <X size={13} strokeWidth={2.5} />
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

            {/* ============ Categories & Subcategories List ============ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((cat) => {
                    const childSubs = subcategories.filter(
                        (s) =>
                            String(s.category_id?._id || s.category_id) ===
                            String(cat._id)
                    );
                    const isEditingThisCat = editingCatId === cat._id;
                    return (
                        <div
                            key={cat._id}
                            className={`rounded-2xl border p-4 transition ${isEditingThisCat
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
                                            {localized(cat.name, language)}
                                        </p>
                                        <p className="truncate text-[11px] text-slate-400">
                                            {isBangla
                                                ? `${childSubs.length}টি সাব-ক্যাটাগরি`
                                                : `${childSubs.length} subcategor${childSubs.length === 1
                                                    ? "y"
                                                    : "ies"
                                                }`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openEditCategory(cat)}
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
                                            handleDeleteCategory(cat._id)
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
                                            editingSubCatId === sub._id;
                                        return (
                                            <span
                                                key={sub._id}
                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition ${isEditingThisSub
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
                                                        openEditSubCategory(sub)
                                                    }
                                                    className="cursor-pointer text-slate-400 transition hover:text-emerald-400"
                                                    title={
                                                        isBangla
                                                            ? "সাব-ক্যাটাগরি এডিট করুন"
                                                            : "Edit Subcategory"
                                                    }
                                                >
                                                    <Edit3 size={11} />
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
                                                    <X size={12} />
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
    );
}

export default function AdminCategoriesPage() {
    return (
        <AdminDashboardLayout activeSection="categories">
            <AdminCategoriesContent />
        </AdminDashboardLayout>
    );
}
