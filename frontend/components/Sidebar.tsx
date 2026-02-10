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
    <aside className="
      w-64 h-screen flex flex-col sticky top-0 left-0
      bg-white text-gray-900
      dark:bg-[#16202A] dark:text-white
      border-r border-gray-200 dark:border-white/10
    ">
      {/* Header */}
      <div className="
        px-6 py-5.5 text-2xl font-bold
        text-transparent bg-clip-text
        bg-linear-to-r from-[#90A1B9] to-[#7AD1A6]
        border-b border-gray-200 dark:border-white/10
        shrink-0
      ">
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
              className={`
                block px-4 py-3 rounded-xl transition-all
                ${
                  isActive
                    ? `
                      bg-linear-to-r from-[#90A1B9] to-[#7AD1A6]
                      text-white font-semibold
                    `
                    : `
                      text-gray-600 hover:bg-gray-100
                      dark:text-gray-300 dark:hover:bg-white/10
                    `
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
/* Note: 
The above 
code defines a Sidebar component for the finPal application. It includes a header with the app name and a navigation menu with links to different sections of the dashboard. The active link is highlighted with a gradient background and white text, while inactive links have a more subdued style. The sidebar is designed to be responsive and visually appealing in both light and dark 

































































































modes. */
