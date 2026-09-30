import {
  Banknote,
  BookOpen,
  Briefcase,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Mail,
  Newspaper,
  NotebookText,
  PenLine,
  Users,
  Users2,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        description: "Site overview and quick actions",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "About Us",
        url: "/about-us",
        icon: Users,
        description: "Mission and vision statements",
      },
      {
        title: "News",
        url: "/news",
        icon: Newspaper,
        description: "Publish and edit news articles",
      },
      {
        title: "Postgrad Pen",
        url: "/postgrad-pen",
        icon: PenLine,
        description: "Student articles and spotlights",
      },
      {
        title: "Contact Us",
        url: "/contact-us",
        icon: Mail,
        description: "Address, phones, emails and department contacts",
      },
    ],
  },
  {
    label: "Admissions",
    items: [
      {
        title: "Courses",
        url: "/courses",
        icon: BookOpen,
        description: "Programmes offered by each faculty",
      },
      {
        title: "Requirements",
        url: "/requirements",
        icon: ListChecks,
        description: "Admission requirements and routes",
      },
      {
        title: "How to Apply",
        url: "/how-to-apply",
        icon: FileText,
        description: "Application steps",
      },
      {
        title: "Fees",
        url: "/fees",
        icon: Banknote,
        description: "Fee schedules for download",
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        title: "Course Materials",
        url: "/course-materials",
        icon: NotebookText,
        description: "Lecture notes and resources",
      },
      {
        title: "GPC Materials",
        url: "/gpc-materials",
        icon: NotebookText,
        description: "General postgraduate course files",
      },
      {
        title: "Timetable",
        url: "/timetable",
        icon: CalendarDays,
        description: "Lecture and exam timetables",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Staff",
        url: "/staff",
        icon: Briefcase,
        description: "Administrative team profiles",
      },
      {
        title: "Alumni",
        url: "/alumni",
        icon: GraduationCap,
        description: "Alumni success stories",
      },
      {
        title: "Students Database",
        url: "/pg-students",
        icon: Users2,
        description: "Registered postgraduate students",
      },
    ],
  },
];

export const navItems = navGroups.flatMap((group) => group.items);

export function isActivePath(pathname: string, url: string) {
  return url === "/" ? pathname === "/" : pathname.startsWith(url);
}

export function findNavItem(pathname: string) {
  return navItems
    .filter((item) => isActivePath(pathname, item.url))
    .sort((a, b) => b.url.length - a.url.length)[0];
}
