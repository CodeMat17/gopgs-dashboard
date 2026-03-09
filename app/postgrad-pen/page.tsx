"use client";

import AddSpotlight from "@/components/postgrad-pen/AddSpotlight";
import CreatePostgradPen from "@/components/postgrad-pen/CreatePostgradPen";
import DeletePostgradPen from "@/components/postgrad-pen/DeletePostgradPen";
import DeleteSpotlight from "@/components/postgrad-pen/DeleteSpotlight";
import UpdatePostgradPen from "@/components/postgrad-pen/UpdatePostgradPen";
import UpdateSpotlight from "@/components/postgrad-pen/UpdateSpotlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import { BookOpen, Eye, GraduationCap, Search, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

dayjs.extend(relativeTime);

const ITEMS_PER_PAGE = 9;

const CATEGORY_COLORS: Record<string, string> = {
  Poetry: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Essay: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Fiction: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Short Story": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Memoir: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function PostgradPenPage() {
  const writings = useQuery(api.postgradPen.getPostgradPenList);
  const spotlights = useQuery(api.postgradPen.getSpotlights);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { uniqueCategories, totalPages, paginated, totalFiltered } = useMemo(() => {
    if (!writings)
      return { uniqueCategories: [], totalPages: 0, paginated: [], totalFiltered: 0 };

    const cats = Array.from(
      new Set(writings.map((w) => w.category).filter(Boolean) as string[])
    );

    const filtered = writings.filter((w) => {
      const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) ||
        w.author.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCategory || w.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { uniqueCategories: cats, totalPages, paginated, totalFiltered: filtered.length };
  }, [writings, search, selectedCategory, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 1) setCurrentPage((p) => p - 1);
      else if (e.key === "ArrowRight" && currentPage < totalPages)
        setCurrentPage((p) => p + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
  };

  const hasActiveFilters = search || selectedCategory;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
             
              <div>
                <h1 className="text-3xl font-bold tracking-tight">The Postgrad Pen</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Creative writing by our postgraduate community
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <AddSpotlight />
              <CreatePostgradPen />
            </div>
          </div>
        </div>

        {/* ── Spotlight Section ────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold">Spotlight on Postgrads</h2>
          </div>

          {spotlights === undefined ? (
            <div className="rounded-2xl overflow-hidden border bg-white dark:bg-gray-900">
              <div className="flex flex-col md:flex-row">
                <Skeleton className="h-72 md:h-auto md:w-2/5" />
                <div className="flex-1 p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-9 w-36" />
                </div>
              </div>
            </div>
          ) : spotlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 border-2 border-dashed rounded-2xl">
              <GraduationCap className="w-10 h-10 opacity-30" />
              <p className="font-medium">No spotlight yet</p>
              <p className="text-sm opacity-70">Add a featured postgrad student</p>
            </div>
          ) : (() => {
            const s = spotlights[0];
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
                <div className="flex flex-col md:flex-row">

                  {/* Photo column */}
                  <div className="md:w-2/5 flex-shrink-0">
                    {/* Main photo */}
                    <div className="relative h-72 md:h-full min-h-[18rem] bg-muted">
                      {s.photos.length > 0 ? (
                        <Image
                          src={s.photos[0].url}
                          alt={s.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>

                    {/* Extra photo thumbnails */}
                    {s.photos.length > 1 && (
                      <div className="flex gap-1 p-1 bg-muted/40 border-t">
                        {s.photos.slice(1).map((photo, i) => (
                          <div
                            key={i}
                            className="relative h-16 flex-1 overflow-hidden rounded">
                            <Image
                              src={photo.url}
                              alt={`${s.name} photo ${i + 2}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details column */}
                  <div className="flex-1 flex flex-col p-6 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-100">
                          Featured
                        </Badge>
                        <span className="text-xs text-muted-foreground">{s.faculty}</span>
                      </div>
                      <h3 className="text-2xl font-bold mt-1">{s.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{s.program}</p>
                    </div>

                    <div
                      className="text-sm leading-relaxed text-muted-foreground flex-1 space-y-3"
                      dangerouslySetInnerHTML={{
                        __html: s.bio
                          .split(/\n\n+/)
                          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                          .join(""),
                      }}
                    />

                    {s.achievement && (
                      <blockquote className="border-l-4 border-amber-400 pl-4 py-1 italic text-sm text-muted-foreground">
                        &ldquo;{s.achievement}&rdquo;
                      </blockquote>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <DeleteSpotlight id={s._id} name={s.name} />
                      <UpdateSpotlight spotlight={s} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </section>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="border-t" />

        {/* ── Writings Section ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Creative Writings</h2>
            {writings !== undefined && (
              <Badge variant="secondary" className="ml-auto">
                {writings.length} piece{writings.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-9"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              {uniqueCategories.length > 0 && (
                <div className="flex gap-2 flex-wrap items-center">
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setSelectedCategory(selectedCategory === cat ? null : cat)
                      }
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent border-border hover:bg-muted"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-muted-foreground">
                  {totalFiltered} result{totalFiltered !== 1 ? "s" : ""}
                </span>
                {search && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 text-xs px-2 text-destructive hover:text-destructive">
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Writings Grid */}
          {writings === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border bg-white dark:bg-gray-900 p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-30" />
              <p className="font-medium">No writings found</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}>
              {paginated.map((piece, index) => (
                <motion.div
                  key={piece._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white dark:bg-gray-900 rounded-xl border overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">

                  {/* Category bar */}
                  <div
                    className={`h-1.5 w-full ${
                      piece.category
                        ? piece.category === "Poetry"
                          ? "bg-purple-400"
                          : piece.category === "Essay"
                          ? "bg-blue-400"
                          : piece.category === "Fiction"
                          ? "bg-green-400"
                          : piece.category === "Short Story"
                          ? "bg-amber-400"
                          : piece.category === "Memoir"
                          ? "bg-rose-400"
                          : "bg-gray-300"
                        : "bg-primary/30"
                    }`}
                  />

                  <div className="flex-1 flex flex-col p-5 gap-3">
                    <div className="space-y-1 flex-1">
                      {piece.category && (
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            CATEGORY_COLORS[piece.category] ?? CATEGORY_COLORS["Other"]
                          }`}>
                          {piece.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-base leading-snug line-clamp-2 mt-1">
                        {piece.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {piece.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {piece.views.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span title={dayjs(piece._creationTime).format("MMM DD, YYYY")}>
                        {dayjs(piece._creationTime).fromNow()}
                      </span>
                      {piece.updatedOn && (
                        <span className="text-[11px]">
                          edited {dayjs(piece.updatedOn).fromNow()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <DeletePostgradPen id={piece._id} title={piece.title} />
                      <UpdatePostgradPen slug={piece.slug} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={currentPage === 1 ? "opacity-40 pointer-events-none" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      {currentPage} / {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                      }}
                      className={
                        currentPage === totalPages ? "opacity-40 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
