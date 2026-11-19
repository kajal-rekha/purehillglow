import Loading from "@/components/ui/Loading";
import { signup } from "@/redux/features/auth/authSlice";
import axios from "axios";
import { ChevronRight, Eye, EyeOff, ImagePlus, Leaf, UserPlus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        image: "",
        address: "",
        phone: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [imageName, setImageName] = useState("");
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language?.language);
    const isBangla = language === "bn";

    //======= handle local image upload & compress =======//
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error(
                isBangla
                    ? "অনুগ্রহ করে একটি সঠিক ছবির ফাইল সিলেক্ট করুন।"
                    : "Please select a valid image file."
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_SIZE = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
                setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
                setImageName(file.name);
            };
            img.onerror = () => {
                toast.error(
                    isBangla
                        ? "ছবিটি লোড করা যায়নি। অন্য একটি ফাইল চেষ্টা করুন।"
                        : "Failed to load image. Please try another file."
                );
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        setImageName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    //======= handle submit =======//
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setIsLoading(true);

            if (
                !formData.username ||
                !formData.email ||
                !formData.password ||
                !formData.address ||
                !formData.phone
            ) {
                setIsLoading(false);
                toast.error(
                    isBangla
                        ? "প্রয়োজনীয় সবগুলো ঘর পূরণ করা আবশ্যক।"
                        : "Please fill in all required fields."
                );
                return;
            }

            try {
                const res = await axios.post("/api/users/auth/register", {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    image: formData.image,
                    address: formData.address,
                    phone: formData.phone,
                });

                if (res.data) {
                    toast.success(
                        isBangla ? "সাইনআপ সফল হয়েছে!" : "Signup successful!"
                    );

                    dispatch(
                        signup({
                            user: res.data.user,
                            token: res.data.token,
                        })
                    );
                    setFormData({
                        username: "",
                        email: "",
                        password: "",
                        image: "",
                        address: "",
                        phone: "",
                    });
                    setImageName("");

                    setIsLoading(false);
                    const redirectUrl = router.query.redirect || "/";
                    router.push(redirectUrl);
                }
            } catch (err) {
                setIsLoading(false);
                toast.error(
                    err?.response?.data?.error ||
                    (isBangla
                        ? "সাইনআপ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
                        : "Signup failed. Please try again.")
                );
            }
        },
        [formData, router, dispatch, isBangla]
    );

    const inputClass =
        "eq w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] px-4 py-3 text-sm text-dark outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

    return (
        <main className="min-h-screen bg-[#fbf8f2] pb-16 pt-[116px]">
            {/* ============ Hero Banner ============ */}
            <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
                <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
                <Leaf
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
                />
                <div className="wrapper relative mx-auto flex min-h-36 flex-col justify-center px-4 py-6 sm:px-6">
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-2.5 flex items-center gap-2 text-[11px] text-white/75"
                    >
                        <Link href="/" className="hover:text-white">
                            {isBangla ? "হোম" : "Home"}
                        </Link>
                        <ChevronRight size={13} />
                        <span>{isBangla ? "রেজিস্টার" : "Create Account"}</span>
                    </nav>
                    <h1 className="font-playfair text-2xl font-bold sm:text-3xl">
                        {isBangla ? (
                            <>
                                নতুন <span className="text-[#efc477]">অ্যাকাউন্ট তৈরি করুন</span>
                            </>
                        ) : (
                            <>
                                Create Your <span className="text-[#efc477]">Account</span>
                            </>
                        )}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {isBangla
                            ? "সহজেই অর্ডার করতে আপনার তথ্য দিয়ে নিবন্ধন করুন"
                            : "Join Pure Hill Glow for authentic Bandarban skincare & easy checkout"}
                    </p>
                </div>
            </section>

            <div className="wrapper mx-auto flex justify-center px-4 pt-8 sm:px-6 sm:pt-10">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                    <div className="border-b border-[#eee8df] bg-[#f7f4ec] px-6 py-5 text-center sm:px-8">
                        <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <UserPlus size={20} />
                        </div>
                        <h2 className="font-playfair text-2xl font-bold text-[#203c28]">
                            {isBangla
                                ? "নতুন অ্যাকাউন্ট তৈরি করুন!"
                                : "Create an account!"}
                        </h2>
                        <p className="mt-0.5 text-sm text-black/55">
                            {isBangla
                                ? "রেজিস্টার করতে আপনার তথ্যগুলো দিন"
                                : "Please provide your details to register"}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full flex-col gap-4 p-6 sm:p-8"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col items-start gap-1.5">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-dark"
                                >
                                    {isBangla ? "নাম" : "Name"}
                                </label>
                                <input
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            username: e.target.value,
                                        })
                                    }
                                    type="text"
                                    id="name"
                                    placeholder={
                                        isBangla ? "আপনার নাম লিখুন" : "Sarah Parker"
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col items-start gap-1.5">
                                <label
                                    htmlFor="phone"
                                    className="text-sm font-medium text-dark"
                                >
                                    {isBangla ? "ফোন নম্বর" : "Phone"}
                                </label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    type="text"
                                    id="phone"
                                    placeholder={
                                        isBangla
                                            ? "ফোন নম্বর লিখুন"
                                            : "Enter phone number"
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-dark"
                            >
                                {isBangla ? "ইমেইল অ্যাড্রেস" : "Email address"}
                            </label>
                            <input
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                type="email"
                                id="email"
                                placeholder="hello@example.com"
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col items-start gap-1.5">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-dark"
                            >
                                {isBangla ? "পাসওয়ার্ড" : "Password"}
                            </label>
                            <div className="relative flex w-full items-center">
                                <input
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder={
                                        isBangla
                                            ? "পাসওয়ার্ড লিখুন"
                                            : "Write your password"
                                    }
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 text-black/40 hover:text-dark"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>
                            <span className="text-[11px] text-black/45">
                                {isBangla
                                    ? "কমপক্ষে ৮ অক্ষর (বড় হাতের, ছোট হাতের, সংখ্যা ও বিশেষ চিহ্ন যেমন @#$ সহ)"
                                    : "Min 8 chars with uppercase, lowercase, number & symbol (e.g. @#$)"}
                            </span>
                        </div>

                        <div className="flex flex-col items-start gap-1.5">
                            <label
                                htmlFor="image"
                                className="text-sm font-medium text-dark"
                            >
                                {isBangla ? "প্রোফাইল ছবি (ঐচ্ছিক)" : "Profile Photo (Optional)"}
                            </label>
                            <input
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                type="file"
                                id="image"
                                accept="image/*"
                                className="hidden"
                            />
                            {formData.image ? (
                                <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] px-3.5 py-2.5">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Image
                                            src={formData.image}
                                            alt="Preview"
                                            width={44}
                                            height={44}
                                            className="h-11 w-11 shrink-0 rounded-full border border-primary/30 object-cover"
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate text-sm font-medium text-dark">
                                                {imageName ||
                                                    (isBangla
                                                        ? "নির্বাচিত ছবি"
                                                        : "Selected image")}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="w-fit text-xs font-medium text-primary underline hover:opacity-80"
                                            >
                                                {isBangla
                                                    ? "ছবি পরিবর্তন করুন"
                                                    : "Change photo"}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="rounded-full p-1.5 text-black/50 hover:bg-red/10 hover:text-red eq"
                                        aria-label="Remove image"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="image"
                                    className="eq flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#b8d4c2] bg-[#f8fbf9] px-4 py-3 text-sm text-black/60 hover:border-primary hover:bg-green-light/40 hover:text-primary"
                                >
                                    <ImagePlus size={19} className="shrink-0" />
                                    <span>
                                        {isBangla
                                            ? "ডিভাইস / গ্যালারি থেকে আপনার ছবি আপলোড করুন"
                                            : "Upload your photo from device / gallery"}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="flex flex-col items-start gap-1.5">
                            <label
                                htmlFor="address"
                                className="text-sm font-medium text-dark"
                            >
                                {isBangla ? "ঠিকানা" : "Address"}
                            </label>
                            <input
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                                type="text"
                                id="address"
                                placeholder={
                                    isBangla
                                        ? "আপনার পূর্ণ ঠিকানা লিখুন"
                                        : "Enter your full address"
                                }
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`mt-2 w-full rounded-xl py-3 px-4 text-sm font-semibold ${isLoading
                                ? "cursor-not-allowed bg-gray text-black/50"
                                : "cursor-pointer bg-primary text-light hover:bg-secondary eq"
                                }`}
                        >
                            {isLoading ? (
                                <Loading isLoading={isLoading} />
                            ) : isBangla ? (
                                "সাইন আপ"
                            ) : (
                                "Sign Up"
                            )}
                        </button>

                        <p className="mt-1 border-t border-[#eee8df] pt-4 text-center text-sm">
                            <span className="text-black/55">
                                {isBangla
                                    ? "ইতিমধ্যে অ্যাকাউন্ট আছে? "
                                    : "Already have an account? "}
                            </span>
                            <Link
                                href={
                                    router.query.redirect
                                        ? `/auth/login?redirect=${encodeURIComponent(
                                            router.query.redirect
                                        )}`
                                        : "/auth/login"
                                }
                                className="font-semibold text-primary hover:underline"
                            >
                                {isBangla ? "লগইন" : "Login"}
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default SignUpForm;
