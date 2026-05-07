"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, FolderIcon, SparklesIcon } from "lucide-react";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { user } = useUser();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());
  if (!user) return null;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {user?.firstName}&apos;s Projects
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your AI-powered creations
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-16 px-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <FolderIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Start building your first AI-powered project using the form above
              </p>
            </div>
          </div>
        )}
        
        {projects?.map((project, index) => (
          <div
            key={project.id}
            className="group relative"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Card */}
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:scale-105 hover:-translate-y-1">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur" />
              <div className="absolute inset-[1px] bg-white dark:bg-gray-800 rounded-2xl -z-10" />
              
              <Link href={`/projects/${project.id}`} className="block">
                <div className="flex items-start gap-4">
                  {/* Project Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Image
                        src="/logo.svg"
                        alt="Vero"
                        width={24}
                        height={24}
                        className="object-contain filter brightness-0 invert"
                      />
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
                  </div>
                  
                  {/* Project Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                        {project.name}
                      </h3>
                      <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 opacity-0 group-hover:opacity-100" />
                    </div>
                    
                    {/* Time & Status */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated {formatDistanceToNow(project.updatedAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-600"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
