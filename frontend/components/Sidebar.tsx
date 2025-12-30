'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Budgets', href: '/budgets' },
  { name: 'Debts', href: '/debts' },
  { name: 'Charts', href: '/charts' },
  { name: 'Net Worth Prediction', href: '/net-worth' },
  { name: 'Upload', href: '/upload' },
  { name: 'Synchronization', href: '/sync' },
];

export default function Sidebar({ headerTitle }: { headerTitle?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#16202A] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 text-2xl font-bold text-green-400 border-b border-white/10">
        finPal
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold'
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
