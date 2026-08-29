import { Flower2, Truck, Phone, MessageCircleCode } from "lucide-react";
import Link from "next/link";

const TopNavbar = () => {
  const whatsappNumber = "8801234567890";
  const phoneNumber = "+8801234567890";
  const messengerUrl = "https://m.me/purehillglow";

  return (
    <div className="fixed top-0 inset-x-0 z-50 h-9 bg-primary hidden md:block">
      <div className="wrapper mx-auto h-full px-4">
        <div className="flex h-full items-center justify-between text-light">
          {/*========== Left side ==========*/}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Flower2 size={13} className="text-green-300" />
              <span className="text-xs font-medium">
                100% Authentic Products
              </span>
            </div>

            <div className="flex items-center gap-1 whitespace-nowrap">
              <Truck size={13} className="text-green-300" />
              <span className="text-xs font-medium">
                Fast Delivery All Over Bangladesh
              </span>
            </div>
          </div>

          {/*========== Right side ==========*/}
          <div className="flex items-center gap-4 text-xs font-medium">
            {/*============ Messenger =============*/}

            {/*============ WhatsApp ============*/}
            <Link
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1  hover:opacity-80 eq"
            >
              <MessageCircleCode size={13} className="text-green-300" />
              <span>Order in WhatsApp</span>
            </Link>

            <span className="opacity-50">|</span>
            <Link
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 eq"
            >
              Inbox
            </Link>

            <span className="opacity-50">|</span>

            {/*============ Phone Call ============*/}
            <Link
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-1  hover:opacity-80 eq"
            >
              <Phone size={13} className="text-green-300" />

              <span>{phoneNumber}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
