import Link from "next/link";

const MainNavbar = () => {
    return (
        <div className="h-13 fixed top-20 left-0 right-0 z-[99]  flex items-center  shadow-sm bg-blue text-light ">
            <ul className="flex justify-between gap-10 wrapper">
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/">Home</Link>
                </li>
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/beauty-skincare">Beauty & Skincare</Link>
                </li>
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/pickels">Organic Hill Pickles</Link>
                </li>
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/hill-accessories">Hill Accessories</Link>
                </li>
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/hill-clothes">Traditional Hill Clothes</Link>
                </li>
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/combo-offer">Combo Offer</Link>
                </li>
                <li className="text-[0.9rem] font-semibold">
                    <Link href="/new-arrivals">New arrivals</Link>
                </li>
            </ul>
        </div>
    );
};

export default MainNavbar;
