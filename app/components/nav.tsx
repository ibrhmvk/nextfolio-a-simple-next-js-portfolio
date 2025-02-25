import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { metaData } from "../config";

const navItems = {
  "/blog": { name: "Blog" },
  "/projects": { name: "Projects" },
  "/photos": { name: "Photos" },
  "/playground": { name: "Playground" },
};

export function Navbar() {
  return (
    <nav className="lg:mb-16 mb-8 pt-6 pb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-3xl font-semibold tracking-tight">
            {metaData.title}
          </Link>
        </div>
        <div className="flex flex-row gap-3 sm:gap-4 mt-4 sm:mt-0 sm:ml-auto items-center overflow-x-auto pb-1 sm:pb-0">
          {Object.entries(navItems).map(([path, { name }]) => (
            <Link
              key={path}
              href={path}
              className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative text-sm sm:text-base py-1 px-1"
            >
              {name}
            </Link>
          ))}
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
}
