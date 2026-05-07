"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  TwitterIcon, 
  GithubIcon, 
  LinkedinIcon, 
  MailIcon, 
  HeartIcon,
  ExternalLinkIcon,
  SparklesIcon,
  CodeIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  HelpCircleIcon
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Templates", href: "#templates" },
      { name: "Pricing", href: "/pricing" },
      { name: "API", href: "/api" },
    ],
    resources: [
      { name: "Documentation", href: "/docs", icon: BookOpenIcon },
      { name: "Tutorials", href: "/tutorials", icon: CodeIcon },
      { name: "Help Center", href: "/help", icon: HelpCircleIcon },
      { name: "Status", href: "/status", icon: ShieldCheckIcon },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { 
      name: "Twitter", 
      href: "https://twitter.com/vero", 
      icon: TwitterIcon,
      color: "hover:text-blue-400"
    },
    { 
      name: "GitHub", 
      href: "https://github.com/vero", 
      icon: GithubIcon,
      color: "hover:text-gray-900 dark:hover:text-white"
    },
    { 
      name: "LinkedIn", 
      href: "https://linkedin.com/company/vero", 
      icon: LinkedinIcon,
      color: "hover:text-blue-600"
    },
    { 
      name: "Email", 
      href: "mailto:hello@vero.ai", 
      icon: MailIcon,
      color: "hover:text-green-500"
    },
  ];

  return (
    <footer className="relative bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-800/20 mt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />
      
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link href="/" className="group flex items-center gap-3 w-fit">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Image 
                      src="/logo.svg" 
                      alt="Vero" 
                      width={24} 
                      height={24} 
                      className="filter brightness-0 invert"
                    />
                  </div>
                </div>
                <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Vero
                </span>
              </Link>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
              Build stunning applications with AI. Professional, fast, and intuitive development platform for the modern web.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-200 hover:scale-110 hover:shadow-lg`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-blue-500" />
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    <ExternalLinkIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-green-500" />
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => {
                const Icon = link.icon || ExternalLinkIcon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <Icon className="w-3 h-3 opacity-60" />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-blue-500" />
                Stay Updated
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get the latest updates on new features and improvements.
              </p>
              <div className="flex gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-green-100/50 dark:bg-green-900/20 rounded-full text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" />
                SOC 2 Compliant
              </div>
              <div className="px-4 py-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                99.9% Uptime
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500">
              <span>© {currentYear} Vero. Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
