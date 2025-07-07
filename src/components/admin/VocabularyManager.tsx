"use client";

import React, { useState, useEffect } from "react";
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

interface VocabularyCategory {
    id: string;
    name: string;
    name_en: string;
    profession: {
        id: string;
        name: string;
        name_en: string;
    };
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

const initialFormData: VocabularyFormData = {
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

export default function VocabularyManager() {
    const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
    const [categories, setCategories] = useState<VocabularyCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<VocabularyEntry | null>(
        null
    );
    const [formData, setFormData] =
        useState<VocabularyFormData>(initialFormData);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        entry: VocabularyEntry | null;
    }>({
        isOpen: false,
        entry: null,
    });
    const { showToast, ToastComponent } = useToast();

    const limit = 10;

    // Fetch vocabulary data
    const fetchVocabulary = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory && { categoryId: selectedCategory }),
                ...(selectedDifficulty && {
                    difficultyLevel: selectedDifficulty,
                }),
            });

            const response = await fetch(`/api/admin/vocabulary?${params}`);
            const data = await response.json();

            if (response.ok) {
                setVocabulary(data.vocabulary);
                setTotalPages(data.pagination.totalPages);
            } else {
                showToast(
                    data.error || "Błąd podczas pobierania słownictwa",
                    "error"
                );
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/vocabulary-categories");
            const data = await response.json();

            if (response.ok) {
                setCategories(data.categories);
            } else {
                showToast("Błąd podczas pobierania kategorii", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    useEffect(() => {
        fetchVocabulary();
    }, [currentPage, searchTerm, selectedCategory, selectedDifficulty]);

    useEffect(() => {
        fetchCategories();
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
                setFormData(initialFormData);
                fetchVocabulary();
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
                fetchVocabulary();
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
    };

    // Open add modal
    const openAddModal = () => {
        setEditingEntry(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div>
                <h2 className="text-2xl font-bold text-neutral-100">
                    Menedżer Słownictwa
                </h2>
                <p className="text-neutral-400 mt-2">
                    Zarządzaj słownictwem dla różnych zawodów
                </p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Szukaj</Label>
                    <Input
                        id="search"
                        placeholder="Szukaj terminów, definicji..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
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
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name} ({category.profession.name})
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

                <Button onClick={openAddModal}>Dodaj słownictwo</Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie...
                </div>
            ) : vocabulary.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                    Brak wpisów słownictwa
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Termin EN</TableHeaderCell>
                            <TableHeaderCell>Termin PL</TableHeaderCell>
                            <TableHeaderCell>Kategoria</TableHeaderCell>
                            <TableHeaderCell>Poziom</TableHeaderCell>
                            <TableHeaderCell>Utworzono</TableHeaderCell>
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
                                            onClick={() => openEditModal(entry)}
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
                    setFormData(initialFormData);
                }}
                title={
                    editingEntry
                        ? "Edytuj wpis słownictwa"
                        : "Dodaj wpis słownictwa"
                }
                size="lg"
            >
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
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category.profession.name})
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
                            <Label htmlFor="term_pl">Termin (polski) *</Label>
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
                                    difficulty_level: parseInt(e.target.value),
                                })
                            }
                        >
                            <option value="1">Poziom 1 (Podstawowy)</option>
                            <option value="2">Poziom 2 (Łatwy)</option>
                            <option value="3">Poziom 3 (Średni)</option>
                            <option value="4">Poziom 4 (Trudny)</option>
                            <option value="5">Poziom 5 (Bardzo trudny)</option>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingEntry(null);
                                setFormData(initialFormData);
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button type="submit">
                            {editingEntry ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, entry: null })}
                onConfirm={() => {
                    if (deleteConfirm.entry) {
                        handleDelete(deleteConfirm.entry);
                    }
                    setDeleteConfirm({ isOpen: false, entry: null });
                }}
                title="Potwierdź usunięcie"
                message={`Czy na pewno chcesz usunąć wpis "${deleteConfirm.entry?.term_en}" z słownictwa? Ta akcja jest nieodwracalna.`}
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="destructive"
            />
        </div>
    );
}
