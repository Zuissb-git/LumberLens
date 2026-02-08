import { TreePine } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <TreePine className="h-5 w-5 text-green-500" />
              LumberLens
            </div>
            <p className="text-sm">
              Compare lumber prices across vendors. Save money on every project.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Price Search</Link></li>
              <li><Link href="/build-orders" className="hover:text-white transition-colors">Build Orders</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/submit-price" className="hover:text-white transition-colors">Submit a Price</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} LumberLens. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
