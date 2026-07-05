"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ContentCard from "@/components/ContentCard";
import type { ContentItem } from "@/components/ContentCard";
import CreateRoomModal from "@/components/CreateRoomModal";
import UsernameModal from "@/components/UsernameModal";
import { getUsername, getSessionId } from "@/lib/session";

type Tab = "series" | "movies" | "animes";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [tab, setTab] = useState<Tab>("series");
  const [browseItems, setBrowseItems] = useState<ContentItem[]>([]);
  const [searchItems, setSearchItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [pendingItem, setPendingItem] = useState<ContentItem | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const name = getUsername();
    getSessionId();
    setUsername(name || null);
  }, []);

  const fetchBrowse = useCallback(async (type: Tab, p: number) => {
    setLoadingBrowse(true);
    try {
      const res = await fetch(`/api/listing/${type}?page=${p}`);
      const json = await res.json();
      const contentType = type === "movies" ? "movie" : type === "series" ? "serie" : "anime";
      const raw = json.data?.result ?? [];
      setBrowseItems(raw.map((item: ContentItem) => ({ ...item, content_type: contentType })));
      setTotalPages(json.data?.pages ?? 1);
    } finally {
      setLoadingBrowse(false);
    }
  }, []);

  useEffect(() => {
    fetchBrowse(tab, page);
  }, [tab, page, fetchBrowse]);

  // Debounced TMDB search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = search.trim();
    if (!q) { setSearchItems([]); return; }

    setLoadingSearch(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setSearchItems(json.results ?? []);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);

    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const isSearching = search.trim().length > 0;
  const displayItems = isSearching ? searchItems : browseItems;
  const loading = isSearching ? loadingSearch : loadingBrowse;

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(1);
    setSearch("");
  };

  const handleItemClick = (item: ContentItem) => {
    if (!username) {
      setPendingItem(item);
      setShowUsernameModal(true);
    } else {
      setSelectedItem(item);
    }
  };

  const handleUsernameSet = (name: string) => {
    setUsername(name);
    setShowUsernameModal(false);
    if (pendingItem) {
      setSelectedItem(pendingItem);
      setPendingItem(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "series", label: "Series" },
    { key: "movies", label: "Películas" },
    { key: "animes", label: "Anime" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {showUsernameModal && <UsernameModal onDone={handleUsernameSet} />}

      {selectedItem && username && (
        <CreateRoomModal
          item={selectedItem}
          username={username}
          onClose={() => setSelectedItem(null)}
          onCreated={(id) => router.push(`/room/${id}`)}
        />
      )}

      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-xl">▶</span>
          <span className="font-bold text-white text-lg tracking-tight">CineSync</span>
        </div>
        {username ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            {username}
          </div>
        ) : (
          <button
            onClick={() => setShowUsernameModal(true)}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            Establecer nombre
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Explorar contenido</h1>
          <p className="text-zinc-400 text-sm">
            Selecciona qué quieres ver y crea una sala para tus amigos
          </p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isSearching && (
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    tab === t.key
                      ? "bg-violet-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className="relative sm:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar series, películas, anime..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {isSearching && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition text-sm"
              >
                ✕
              </button>
            )}
          </div>
          {isSearching && (
            <span className="text-zinc-400 text-sm self-center">
              {loadingSearch ? "Buscando..." : `${searchItems.length} resultados para "${search}"`}
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            {isSearching
              ? `Sin resultados para "${search}"`
              : "No hay contenido disponible"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayItems.map((item) => (
              <ContentCard key={`${item.content_type}-${item.tmdb_id}`} item={item} onClick={handleItemClick} />
            ))}
          </div>
        )}

        {/* Pagination — solo en modo browse */}
        {!isSearching && !loadingBrowse && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
            >
              ← Anterior
            </button>
            <span className="text-zinc-400 text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
