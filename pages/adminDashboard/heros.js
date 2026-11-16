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

function AdminHerosContent() {
    const { token, language, isBangla, heroes, setHeroes } =
        useAdminDashboard();

    const [heroForm, setHeroForm] = useState({
        titleEn: "",
        titleBn: "",
        descEn: "",
        descBn: "",
        imageURL: "",
    });
    const [editingHeroId, setEditingHeroId] = useState(null);
    const [isSubmittingHero, setIsSubmittingHero] = useState(false);

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
        } catch {
            toast.error("Failed to delete hero banner");
        }
    };

    return (
        <div className="space-y-6">
            {/* ============ Create / Edit Hero Banner Form ============ */}
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
                            <span>{isBangla ? "বাতিল" : "Cancel"}</span>
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
                        className={DARK_INPUT_CLASS}
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
                        className={DARK_INPUT_CLASS}
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
                        className={DARK_INPUT_CLASS}
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
                        className={DARK_INPUT_CLASS}
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
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const dataUrl = await compressImageFile(
                                            file,
                                            700
                                        );
                                        setHeroForm((prev) => ({
                                            ...prev,
                                            imageURL: dataUrl,
                                        }));
                                    } catch {
                                        toast.error("Invalid image");
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
                                        isBangla ? "ছবি সরান" : "Remove image"
                                    }
                                    title={
                                        isBangla ? "ছবি সরান" : "Remove image"
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

            {/* ============ Hero Banners List ============ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {heroes.map((hero) => {
                    const isEditingThisHero = editingHeroId === hero._id;
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
                                        {localized(hero.title, language)}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                                        {localized(hero.description, language)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => openEditHero(hero)}
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
                                    onClick={() => handleDeleteHero(hero._id)}
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
    );
}

export default function AdminHerosPage() {
    return (
        <AdminDashboardLayout activeSection="heros">
            <AdminHerosContent />
        </AdminDashboardLayout>
    );
}
