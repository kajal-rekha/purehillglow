import Loading from "@/components/ui/Loading";
import { signup } from "@/redux/features/auth/authSlice";
import axios from "axios";
import { ImagePlus, X } from "lucide-react";
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
                !formData.image ||
                !formData.address ||
                !formData.phone
            ) {
                setIsLoading(false);
                toast.error(
                    isBangla
                        ? "সবগুলো ঘর পূরণ করা আবশ্যক।"
                        : "All fields are required."
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
                    router.push("/");
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
        <div className="min-h-screen px-4 pb-16 pt-36">
            <div className="mx-auto w-full max-w-lg rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_8px_30px_rgba(12,154,91,0.08)] sm:p-8">
                <div className="mb-6 flex flex-col gap-1 border-b border-primary/10 pb-4 text-center">
                    <h2 className="text-2xl font-bold text-dark">
                        {isBangla
                            ? "নতুন অ্যাকাউন্ট তৈরি করুন!"
                            : "Create an account!"}
                    </h2>
                    <p className="text-sm text-black/55">
                        {isBangla
                            ? "রেজিস্টার করতে আপনার তথ্যগুলো দিন"
                            : "Please provide your details to register"}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex w-full flex-col gap-4"
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
                        <input
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            type="password"
                            id="password"
                            placeholder={
                                isBangla
                                    ? "পাসওয়ার্ড লিখুন"
                                    : "Write your password"
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col items-start gap-1.5">
                        <label
                            htmlFor="image"
                            className="text-sm font-medium text-dark"
                        >
                            {isBangla ? "ছবি" : "Image"}
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
                                className="eq flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#b8d4c2] bg-[#f8fbf9] px-4 py-3.5 text-sm text-black/60 hover:border-primary hover:bg-green-light/40 hover:text-primary"
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
                        className={`mt-2 w-full rounded-xl py-3 px-4 text-sm font-semibold ${
                            isLoading
                                ? "cursor-not-allowed bg-gray text-black/50"
                                : "cursor-pointer bg-secondary text-light hover:bg-primary eq"
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

                    <p className="mt-1 text-center text-sm">
                        <span className="text-black/55">
                            {isBangla
                                ? "ইতিমধ্যে অ্যাকাউন্ট আছে? "
                                : "Already have an account? "}
                        </span>
                        <Link
                            href="/auth/login"
                            className="font-semibold text-primary hover:underline"
                        >
                            {isBangla ? "লগইন" : "Login"}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;
