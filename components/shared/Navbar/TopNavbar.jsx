import { BadgeCheck, Flower2, Truck } from "lucide-react";

const TopNavbar = () => {
  return (
    <div className="fixed top-0 inset-x-0 z-50 h-9 bg-primary  hidden md:block">
      <div className="wrapper mx-auto h-full px-4">
        <ul className="flex gap-5 h-full items-center justify-between text-light w-[50%] mx-auto">
          <li className="flex items-center gap-1 whitespace-nowrap">
            <Flower2 size={13} className="text-green-300" />
            <span className="text-xs  font-medium">
              100% Authentic Products
            </span>
          </li>

          <li className="hidden md:flex items-center gap-1 whitespace-nowrap">
            <Truck size={13} className="text-green-300" />
            <span className="text-xs  font-medium">
              Fast Delivery All Over Bangladesh
            </span>
          </li>

          <li className="hidden lg:flex items-center gap-1 whitespace-nowrap">
            <BadgeCheck size={13} className="text-green-300" />
            <span className="text-xs  font-medium">
              Cash On Delivery Available
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopNavbar;
