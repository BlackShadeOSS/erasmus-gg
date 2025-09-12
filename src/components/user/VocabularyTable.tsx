"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";

type VocabularyItem = {
  id: string;
  term_en: string;
  term_pl: string;
  definition_en?: string | null;
  definition_pl?: string | null;
  difficulty_level: number;
  level_name: string;
  category?: { id: string; name: string; name_en?: string } | null;
  mastery_level?: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type VocabResponse =
  | { success: true; items: VocabularyItem[]; pagination: Pagination }
  | { error: string };

type Category = { id: string; name: string; name_en?: string };

export default function VocabularyTable() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Filters / sorting
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);
  const [sortKey, setSortKey] = useState<keyof VocabularyItem>("term_en");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const page = pagination.page;

  const toggleSort = (key: keyof VocabularyItem) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    // Load categories for current profession
    fetch(`/api/user/vocabulary/categories`)
      .then(async (r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return { items: [] };
        }
        return r.json();
      })
      .then((data) => {
        if ((data as any)?.items)
          setCategories((data as any).items as Category[]);
      })
      .catch(() => {});
    // no finally needed
  }, []);

  const fetchVocab = async (nextPage = 1) => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (categoryId) params.set("categoryId", categoryId);
      if (level) params.set("level", level);

      const res = await fetch(`/api/user/vocabulary?${params.toString()}`);
      if (res.status === 401) {
        setUnauthorized(true);
        setItems([]);
        setPagination({ page: nextPage, limit, total: 0, totalPages: 0 });
        return;
      }
      const data: VocabResponse = await res.json();
      if ("error" in data) {
        setError(data.error || "Błąd ładowania danych");
        setItems([]);
        setPagination({ page: nextPage, limit, total: 0, totalPages: 0 });
      } else {
        setItems(data.items);
        setPagination(data.pagination);
      }
    } catch (e) {
      setError("Nie udało się pobrać słownictwa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchVocab(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch when filters or limit change
  useEffect(() => {
    fetchVocab(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, level, limit]);

  // client-side sorting
  const sortedItems = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      let cmp = 0;
      if (typeof va === "string" && typeof vb === "string") {
        cmp = va.localeCompare(vb);
      } else {
        cmp = (va ?? 0) < (vb ?? 0) ? -1 : (va ?? 0) > (vb ?? 0) ? 1 : 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVocab(1);
  };

  const canPrev = page > 1;
  const canNext = pagination.totalPages > 0 && page < pagination.totalPages;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <label className="block text-sm text-neutral-300 mb-1">Szukaj</label>
          <div className="flex gap-2">
            <Input
              placeholder="Szukaj słówek (ang/pl)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
              Szukaj
            </Button>
          </div>
        </form>

        <div className="min-w-[200px]">
          <label className="block text-sm text-neutral-300 mb-1">
            Kategoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2"
          >
            <option value="">Wszystkie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px]">
          <label className="block text-sm text-neutral-300 mb-1">Poziom</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2"
          >
            <option value="">Wszystkie</option>
            <option value="1">A1</option>
            <option value="2">A2</option>
            <option value="3">B1</option>
            <option value="4">B2</option>
            <option value="5">C1</option>
          </select>
        </div>

        <div className="min-w-[120px]">
          <label className="block text-sm text-neutral-300 mb-1">
            Na stronie
          </label>
          <select
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="min-w-[120px]">
          <label className="block text-sm text-neutral-300 mb-1">&nbsp;</label>
          <Button
            variant="secondary"
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100"
            onClick={() => {
              setSearch("");
              setCategoryId("");
              setLevel("");
              setLimit(20);
              fetchVocab(1);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {unauthorized ? (
        <div className="p-4 border border-red-800 bg-red-900/20 text-red-200 rounded-md">
          Musisz być zalogowany.{" "}
          <a className="underline" href="/login">
            Zaloguj się
          </a>
          .
        </div>
      ) : error ? (
        <div className="p-4 border border-red-800 bg-red-900/20 text-red-200 rounded-md">
          {error}
        </div>
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>
                  <button onClick={() => toggleSort("term_en")}>
                    Słówko (EN){" "}
                    {sortKey === "term_en"
                      ? sortDir === "asc"
                        ? "▲"
                        : "▼"
                      : null}
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button onClick={() => toggleSort("term_pl")}>
                    Słówko (PL){" "}
                    {sortKey === "term_pl"
                      ? sortDir === "asc"
                        ? "▲"
                        : "▼"
                      : null}
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button onClick={() => toggleSort("difficulty_level")}>
                    Poziom{" "}
                    {sortKey === "difficulty_level"
                      ? sortDir === "asc"
                        ? "▲"
                        : "▼"
                      : null}
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>Kategoria</TableHeaderCell>
                <TableHeaderCell>
                  <button onClick={() => toggleSort("mastery_level")}>
                    Opanowanie{" "}
                    {sortKey === "mastery_level"
                      ? sortDir === "asc"
                        ? "▲"
                        : "▼"
                      : null}
                  </button>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="py-8 text-center" colSpan={5}>
                    Ładowanie...
                  </TableCell>
                </TableRow>
              ) : sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell className="py-8 text-center" colSpan={5}>
                    Brak wyników
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-neutral-100">
                      {v.term_en}
                    </TableCell>
                    <TableCell>{v.term_pl}</TableCell>
                    <TableCell>{v.level_name || v.difficulty_level}</TableCell>
                    <TableCell>
                      {v.category?.name || v.category?.name_en || "-"}
                    </TableCell>
                    <TableCell>
                      {typeof v.mastery_level === "number"
                        ? v.mastery_level
                        : 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between text-neutral-300">
            <div>
              Strona {pagination.page} z {Math.max(1, pagination.totalPages)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-neutral-800 hover:bg-neutral-700"
                disabled={!canPrev || loading}
                onClick={() => fetchVocab(page - 1)}
              >
                Poprzednia
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                disabled={!canNext || loading}
                onClick={() => fetchVocab(page + 1)}
              >
                Następna
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
