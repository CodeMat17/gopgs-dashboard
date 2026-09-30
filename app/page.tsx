"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { navGroups } from "@/lib/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  GraduationCap,
  LucideIcon,
  Mail,
  Newspaper,
  PenLine,
  Plus,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | undefined;
  hint?: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className='group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-muted-foreground'>{label}</p>
        <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <Icon className='size-4' />
        </div>
      </div>
      {value === undefined ? (
        <Skeleton className='mt-3 h-8 w-16' />
      ) : (
        <p className='mt-2 text-3xl font-bold tabular-nums tracking-tight'>
          {value.toLocaleString()}
        </p>
      )}
      {hint && <p className='mt-1 text-xs text-muted-foreground'>{hint}</p>}
    </Link>
  );
}

const quickActions = [
  { label: "Publish news", href: "/news", icon: Newspaper },
  { label: "Add a course", href: "/courses/add", icon: BookOpen },
  { label: "Update contacts", href: "/contact-us", icon: Mail },
  { label: "New Postgrad Pen article", href: "/postgrad-pen", icon: PenLine },
];

export default function Home() {
  const overview = useQuery(api.dashboard.getOverview);
  const { user } = useUser();

  const contactComplete =
    overview?.contact.hasAddress && overview.contact.departmentsConfigured === 3;

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:py-8'>
      {/* Hero */}
      <section className='hero-brand rounded-2xl px-6 py-8 sm:px-10 sm:py-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-gold'>
          {dayjs().format("dddd, D MMMM YYYY")}
        </p>
        <h1 className='mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl'>
          {greeting()}
          {user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className='mt-2 max-w-2xl text-sm text-white/70 sm:text-base'>
          Everything on the public Postgraduate School website is managed from
          here. Changes you save go live on the site automatically.
        </p>
        <div className='mt-6 flex flex-wrap gap-2'>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/15'>
              <Plus className='size-3.5 text-gold' />
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label='Courses'
          value={overview?.courses}
          icon={BookOpen}
          href='/courses'
          hint='Programmes listed'
        />
        <StatCard
          label='News articles'
          value={overview?.news}
          icon={Newspaper}
          href='/news'
          hint={
            overview ? `${overview.newsViews.toLocaleString()} total views` : undefined
          }
        />
        <StatCard
          label='Staff'
          value={overview?.staff}
          icon={Briefcase}
          href='/staff'
          hint='Team profiles'
        />
        <StatCard
          label='Alumni'
          value={overview?.alumni}
          icon={GraduationCap}
          href='/alumni'
          hint='Success stories'
        />
        <StatCard
          label='Postgrad Pen'
          value={overview?.penArticles}
          icon={PenLine}
          href='/postgrad-pen'
          hint={
            overview ? `${overview.penViews.toLocaleString()} total views` : undefined
          }
        />
        <StatCard
          label='File downloads'
          value={overview?.downloads}
          icon={Download}
          href='/course-materials'
          hint={overview ? `Across ${overview.files} files` : undefined}
        />
        <StatCard
          label='News views'
          value={overview?.newsViews}
          icon={Eye}
          href='/news'
          hint='All time'
        />
        <Link
          href='/contact-us'
          className='group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>
              Contact details
            </p>
            <div
              className={`flex size-9 items-center justify-center rounded-lg ${
                contactComplete
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}>
              {contactComplete ? (
                <CheckCircle2 className='size-4' />
              ) : (
                <TriangleAlert className='size-4' />
              )}
            </div>
          </div>
          {overview === undefined ? (
            <Skeleton className='mt-3 h-8 w-16' />
          ) : (
            <p className='mt-2 text-3xl font-bold tabular-nums tracking-tight'>
              {overview.contact.departmentsConfigured}/3
            </p>
          )}
          <p className='mt-1 text-xs text-muted-foreground'>
            Department contacts set
          </p>
        </Link>
      </section>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Sections */}
        <section className='space-y-4 lg:col-span-2'>
          <h2 className='text-lg font-semibold'>Manage content</h2>
          <div className='space-y-6'>
            {navGroups
              .filter((group) => group.label !== "Overview")
              .map((group) => (
                <div key={group.label}>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                    {group.label}
                  </p>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {group.items.map((item) => (
                      <Link
                        key={item.url}
                        href={item.url}
                        className='group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent'>
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground'>
                          <item.icon className='size-5' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='font-medium'>{item.title}</p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className='size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Latest news */}
        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Latest news</h2>
            <Link href='/news' className='text-sm font-medium text-primary hover:underline'>
              View all
            </Link>
          </div>
          <div className='divide-y rounded-xl border bg-card'>
            {overview === undefined &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='space-y-2 p-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-3 w-24' />
                </div>
              ))}
            {overview?.latestNews.length === 0 && (
              <p className='p-6 text-center text-sm text-muted-foreground'>
                No news published yet.
              </p>
            )}
            {overview?.latestNews.map((item) => (
              <div key={item._id} className='p-4'>
                <p className='line-clamp-2 text-sm font-medium'>{item.title}</p>
                <p className='mt-1 flex items-center gap-3 text-xs text-muted-foreground'>
                  <span>{dayjs(item._creationTime).format("D MMM YYYY")}</span>
                  <span className='inline-flex items-center gap-1'>
                    <Eye className='size-3' /> {item.views.toLocaleString()}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
