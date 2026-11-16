"use client";

import AdminDashboardLayout, {
    DARK_INPUT_CLASS,
    useAdminDashboard,
} from "@/components/admin/AdminDashboardLayout";
import axios from "axios";
import { Search, Trash2, UserRound } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

function AdminCustomersContent() {
    const { user, token, isBangla, users, setUsers } = useAdminDashboard();
    const [userSearch, setUserSearch] = useState("");

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

    return (
        <div className="space-y-5">
            {/* ============ Search & Total Users Bar ============ */}
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#10171e] p-4">
                <div className="relative flex items-center sm:w-80">
                    <Search
                        size={15}
                        className="pointer-events-none absolute left-3.5 text-slate-500"
                    />
                    <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder={
                            isBangla
                                ? "নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                                : "Search users by name, email, phone..."
                        }
                        className={`${DARK_INPUT_CLASS} pl-9`}
                    />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                    Total: {filteredUsers.length}
                </span>
            </div>

            {/* ============ Customers Grid ============ */}
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
                                    handleRoleChange(u._id, e.target.value)
                                }
                                className="rounded-xl border border-white/10 bg-[#0b1015] px-2.5 py-1.5 text-xs font-bold capitalize text-emerald-400 outline-none"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            {u._id !== user?._id && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u._id)}
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
    );
}

export default function AdminCustomersPage() {
    return (
        <AdminDashboardLayout activeSection="users">
            <AdminCustomersContent />
        </AdminDashboardLayout>
    );
}
