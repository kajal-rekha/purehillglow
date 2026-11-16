"use client";

import AdminDashboardLayout, {
    compressImageFile,
    DARK_INPUT_CLASS,
    useAdminDashboard,
} from "@/components/admin/AdminDashboardLayout";
import { login } from "@/redux/features/auth/authSlice";
import axios from "axios";
import { Camera, Save, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function AdminProfileContent() {
    const { user, token, isBangla, dispatch } = useAdminDashboard();

    const [profileForm, setProfileForm] = useState({
        username: "",
        email: "",
        phone: "",
        address: "",
        image: "",
        password: "",
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

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

    return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/8 bg-[#10171e] p-6 shadow-xl sm:p-8">
            {/* ============ Avatar & Admin Header ============ */}
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
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const dataUrl = await compressImageFile(
                                        file,
                                        300
                                    );
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        image: dataUrl,
                                    }));
                                } catch {
                                    toast.error("Failed to load image");
                                }
                            }}
                        />
                    </label>
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-lg font-bold text-white">
                        {user?.username}
                    </h2>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 text-[11px] font-bold uppercase text-emerald-400">
                        <ShieldCheck size={12} />
                        Administrator
                    </span>
                </div>
            </div>

            {/* ============ Admin Profile Form ============ */}
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
                            className={DARK_INPUT_CLASS}
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
                            className={DARK_INPUT_CLASS}
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
                            className={DARK_INPUT_CLASS}
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
                            className={DARK_INPUT_CLASS}
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
                            className={DARK_INPUT_CLASS}
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
    );
}

export default function AdminProfilePage() {
    return (
        <AdminDashboardLayout activeSection="profile">
            <AdminProfileContent />
        </AdminDashboardLayout>
    );
}
