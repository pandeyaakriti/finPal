'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Budgets', href: '/budgets' },
  { name: 'Charts', href: '/charts' },
  { name: 'Net Worth Prediction', href: '/networth' },
  { name: 'Upload', href: '/upload' },
];

export default function Sidebar({ headerTitle }: { headerTitle?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#16202A] text-white flex flex-col sticky top-0 left-0">
      {/* Header */}
      <div className="px-6 py-5.5 text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] border-b border-white/10 shrink-0">
        finPal
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white font-semibold'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}