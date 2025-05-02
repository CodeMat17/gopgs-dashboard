'use client'

import { Briefcase, GraduationCap, Home, ListChecks, Mail, Users, Newspaper, FileText, NotebookText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "About Us",
    url: "/about-us",
    icon: Users,
  },
  {
    title: "Requirements",
    url: "/requirements",
    icon: ListChecks,
  },
  // {
  //   title: "Courses",
  //   url: "/courses",
  //   icon: BookOpen,
  // },
  {
    title: "News",
    url: "/news",
    icon: Newspaper,
  },
  {
    title: "Staff",
    url: "/staff",
    icon: Briefcase,
  },
  {
    title: "Alumni",
    url: "/alumni",
    icon: GraduationCap,
  },
  {
    title: "How to apply",
    url: "/how-to-apply",
    icon: FileText,
  },
  {
    title: "Course Material",
    url: "/course-materials",
    icon: NotebookText,
  },
  {
    title: "Contact Us",
    url: "/contact-us",
    icon: Mail,
  },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Sidebar
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } transition-all duration-300 ease-in-out`}>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel asChild>
            <div className='flex flex-col'>
              <p
                className={`${
                  isCollapsed ? "hidden" : "block"
                } text-lg font-semibold`}>
                GO PGS Admin Dashboard
              </p>
            </div>
          </SidebarGroupLabel> */}
          <SidebarGroupContent className='mt-12'>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center p-3 space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-semibold ${
                        isCollapsed ? "justify-center" : "justify-start"
                      }`}>
                      <item.icon size={24} className='w-8 h-8' />
                      <span className={`${isCollapsed ? "hidden" : "block"}`}>
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <button
        onClick={toggleSidebar}
        className='absolute bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600'
        aria-label='Toggle Sidebar'>
        {isCollapsed ? ">" : "<"}
      </button>
    </Sidebar>
  );
}
