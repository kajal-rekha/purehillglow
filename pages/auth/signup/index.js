import Loading from "@/components/ui/Loading";
import { signup } from "@/redux/features/auth/authSlice";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        image: "",
        address: "",
        phone: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

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
                toast.error("All fields are required.");
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
                    toast.success("Signup successful!");

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

                    setIsLoading(false);
                    router.push("/");
                }
            } catch (err) {
                setIsLoading(false);
                toast.error(
                    err?.response?.data?.error ||
                        "Signup failed. Please try again."
                );
            }
        },
        [formData, router, dispatch]
    );
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-1.5">
                <h2>Create an account!</h2>
                <p className="text-black/50">
                    Please provide your details to register
                </p>
            </div>
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-5 text-lg"
            >
                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="username">Name</label>
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
                        placeholder="sarah paraker"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>

                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="email">Email address</label>
                    <input
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        type="email"
                        id="email"
                        placeholder="hello@example.com"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>
                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="password">Password</label>
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
                        placeholder="Write your password"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>

                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="image">Image</label>
                    <input
                        value={formData.image}
                        onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                        }
                        type="url"
                        id="image"
                        placeholder="Past your image url from pexels/unsplash/cloudinary"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>

                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="address">Address</label>
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
                        placeholder="Past your image url from pexels/unsplash/cloudinary"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>
                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="phone">Phone</label>
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
                        placeholder="Enter phone number"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-3 px-4 rounded ${
                        isLoading
                            ? "bg-gray cursor-not-allowed"
                            : "bg-secondary text-light hover:bg-primary mt-2 eq"
                    }`}
                >
                    {isLoading ? <Loading isLoading={isLoading} /> : "Sign Up"}
                </button>
                <p>
                    <span className="text-black/50">
                        Allready have an account?
                    </span>
                    <Link href="/sign-in" className="link-item">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default SignUpForm;
