"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { adminCache, generateCacheKey } from "@/lib/admin-cache";
import {
    DataStatusIndicator,
    type DataStatus,
} from "@/components/ui/data-status-indicator";

interface Profession {
    id: string;
    name: string;
    name_en: string;
}

interface VocabularyCategory {
    id: string;
    name: string;
    name_en: string;
    description?: string;
    profession_id: string;
    order_index: number;
    created_at: string;
    profession: Profession;
    _count?: { vocabulary: number };
}

interface VocabularyEntry {
    id: string;
    category_id: string;
    term_en: string;
    term_pl: string;
    definition_en?: string;
    definition_pl?: string;
    pronunciation?: string;
    audio_url?: string;
    image_url?: string;
    example_sentence_en?: string;
    example_sentence_pl?: string;
    difficulty_level: number;
    created_at: string;
    updated_at: string;
    category: VocabularyCategory;
}

interface VocabularyFormData {
    category_id: string;
    term_en: string;
    term_pl: string;
    definition_en: string;
    definition_pl: string;
    pronunciation: string;
    audio_url: string;
    image_url: string;
    example_sentence_en: string;
    example_sentence_pl: string;
    difficulty_level: number;
}

interface CategoryFormData {
    name: string;
    nameEn: string;
    description: string;
    professionId: string;
    orderIndex: number;
}

const initialVocabularyFormData: VocabularyFormData = {
    category_id: "",
    term_en: "",
    term_pl: "",
    definition_en: "",
    definition_pl: "",
    pronunciation: "",
    audio_url: "",
    image_url: "",
    example_sentence_en: "",
    example_sentence_pl: "",
    difficulty_level: 1,
};

const initialCategoryFormData: CategoryFormData = {
    name: "",
    nameEn: "",
    description: "",
    professionId: "",
    orderIndex: 1,
};

export default function VocabularyManager() {
    const [activeTab, setActiveTab] = useState<"vocabulary" | "categories">(
        "vocabulary"
    );
    const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
    const [categories, setCategories] = useState<VocabularyCategory[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedProfession, setSelectedProfession] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<VocabularyEntry | null>(
        null
    );
    const [editingCategory, setEditingCategory] =
        useState<VocabularyCategory | null>(null);
    const [formData, setFormData] = useState<VocabularyFormData>(
        initialVocabularyFormData
    );
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(
        initialCategoryFormData
    );
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        entry: VocabularyEntry | null;
        category: VocabularyCategory | null;
    }>({
        isOpen: false,
        entry: null,
        category: null,
    });
    const { showToast, ToastComponent } = useToast();

    // Refs for tracking ongoing requests to prevent race conditions
    const abortControllerRef = useRef<AbortController | null>(null);
    const backgroundRefreshRef = useRef<{
        vocabulary: NodeJS.Timeout | null;
        categories: NodeJS.Timeout | null;
        professions: NodeJS.Timeout | null;
    }>({
        vocabulary: null,
        categories: null,
        professions: null,
    });

    const [perPage, setPerPage] = useState<number>(10);
    const limit = perPage;

    // Fetch vocabulary data with caching
    const fetchVocabulary = useCallback(
        async (forceRefresh = false) => {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm,
                categoryId: selectedCategory,
                professionId: selectedProfession,
                difficultyLevel: selectedDifficulty,
                sortBy,
                sortOrder,
            };

            const cacheKey = generateCacheKey("vocabulary", params);

            // Check cache first
            if (!forceRefresh) {
                const cachedData = adminCache.get<{
                    vocabulary: VocabularyEntry[];
                    pagination: any;
                }>(cacheKey);
                if (cachedData) {
                    setVocabulary(cachedData.vocabulary);
                    setTotalPages(cachedData.pagination.totalPages);
                    setLoading(false);

                    // Schedule background refresh if stale
                    if (adminCache.isStale(cacheKey)) {
                        setBackgroundLoading(true);
                        backgroundRefreshRef.current.vocabulary = setTimeout(
                            () => fetchVocabulary(true),
                            100
                        );
                    }
                    return;
                }
            }

            try {
                // Cancel previous request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                // Clear any pending background refresh
                if (backgroundRefreshRef.current.vocabulary) {
                    clearTimeout(backgroundRefreshRef.current.vocabulary);
                    backgroundRefreshRef.current.vocabulary = null;
                }

                if (!forceRefresh) setLoading(true);
                else setBackgroundLoading(true);
                setHasError(false);

                const urlParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value) urlParams.append(key, value.toString());
                });

                // For manual refresh, ensure minimum visual feedback time
                const fetchPromise = fetch(
                    `/api/admin/vocabulary?${urlParams}`,
                    {
                        signal: abortControllerRef.current.signal,
                    }
                );
                const minTimePromise = forceRefresh
                    ? new Promise((resolve) => setTimeout(resolve, 1500))
                    : Promise.resolve();

                const [response] = await Promise.all([
                    fetchPromise,
                    minTimePromise,
                ]);
                const data = await response.json();

                if (response.ok) {
                    setVocabulary(data.vocabulary);
                    setTotalPages(data.pagination.totalPages);
                    setHasError(false);

                    // Cache the result
                    adminCache.set(cacheKey, {
                        vocabulary: data.vocabulary,
                        pagination: data.pagination,
                    });
                } else {
                    setHasError(true);
                    showToast(
                        data.error || "Błąd podczas pobierania słownictwa",
                        "error"
                    );
                }
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    setHasError(true);
                    showToast("Błąd połączenia z serwerem", "error");
                }
            } finally {
                setLoading(false);
                setBackgroundLoading(false);
            }
        },
        [
            currentPage,
            searchTerm,
            selectedCategory,
            selectedProfession,
            selectedDifficulty,
            sortBy,
            sortOrder,
            limit,
            showToast,
        ]
    );

    // Fetch categories with caching
    const fetchCategories = useCallback(
        async (forceRefresh = false) => {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm,
                professionId: selectedProfession,
                sortBy,
                sortOrder,
            };

            const cacheKey = generateCacheKey("categories", params);

            // Check cache first
            if (!forceRefresh) {
                const cachedData = adminCache.get<{
                    categories: VocabularyCategory[];
                    pagination: any;
                }>(cacheKey);
                if (cachedData) {
                    setCategories(cachedData.categories);
                    if (activeTab === "categories") {
                        setTotalPages(cachedData.pagination.totalPages);
                    }
                    setLoading(false);

                    // Schedule background refresh if stale
                    if (adminCache.isStale(cacheKey)) {
                        setBackgroundLoading(true);
                        backgroundRefreshRef.current.categories = setTimeout(
                            () => fetchCategories(true),
                            100
                        );
                    }
                    return;
                }
            }

            try {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                // Clear any pending background refresh
                if (backgroundRefreshRef.current.categories) {
                    clearTimeout(backgroundRefreshRef.current.categories);
                    backgroundRefreshRef.current.categories = null;
                }

                if (!forceRefresh) setLoading(true);
                else setBackgroundLoading(true);
                setHasError(false);

                const urlParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value) urlParams.append(key, value.toString());
                });

                // For manual refresh, ensure minimum visual feedback time
                const fetchPromise = fetch(
                    `/api/admin/vocabulary-categories?${urlParams}`,
                    { signal: abortControllerRef.current.signal }
                );
                const minTimePromise = forceRefresh
                    ? new Promise((resolve) => setTimeout(resolve, 1500))
                    : Promise.resolve();

                const [response] = await Promise.all([
                    fetchPromise,
                    minTimePromise,
                ]);
                const data = await response.json();

                if (response.ok) {
                    setCategories(data.categories);
                    if (activeTab === "categories") {
                        setTotalPages(data.pagination.totalPages);
                    }
                    setHasError(false);

                    // Cache the result
                    adminCache.set(cacheKey, {
                        categories: data.categories,
                        pagination: data.pagination,
                    });
                } else {
                    setHasError(true);
                    showToast("Błąd podczas pobierania kategorii", "error");
                }
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    setHasError(true);
                    showToast("Błąd połączenia z serwerem", "error");
                }
            } finally {
                setLoading(false);
                setBackgroundLoading(false);
            }
        },
        [
            currentPage,
            searchTerm,
            selectedProfession,
            sortBy,
            sortOrder,
            activeTab,
            showToast,
        ]
    );

    // Helper to toggle sorting on a column
    const toggleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    // Fetch professions with caching
    const fetchProfessions = useCallback(
        async (forceRefresh = false) => {
            const cacheKey = "professions_all";

            // Check cache first
            if (!forceRefresh) {
                const cachedData = adminCache.get<Profession[]>(cacheKey);
                if (cachedData) {
                    setProfessions(cachedData);

                    // Schedule background refresh if stale
                    if (adminCache.isStale(cacheKey)) {
                        backgroundRefreshRef.current.professions = setTimeout(
                            () => fetchProfessions(true),
                            100
                        );
                    }
                    return;
                }
            }

            try {
                // Clear any pending background refresh
                if (backgroundRefreshRef.current.professions) {
                    clearTimeout(backgroundRefreshRef.current.professions);
                    backgroundRefreshRef.current.professions = null;
                }

                const response = await fetch("/api/admin/professions");
                const data = await response.json();

                if (response.ok) {
                    setProfessions(data.professions);

                    // Cache the result
                    adminCache.set(cacheKey, data.professions);
                } else {
                    showToast("Błąd podczas pobierania zawodów", "error");
                }
            } catch (error) {
                showToast("Błąd połączenia z serwerem", "error");
            }
        },
        [showToast]
    );

    // Debounced effect for data fetching with cache-aware loading
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (activeTab === "vocabulary") {
                fetchVocabulary();
            } else {
                fetchCategories();
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [activeTab, fetchVocabulary, fetchCategories]);

    // Load initial data only once
    useEffect(() => {
        fetchCategories();
        fetchProfessions();
    }, [fetchCategories, fetchProfessions]);

    // Optimized tab switching with preloading
    const handleTabSwitch = useCallback(
        (tab: "vocabulary" | "categories") => {
            setActiveTab(tab);
            setCurrentPage(1);
            setSearchTerm("");
            setSelectedCategory("");
            setSelectedProfession("");
            setSelectedDifficulty("");
            setSortBy(tab === "vocabulary" ? "created_at" : "order_index");
            setSortOrder("asc");

            // If switching to vocabulary, ensure categories are prefetched
            if (tab === "vocabulary" && categories.length === 0) {
                // background fetch without blocking UI
                fetchCategories(true);
            }
        },
        [categories.length, fetchCategories]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Clear all background refresh timeouts
            if (backgroundRefreshRef.current.vocabulary) {
                clearTimeout(backgroundRefreshRef.current.vocabulary);
            }
            if (backgroundRefreshRef.current.categories) {
                clearTimeout(backgroundRefreshRef.current.categories);
            }
            if (backgroundRefreshRef.current.professions) {
                clearTimeout(backgroundRefreshRef.current.professions);
            }
        };
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_id || !formData.term_en || !formData.term_pl) {
            showToast(
                "Wypełnij wymagane pola: kategoria, termin angielski, termin polski",
                "error"
            );
            return;
        }

        try {
            const url = "/api/admin/vocabulary";
            const method = editingEntry ? "PUT" : "POST";
            const payload = editingEntry
                ? { ...formData, id: editingEntry.id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    editingEntry
                        ? "Wpis słownictwa został zaktualizowany"
                        : "Wpis słownictwa został utworzony",
                    "success"
                );
                setIsModalOpen(false);
                setEditingEntry(null);
                setFormData(initialVocabularyFormData);

                // Invalidate vocabulary and stats cache
                adminCache.invalidate("vocabulary");
                adminCache.invalidate("admin-stats");
                // Refresh data
                fetchVocabulary(true);
            } else {
                showToast(data.error || "Błąd podczas zapisywania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Handle delete
    const handleDelete = async (entry: VocabularyEntry) => {
        try {
            const response = await fetch(
                `/api/admin/vocabulary?id=${entry.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok) {
                showToast("Wpis słownictwa został usunięty", "success");

                // Invalidate vocabulary and stats cache
                adminCache.invalidate("vocabulary");
                adminCache.invalidate("admin-stats");
                // Refresh data
                fetchVocabulary(true);
            } else {
                showToast(data.error || "Błąd podczas usuwania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Category management functions
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !categoryFormData.name ||
            !categoryFormData.nameEn ||
            !categoryFormData.professionId
        ) {
            showToast(
                "Wypełnij wymagane pola: nazwa, nazwa angielska, zawód",
                "error"
            );
            return;
        }

        try {
            const url = "/api/admin/vocabulary-categories";
            const method = editingCategory ? "PUT" : "POST";
            const payload = editingCategory
                ? {
                      id: editingCategory.id,
                      name: categoryFormData.name,
                      nameEn: categoryFormData.nameEn,
                      description: categoryFormData.description,
                      professionId: categoryFormData.professionId,
                      orderIndex: categoryFormData.orderIndex,
                  }
                : {
                      name: categoryFormData.name,
                      nameEn: categoryFormData.nameEn,
                      description: categoryFormData.description,
                      professionId: categoryFormData.professionId,
                      orderIndex: categoryFormData.orderIndex,
                  };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    editingCategory
                        ? "Kategoria została zaktualizowana"
                        : "Kategoria została utworzona",
                    "success"
                );
                setIsModalOpen(false);
                setEditingCategory(null);
                setCategoryFormData(initialCategoryFormData);

                // Invalidate both categories, vocabulary, and stats cache
                adminCache.invalidate("categories");
                adminCache.invalidate("vocabulary");
                adminCache.invalidate("admin-stats");
                // Refresh data
                fetchCategories(true);
            } else {
                showToast(data.error || "Błąd podczas zapisywania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    const handleCategoryDelete = async (category: VocabularyCategory) => {
        try {
            const response = await fetch(
                `/api/admin/vocabulary-categories?id=${category.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok) {
                showToast("Kategoria została usunięta", "success");

                // Invalidate both categories, vocabulary, and stats cache
                adminCache.invalidate("categories");
                adminCache.invalidate("vocabulary");
                adminCache.invalidate("admin-stats");
                // Refresh data
                fetchCategories(true);
            } else {
                showToast(data.error || "Błąd podczas usuwania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Open edit modal
    const openEditModal = (entry: VocabularyEntry) => {
        setEditingEntry(entry);
        setFormData({
            category_id: entry.category_id,
            term_en: entry.term_en,
            term_pl: entry.term_pl,
            definition_en: entry.definition_en || "",
            definition_pl: entry.definition_pl || "",
            pronunciation: entry.pronunciation || "",
            audio_url: entry.audio_url || "",
            image_url: entry.image_url || "",
            example_sentence_en: entry.example_sentence_en || "",
            example_sentence_pl: entry.example_sentence_pl || "",
            difficulty_level: entry.difficulty_level,
        });
        setIsModalOpen(true);
        // Ensure categories are available when editing
        if (categories.length === 0) fetchCategories(true);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingEntry(null);
        setEditingCategory(null);
        setFormData(initialVocabularyFormData);
        setCategoryFormData(initialCategoryFormData);
        setIsModalOpen(true);
        // Prefetch categories so the select is ready
        if (categories.length === 0) fetchCategories(true);
    };

    // Category modal functions
    const openEditCategoryModal = (category: VocabularyCategory) => {
        setEditingCategory(category);
        setCategoryFormData({
            name: category.name,
            nameEn: category.name_en,
            description: category.description || "",
            professionId: category.profession_id,
            orderIndex: category.order_index,
        });
        setIsModalOpen(true);
    };

    const openAddCategoryModal = () => {
        setEditingEntry(null);
        setEditingCategory(null);
        setFormData(initialVocabularyFormData);
        setCategoryFormData(initialCategoryFormData);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">
                        Menedżer Słownictwa
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Zarządzaj słownictwem i kategoriami dla różnych zawodów
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <DataStatusIndicator
                        status={
                            hasError
                                ? "error"
                                : backgroundLoading
                                ? "refreshing"
                                : loading
                                ? "loading"
                                : "current"
                        }
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (activeTab === "vocabulary") {
                                fetchVocabulary(true);
                            } else {
                                fetchCategories(true);
                            }
                        }}
                        disabled={loading || backgroundLoading}
                        className="text-xs"
                    >
                        Odśwież
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-neutral-700">
                <button
                    onClick={() => handleTabSwitch("vocabulary")}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                        activeTab === "vocabulary"
                            ? "bg-amber-500 text-neutral-900 border-b-2 border-amber-500"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    }`}
                >
                    Słownictwo
                </button>
                <button
                    onClick={() => handleTabSwitch("categories")}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                        activeTab === "categories"
                            ? "bg-amber-500 text-neutral-900 border-b-2 border-amber-500"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    }`}
                >
                    Kategorie
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Szukaj</Label>
                    <Input
                        id="search"
                        placeholder={
                            activeTab === "vocabulary"
                                ? "Szukaj terminów, definicji..."
                                : "Szukaj nazw kategorii..."
                        }
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {activeTab === "vocabulary" && (
                    <>
                        <div className="min-w-[200px]">
                            <Label htmlFor="profession">Zawód</Label>
                            <Select
                                id="profession"
                                value={selectedProfession}
                                onChange={(e) => {
                                    setSelectedProfession(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Wszystkie zawody</option>
                                {professions.map((profession) => (
                                    <option
                                        key={profession.id}
                                        value={profession.id}
                                    >
                                        {profession.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="min-w-[200px]">
                            <Label htmlFor="category">Kategoria</Label>
                            <Select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Wszystkie kategorie</option>
                                {categories
                                    .filter(
                                        (category) =>
                                            !selectedProfession ||
                                            category.profession_id ===
                                                selectedProfession
                                    )
                                    .map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name} (
                                            {category.profession.name})
                                        </option>
                                    ))}
                            </Select>
                        </div>

                        <div className="min-w-[150px]">
                            <Label htmlFor="difficulty">Poziom</Label>
                            <Select
                                id="difficulty"
                                value={selectedDifficulty}
                                onChange={(e) => {
                                    setSelectedDifficulty(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Wszystkie poziomy</option>
                                <option value="1">Poziom 1</option>
                                <option value="2">Poziom 2</option>
                                <option value="3">Poziom 3</option>
                                <option value="4">Poziom 4</option>
                                <option value="5">Poziom 5</option>
                            </Select>
                        </div>
                    </>
                )}

                {activeTab === "categories" && (
                    <div className="min-w-[200px]">
                        <Label htmlFor="profession">Zawód</Label>
                        <Select
                            id="profession"
                            value={selectedProfession}
                            onChange={(e) => {
                                setSelectedProfession(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">Wszystkie zawody</option>
                            {professions.map((profession) => (
                                <option
                                    key={profession.id}
                                    value={profession.id}
                                >
                                    {profession.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                <div className="min-w-[150px]">
                    <Label htmlFor="per_page">Wpisów na stronę</Label>
                    <Select
                        id="per_page"
                        value={perPage.toString()}
                        onChange={(e) => {
                            setPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </Select>
                </div>

                <Button
                    onClick={
                        activeTab === "vocabulary"
                            ? openAddModal
                            : openAddCategoryModal
                    }
                >
                    {activeTab === "vocabulary"
                        ? "Dodaj słownictwo"
                        : "Dodaj kategorię"}
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie...
                </div>
            ) : activeTab === "vocabulary" ? (
                vocabulary.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                        Brak wpisów słownictwa
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>
                                    <button
                                        onClick={() => toggleSort("term_en")}
                                        className="flex items-center gap-2"
                                    >
                                        Termin EN
                                        {sortBy === "term_en" && (
                                            <span className="text-xs text-neutral-400">
                                                {sortOrder === "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <button
                                        onClick={() => toggleSort("term_pl")}
                                        className="flex items-center gap-2"
                                    >
                                        Termin PL
                                        {sortBy === "term_pl" && (
                                            <span className="text-xs text-neutral-400">
                                                {sortOrder === "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>Kategoria</TableHeaderCell>
                                <TableHeaderCell>
                                    <button
                                        onClick={() =>
                                            toggleSort("difficulty_level")
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        Poziom
                                        {sortBy === "difficulty_level" && (
                                            <span className="text-xs text-neutral-400">
                                                {sortOrder === "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <button
                                        onClick={() => toggleSort("created_at")}
                                        className="flex items-center gap-2"
                                    >
                                        Utworzono
                                        {sortBy === "created_at" && (
                                            <span className="text-xs text-neutral-400">
                                                {sortOrder === "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>Akcje</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vocabulary.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {entry.term_en}
                                        </div>
                                        {entry.pronunciation && (
                                            <div className="text-sm text-neutral-400">
                                                /{entry.pronunciation}/
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {entry.term_pl}
                                    </TableCell>
                                    <TableCell>
                                        <div>{entry.category.name}</div>
                                        <div className="text-sm text-neutral-400">
                                            {entry.category.profession.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-amber-200 text-neutral-900 rounded text-xs">
                                            Poziom {entry.difficulty_level}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-neutral-400">
                                        {new Date(
                                            entry.created_at
                                        ).toLocaleDateString("pl-PL")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    openEditModal(entry)
                                                }
                                            >
                                                Edytuj
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    setDeleteConfirm({
                                                        isOpen: true,
                                                        entry,
                                                        category: null,
                                                    })
                                                }
                                            >
                                                Usuń
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )
            ) : categories.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                    Brak kategorii słownictwa
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Nazwa</TableHeaderCell>
                            <TableHeaderCell>Nazwa EN</TableHeaderCell>
                            <TableHeaderCell>Zawód</TableHeaderCell>
                            <TableHeaderCell>Kolejność</TableHeaderCell>
                            <TableHeaderCell>Słownictwo</TableHeaderCell>
                            <TableHeaderCell>Utworzono</TableHeaderCell>
                            <TableHeaderCell>Akcje</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">
                                    {category.name}
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {category.name_en}
                                </TableCell>
                                <TableCell>
                                    <div>{category.profession.name}</div>
                                    <div className="text-sm text-neutral-400">
                                        {category.profession.name_en}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-blue-200 text-neutral-900 rounded text-xs">
                                        {category.order_index}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-green-200 text-neutral-900 rounded text-xs">
                                        {category._count?.vocabulary || 0}{" "}
                                        wpisów
                                    </span>
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {new Date(
                                        category.created_at
                                    ).toLocaleDateString("pl-PL")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                openEditCategoryModal(category)
                                            }
                                        >
                                            Edytuj
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                setDeleteConfirm({
                                                    isOpen: true,
                                                    entry: null,
                                                    category,
                                                })
                                            }
                                        >
                                            Usuń
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Poprzednia
                    </Button>
                    <span className="flex items-center px-4 text-neutral-300">
                        Strona {currentPage} z {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Następna
                    </Button>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                    setEditingCategory(null);
                    setFormData(initialVocabularyFormData);
                    setCategoryFormData(initialCategoryFormData);
                }}
                title={
                    activeTab === "vocabulary"
                        ? editingEntry
                            ? "Edytuj wpis słownictwa"
                            : "Dodaj wpis słownictwa"
                        : editingCategory
                        ? "Edytuj kategorię"
                        : "Dodaj kategorię"
                }
                size="lg"
            >
                {activeTab === "vocabulary" ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="category_id">Kategoria *</Label>
                            <Select
                                id="category_id"
                                value={formData.category_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category_id: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">Wybierz kategorię</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name} (
                                        {category.profession.name})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="term_en">
                                    Termin (angielski) *
                                </Label>
                                <Input
                                    id="term_en"
                                    value={formData.term_en}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            term_en: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="term_pl">
                                    Termin (polski) *
                                </Label>
                                <Input
                                    id="term_pl"
                                    value={formData.term_pl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            term_pl: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="pronunciation">Wymowa</Label>
                            <Input
                                id="pronunciation"
                                placeholder="np. /prəˌnʌnsiˈeɪʃən/"
                                value={formData.pronunciation}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        pronunciation: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="definition_en">
                                    Definicja (angielska)
                                </Label>
                                <Textarea
                                    id="definition_en"
                                    value={formData.definition_en}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            definition_en: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="definition_pl">
                                    Definicja (polska)
                                </Label>
                                <Textarea
                                    id="definition_pl"
                                    value={formData.definition_pl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            definition_pl: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="example_sentence_en">
                                    Przykład (angielski)
                                </Label>
                                <Textarea
                                    id="example_sentence_en"
                                    value={formData.example_sentence_en}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            example_sentence_en: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="example_sentence_pl">
                                    Przykład (polski)
                                </Label>
                                <Textarea
                                    id="example_sentence_pl"
                                    value={formData.example_sentence_pl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            example_sentence_pl: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="audio_url">URL Audio</Label>
                                <Input
                                    id="audio_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.audio_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            audio_url: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="image_url">URL Obrazu</Label>
                                <Input
                                    id="image_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            image_url: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="difficulty_level">
                                Poziom trudności
                            </Label>
                            <Select
                                id="difficulty_level"
                                value={formData.difficulty_level.toString()}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        difficulty_level: parseInt(
                                            e.target.value
                                        ),
                                    })
                                }
                            >
                                <option value="1">Poziom 1 (Podstawowy)</option>
                                <option value="2">Poziom 2 (Łatwy)</option>
                                <option value="3">Poziom 3 (Średni)</option>
                                <option value="4">Poziom 4 (Trudny)</option>
                                <option value="5">
                                    Poziom 5 (Bardzo trudny)
                                </option>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingEntry(null);
                                    setFormData(initialVocabularyFormData);
                                }}
                            >
                                Anuluj
                            </Button>
                            <Button type="submit">
                                {editingEntry ? "Zaktualizuj" : "Dodaj"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="profession_id">Zawód *</Label>
                            <Select
                                id="profession_id"
                                value={categoryFormData.professionId}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        professionId: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">Wybierz zawód</option>
                                {professions.map((profession) => (
                                    <option
                                        key={profession.id}
                                        value={profession.id}
                                    >
                                        {profession.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category_name">
                                    Nazwa (polska) *
                                </Label>
                                <Input
                                    id="category_name"
                                    value={categoryFormData.name}
                                    onChange={(e) =>
                                        setCategoryFormData({
                                            ...categoryFormData,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category_name_en">
                                    Nazwa (angielska) *
                                </Label>
                                <Input
                                    id="category_name_en"
                                    value={categoryFormData.nameEn}
                                    onChange={(e) =>
                                        setCategoryFormData({
                                            ...categoryFormData,
                                            nameEn: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="category_description">Opis</Label>
                            <Textarea
                                id="category_description"
                                value={categoryFormData.description}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Opcjonalny opis kategorii..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="order_index">Kolejność</Label>
                            <Input
                                id="order_index"
                                type="number"
                                min="1"
                                value={categoryFormData.orderIndex}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        orderIndex:
                                            parseInt(e.target.value) || 1,
                                    })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingCategory(null);
                                    setCategoryFormData(
                                        initialCategoryFormData
                                    );
                                }}
                            >
                                Anuluj
                            </Button>
                            <Button type="submit">
                                {editingCategory ? "Zaktualizuj" : "Dodaj"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() =>
                    setDeleteConfirm({
                        isOpen: false,
                        entry: null,
                        category: null,
                    })
                }
                onConfirm={() => {
                    if (deleteConfirm.entry) {
                        handleDelete(deleteConfirm.entry);
                    } else if (deleteConfirm.category) {
                        handleCategoryDelete(deleteConfirm.category);
                    }
                    setDeleteConfirm({
                        isOpen: false,
                        entry: null,
                        category: null,
                    });
                }}
                title="Potwierdź usunięcie"
                message={
                    deleteConfirm.entry
                        ? `Czy na pewno chcesz usunąć wpis "${deleteConfirm.entry.term_en}" z słownictwa? Ta akcja jest nieodwracalna.`
                        : deleteConfirm.category
                        ? `Czy na pewno chcesz usunąć kategorię "${deleteConfirm.category.name}"? Ta akcja jest nieodwracalna i usunie również wszystkie wpisy słownictwa w tej kategorii.`
                        : ""
                }
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="destructive"
            />
        </div>
    );
}
