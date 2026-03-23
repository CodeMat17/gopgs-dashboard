"use client";

import CreateNews from "@/components/news/CreateNews";
import DeleteNews from "@/components/news/DeleteNews";
import UpdateNews from "@/components/news/UpdateNews";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import { CameraOff, Eye, Images, Search, SlidersHorizontal, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

dayjs.extend(relativeTime);

type SortOption = "default" | "views_asc" | "views_desc";
const ITEMS_PER_PAGE = 12;

export default function NewsPage() {
  const newsList = useQuery(api.news.getNewsList);

  const [titleSearch, setTitleSearch] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);

  const { uniqueAuthors, totalPages, paginatedNews, totalFiltered } = useMemo(() => {
    if (!newsList)
      return { uniqueAuthors: [], totalPages: 0, paginatedNews: [], totalFiltered: 0 };

    const authors = Array.from(new Set(newsList.map((item) => item.author)));

    let filtered = newsList.filter((item) => {
      const matchesTitle = item.title
        .toLowerCase()
        .includes(titleSearch.toLowerCase());
      const matchesAuthor = !selectedAuthor || item.author === selectedAuthor;
      return matchesTitle && matchesAuthor;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === "views_asc") return a.views - b.views;
      if (sortOrder === "views_desc") return b.views - a.views;
      return 0;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedNews = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { uniqueAuthors: authors, totalPages, paginatedNews, totalFiltered: filtered.length };
  }, [newsList, titleSearch, selectedAuthor, sortOrder, currentPage]);

  const hasActiveFilters = titleSearch || selectedAuthor || sortOrder !== "default";

  useEffect(() => {
    setCurrentPage(1);
  }, [titleSearch, selectedAuthor, sortOrder]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 1) setCurrentPage((p) => p - 1);
      else if (e.key === "ArrowRight" && currentPage < totalPages) setCurrentPage((p) => p + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setTitleSearch("");
    setSelectedAuthor(undefined);
    setSortOrder("default");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News & Updates</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {newsList === undefined
                ? "Loading articles..."
                : `${newsList.length} article${newsList.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <CreateNews />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {titleSearch && (
                <button
                  onClick={() => setTitleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select
              value={selectedAuthor ?? "all"}
              onValueChange={(v) => setSelectedAuthor(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="views_desc">Most Views</SelectItem>
                <SelectItem value="views_asc">Fewest Views</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-muted-foreground">
                {totalFiltered} result{totalFiltered !== 1 ? "s" : ""}
              </span>
              {titleSearch && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  &ldquo;{titleSearch}&rdquo;
                  <button onClick={() => setTitleSearch("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedAuthor && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {selectedAuthor}
                  <button onClick={() => setSelectedAuthor(undefined)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {sortOrder !== "default" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {sortOrder === "views_desc" ? "Most Views" : "Fewest Views"}
                  <button onClick={() => setSortOrder("default")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs px-2 text-destructive hover:text-destructive">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Grid */}
        {newsList === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Search className="w-10 h-10 opacity-30" />
            <p className="font-medium">No articles found</p>
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
            {paginatedNews.map((news, index) => (
              <motion.div
                key={news._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-xl border overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">

                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {news.coverImage ? (
                    <>
                      <Image
                        src={news.coverImage}
                        alt={news.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+yHgAFWAJ/R8xlVwAAAABJRU5ErkJggg=="
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <CameraOff className="w-7 h-7 opacity-40" />
                      <span className="text-xs opacity-60">No image</span>
                    </div>
                  )}

                  {/* Image count badge */}
                  {news.images && news.images.length > 1 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      <Images className="w-3 h-3" />
                      {news.images.length}
                    </div>
                  )}

                  {/* Views */}
                  {news.coverImage && (
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-white/90 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      {news.views.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-4 gap-3">
                  <div className="space-y-1 flex-1">
                    <h2 className="font-semibold text-base leading-snug line-clamp-2">
                      {news.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {news.author}
                      </span>
                      {!news.coverImage && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {news.views.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                    <span
                      suppressHydrationWarning
                      title={dayjs(news._creationTime).format("MMM DD, YYYY h:mm a")}>
                      {dayjs(news._creationTime).fromNow()}
                    </span>
                    {news.updatedOn && (
                      <span
                        suppressHydrationWarning
                        className="text-[11px]"
                        title={dayjs(news.updatedOn).format("MMM DD, YYYY h:mm a")}>
                        edited {dayjs(news.updatedOn).fromNow()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <DeleteNews id={news._id} title={news.title} />
                    {news.slug && <UpdateNews slug={news.slug} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
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
                    className={currentPage === totalPages ? "opacity-40 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
