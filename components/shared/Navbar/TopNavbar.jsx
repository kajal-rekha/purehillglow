
import {
  Flower2,
  Truck,
  Phone,
  MessageCircleCode,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const TopNavbar = () => {
  const whatsappNumber = "8801234567890";
  const phoneNumber = "+8801234567890";
  const messengerUrl = "https://m.me/purehillglow";

  return (
    <div className="fixed top-0 inset-x-0 z-[1000] h-9 bg-primary md:block">
      <div className="wrapper mx-auto flex h-full items-center justify-between px-4">
        {/*=============== Left ================*/}
        <div className="flex items-center gap-5 text-light">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Flower2 size={13} className="text-green-200" />
            <span className="text-[12px] font-medium">
              100% Authentic Products
            </span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck size={13} className="text-green-200" />
            <span className="text-[12px] font-medium">
              Delivery Across Bangladesh
            </span>
          </div>
        </div>

        {/*=============== Right ================*/}
        <div className="flex items-center gap-3 text-[12px] font-medium text-light">
          <Link
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-green-200 eq"
          >
            <MessageCircleCode size={13} />
            <span>Order in WhatsApp</span>
          </Link>

          <span className="text-white/30">|</span>

          <Link
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-200 eq"
          >
            <span>Inbox</span>
          </Link>

          <span className="text-white/30">|</span>

          <Link
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-1 hover:text-green-200 eq"
          >
            <Phone size={13} />
            <span>{phoneNumber}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
