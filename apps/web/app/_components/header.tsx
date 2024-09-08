"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Github } from "lucide-react";

export default function CenteredLogo() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black flex items-center justify-between h-16 px-4">
      {/* Centered logo */}
      <div className="flex-grow flex justify-center items-center">
        <a href="/" className="flex items-center group">
          <img
            alt="Croak"
            src="./croak.png"
            className="h-8 w-auto transition-transform duration-300 group-hover:rotate-12"
          />
          <span className="text-custom-green text-lg font-semibold leading-8 ml-2">Croak</span>
        </a>
      </div>

      {/* GitHub link on the right */}
      <a
        href="https://github.com/Mats-Dodd/croak"
        className="text-white hover:text-gray-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github size={25} className="text-custom-light-green" />
      </a>

      {/* Optional: Mobile menu logic */}
      <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <img
                alt="Croak"
                src="./croak.png"
                className="h-8 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              🐸
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
