"use client";

import Image from "next/image";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";

const Page = () => {
  return (
    <div className="relative">
      {/* Hero Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col max-w-6xl mx-auto w-full">
        {/* Enhanced Hero Section */}
        <section className="space-y-8 py-20 md:py-32 px-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="group relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              <Image
                src="/logo.svg"
                alt="Vero"
                width={64}
                height={64}
                className="relative hidden md:block transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            <div className="space-y-4 text-center">
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                Build with Context
                <br className="hidden sm:block" />
                <span className="text-2xl md:text-5xl lg:text-6xl">Model & Vero-Style</span>
              </h1>
              
              <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Create stunning apps and websites by chatting with AI.
                <br className="hidden md:block" />
                <span className="text-base md:text-xl opacity-80">Professional, fast, and intuitive.</span>
              </p>
            </div>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                ✨ AI-Powered
              </div>
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                🚀 Lightning Fast
              </div>
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                💡 Context Aware
              </div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto w-full mt-12">
            <ProjectForm />
          </div>
        </section>
        
        <div className="px-4">
          <ProjectsList />
        </div>
      </div>
    </div>
  );
};

export default Page;