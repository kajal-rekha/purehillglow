import Link from "next/link";
import ProductSearch from "../ProductSearch";

const Navbar = () => {
    return (
        <div className="pt-5">
            <div className="flex justify-between items-center gap-10">
                <div>
                    <Link href="/" className="italic font-semibold">
                        Purehillglow
                        {/* <Image
                        src="https://res.cloudinary.com/dh0ado2ir/image/upload/v1764215598/purehillglow-logo-website_clw2mn.jpg"
                        alt="pure hill glow logo"
                        width={200}
                        height={200}
                        className="w-20 h-20 rounded-full"
                    /> */}
                    </Link>
                </div>

                <div>
                    <ProductSearch />
                </div>

                <div>
                    <Link href="/">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
