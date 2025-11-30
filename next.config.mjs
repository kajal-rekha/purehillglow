/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    images: {
        domains: [
            "res.cloudinary.com",
            "images.pexels.com",
            "hips.hearstapps.com",
            "images.unsplash.com",
            "plus.unsplash.com",
            "randomuser.me",
            "lh3.googleusercontent.com",
        ],
    },
};

export default nextConfig;
