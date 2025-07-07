"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DataStatusIndicator, type DataStatus } from "@/components/ui/data-status-indicator";

interface Profession {
    id: string;
    name: string;
    name_en: string;
    description: string;
    is_active: boolean;
    created_at: string;
}

interface ProfessionFormData {
    name: string;
    nameEn: string;
    description: string;
    isActive: boolean;
}

const initialFormData: ProfessionFormData = {
    name: "",
    nameEn: "",
    description: "",
    isActive: true,
};

export default function ProfessionsManager() {
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfession, setEditingProfession] =
        useState<Profession | null>(null);
    const [formData, setFormData] =
        useState<ProfessionFormData>(initialFormData);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        profession: Profession | null;
    }>({
        isOpen: false,
        profession: null,
    });
    const { showToast, ToastComponent } = useToast();

    // Refs for tracking ongoing requests to prevent race conditions
    const abortControllerRef = useRef<AbortController | null>(null);

    const limit = 10;

    // Fetch professions data with caching
    const fetchProfessions = useCallback(
        async (forceRefresh = false) => {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm,
                status: selectedStatus,
            };

            const cacheKey = generateCacheKey("professions", params);

            // Check cache first
            if (!forceRefresh) {
                const cachedData = adminCache.get<{
                    professions: Profession[];
                    pagination: any;
                }>(cacheKey);
                if (cachedData) {
                    setProfessions(cachedData.professions);
                    setTotalPages(cachedData.pagination?.totalPages || 1);
                    setLoading(false);

                    // Schedule background refresh if stale
                    if (adminCache.isStale(cacheKey)) {
                        setBackgroundLoading(true);
                        setTimeout(() => fetchProfessions(true), 100);
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

                if (!forceRefresh) setLoading(true);

                const urlParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value) urlParams.append(key, value.toString());
                });

                const response = await fetch(
                    `/api/admin/professions?${urlParams}`,
                    {
                        signal: abortControllerRef.current.signal,
                    }
                );
                const data = await response.json();

                if (response.ok && data.success) {
                    setProfessions(data.professions);
                    setTotalPages(data.pagination?.totalPages || 1);

                    // Cache the result
                    adminCache.set(cacheKey, {
                        professions: data.professions,
                        pagination: data.pagination,
                    });
                } else {
                    showToast(
                        data.error || "Błąd podczas pobierania zawodów",
                        "error"
                    );
                }
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    showToast("Błąd połączenia z serwerem", "error");
                }
            } finally {
                setLoading(false);
                setBackgroundLoading(false);
            }
        },
        [currentPage, searchTerm, selectedStatus, showToast]
    );

    // Debounced effect for data fetching
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProfessions();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [fetchProfessions]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.nameEn) {
            showToast(
                "Wypełnij wymagane pola: nazwa polska i angielska",
                "error"
            );
            return;
        }

        try {
            const url = "/api/admin/professions";
            const method = editingProfession ? "PUT" : "POST";
            const payload = editingProfession
                ? { ...formData, id: editingProfession.id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    editingProfession
                        ? "Zawód został zaktualizowany"
                        : "Zawód został utworzony",
                    "success"
                );
                setIsModalOpen(false);
                setEditingProfession(null);
                setFormData(initialFormData);

                // Invalidate cache and refresh data
                adminCache.invalidate("professions");
                fetchProfessions(true);
            } else {
                showToast(data.error || "Błąd podczas zapisywania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Handle delete
    const handleDelete = async (profession: Profession) => {
        try {
            const response = await fetch(
                `/api/admin/professions?id=${profession.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok) {
                showToast("Zawód został usunięty", "success");

                // Invalidate cache and refresh data
                adminCache.invalidate("professions");
                fetchProfessions(true);
            } else {
                showToast(data.error || "Błąd podczas usuwania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Open edit modal
    const openEditModal = (profession: Profession) => {
        setEditingProfession(profession);
        setFormData({
            name: profession.name,
            nameEn: profession.name_en,
            description: profession.description,
            isActive: profession.is_active,
        });
        setIsModalOpen(true);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingProfession(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">
                        Zawody
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Zarządzaj kategoriami zawodowymi
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
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Szukaj</Label>
                    <Input
                        id="search"
                        placeholder="Szukaj po nazwie zawodu..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="min-w-[150px]">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md text-neutral-100 focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    >
                        <option value="">Wszystkie</option>
                        <option value="active">Aktywne</option>
                        <option value="inactive">Nieaktywne</option>
                    </select>
                </div>

                <Button onClick={openAddModal}>Dodaj zawód</Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie...
                </div>
            ) : professions.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                    Brak zawodów
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Nazwa (PL)</TableHeaderCell>
                            <TableHeaderCell>Nazwa (EN)</TableHeaderCell>
                            <TableHeaderCell>Opis</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Utworzony</TableHeaderCell>
                            <TableHeaderCell>Akcje</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {professions.map((profession) => (
                            <TableRow key={profession.id}>
                                <TableCell className="font-medium">
                                    {profession.name}
                                </TableCell>
                                <TableCell className="text-neutral-300">
                                    {profession.name_en}
                                </TableCell>
                                <TableCell className="max-w-xs">
                                    <div
                                        className="truncate"
                                        title={profession.description}
                                    >
                                        {profession.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            profession.is_active
                                                ? "bg-green-600 text-white"
                                                : "bg-red-600 text-white"
                                        }`}
                                    >
                                        {profession.is_active
                                            ? "Aktywny"
                                            : "Nieaktywny"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {new Date(
                                        profession.created_at
                                    ).toLocaleDateString("pl-PL")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                openEditModal(profession)
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
                                                    profession,
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
                    setEditingProfession(null);
                    setFormData(initialFormData);
                }}
                title={editingProfession ? "Edytuj zawód" : "Dodaj zawód"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nazwa (polski) *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="nameEn">Nazwa (angielski) *</Label>
                        <Input
                            id="nameEn"
                            value={formData.nameEn}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    nameEn: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Opis</Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-md text-neutral-100 focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-vertical"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isActive: e.target.checked,
                                })
                            }
                            className="w-4 h-4 text-amber-200 bg-neutral-800 border-neutral-600 rounded focus:ring-amber-300 focus:ring-2"
                        />
                        <Label htmlFor="isActive">Zawód aktywny</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingProfession(null);
                                setFormData(initialFormData);
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button type="submit">
                            {editingProfession ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() =>
                    setDeleteConfirm({ isOpen: false, profession: null })
                }
                onConfirm={() => {
                    if (deleteConfirm.profession) {
                        handleDelete(deleteConfirm.profession);
                    }
                    setDeleteConfirm({ isOpen: false, profession: null });
                }}
                title="Potwierdź usunięcie"
                message={`Czy na pewno chcesz usunąć zawód "${deleteConfirm.profession?.name}"? Ta akcja jest nieodwracalna.`}
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="destructive"
            />
        </div>
    );
}
