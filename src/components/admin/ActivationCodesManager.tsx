"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/form";
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

interface ActivationCode {
    id: string;
    code: string;
    description: string;
    max_uses: number;
    used_count: number;
    status: string;
    expires_at: string;
    created_at: string;
}

interface ActivationCodeFormData {
    description: string;
    maxUses: number;
    expiresAt: string;
    status: string;
}

const initialFormData: ActivationCodeFormData = {
    description: "",
    maxUses: 1,
    expiresAt: "",
    status: "active",
};

export default function ActivationCodesManager() {
    const [codes, setCodes] = useState<ActivationCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<ActivationCode | null>(null);
    const [formData, setFormData] =
        useState<ActivationCodeFormData>(initialFormData);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        code: ActivationCode | null;
    }>({
        isOpen: false,
        code: null,
    });
    const { showToast, ToastComponent } = useToast();

    const limit = 10;

    // Fetch activation codes data
    const fetchCodes = async () => {
        try {
            setLoading(true);
            setHasError(false);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedStatus && { status: selectedStatus }),
            });

            const response = await fetch(
                `/api/admin/activation-codes?${params}`
            );
            const data = await response.json();

            if (response.ok && data.success) {
                setCodes(data.codes);
                setTotalPages(data.pagination?.totalPages || 1);
                setHasError(false);
            } else {
                setHasError(true);
                showToast(
                    data.error || "Błąd podczas pobierania kodów aktywacyjnych",
                    "error"
                );
            }
        } catch (error) {
            setHasError(true);
            showToast("Błąd połączenia z serwerem", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, [currentPage, searchTerm, selectedStatus]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description) {
            showToast("Opis jest wymagany", "error");
            return;
        }

        try {
            const url = "/api/admin/activation-codes";
            const method = editingCode ? "PUT" : "POST";
            const payload = editingCode
                ? { ...formData, id: editingCode.id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    editingCode
                        ? "Kod aktywacyjny został zaktualizowany"
                        : "Kod aktywacyjny został utworzony",
                    "success"
                );
                setIsModalOpen(false);
                setEditingCode(null);
                setFormData(initialFormData);
                fetchCodes();
            } else {
                showToast(data.error || "Błąd podczas zapisywania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Handle delete
    const handleDelete = async (code: ActivationCode) => {
        try {
            const response = await fetch(
                `/api/admin/activation-codes?id=${code.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok) {
                showToast("Kod aktywacyjny został usunięty", "success");
                fetchCodes();
            } else {
                showToast(data.error || "Błąd podczas usuwania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Open edit modal
    const openEditModal = (code: ActivationCode) => {
        setEditingCode(code);
        setFormData({
            description: code.description,
            maxUses: code.max_uses,
            expiresAt: code.expires_at
                ? new Date(code.expires_at).toISOString().slice(0, 16)
                : "",
            status: code.status,
        });
        setIsModalOpen(true);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingCode(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active":
                return "Aktywny";
            case "used":
                return "Użyty";
            case "expired":
                return "Wygasły";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-600 text-white";
            case "used":
                return "bg-yellow-600 text-white";
            case "expired":
                return "bg-red-600 text-white";
            default:
                return "bg-gray-600 text-white";
        }
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">
                        Kody Aktywacyjne
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Generuj i zarządzaj kodami aktywacyjnymi
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
                        placeholder="Szukaj po kodzie, opisie..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="min-w-[150px]">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        id="status"
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Wszystkie</option>
                        <option value="active">Aktywne</option>
                        <option value="used">Użyte</option>
                        <option value="expired">Wygasłe</option>
                    </Select>
                </div>

                <Button onClick={openAddModal}>Dodaj kod aktywacyjny</Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie...
                </div>
            ) : codes.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                    Brak kodów aktywacyjnych
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Kod</TableHeaderCell>
                            <TableHeaderCell>Opis</TableHeaderCell>
                            <TableHeaderCell>Użycie</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Wygasa</TableHeaderCell>
                            <TableHeaderCell>Utworzony</TableHeaderCell>
                            <TableHeaderCell>Akcje</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {codes.map((code) => (
                            <TableRow key={code.id}>
                                <TableCell>
                                    <span className="font-mono text-amber-200 font-medium">
                                        {code.code}
                                    </span>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                    <div
                                        className="truncate"
                                        title={code.description}
                                    >
                                        {code.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {code.used_count} / {code.max_uses}
                                    </div>
                                    <div className="w-full bg-neutral-700 rounded-full h-2 mt-1">
                                        <div
                                            className="bg-amber-600 h-2 rounded-full"
                                            style={{
                                                width: `${
                                                    (code.used_count /
                                                        code.max_uses) *
                                                    100
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                            code.status
                                        )}`}
                                    >
                                        {getStatusLabel(code.status)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {code.expires_at
                                        ? new Date(
                                              code.expires_at
                                          ).toLocaleDateString("pl-PL")
                                        : "Brak"}
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {new Date(
                                        code.created_at
                                    ).toLocaleDateString("pl-PL")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(code)}
                                        >
                                            Edytuj
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                setDeleteConfirm({
                                                    isOpen: true,
                                                    code,
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
                    setEditingCode(null);
                    setFormData(initialFormData);
                }}
                title={
                    editingCode
                        ? "Edytuj kod aktywacyjny"
                        : "Dodaj kod aktywacyjny"
                }
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="description">Opis *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="maxUses">Maksymalna liczba użyć</Label>
                        <Input
                            id="maxUses"
                            type="number"
                            min="1"
                            value={formData.maxUses}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    maxUses: parseInt(e.target.value) || 1,
                                })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="expiresAt">
                            Data wygaśnięcia (opcjonalna)
                        </Label>
                        <Input
                            id="expiresAt"
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    expiresAt: e.target.value,
                                })
                            }
                        />
                    </div>

                    {editingCode && (
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="active">Aktywny</option>
                                <option value="used">Użyty</option>
                                <option value="expired">Wygasły</option>
                            </Select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingCode(null);
                                setFormData(initialFormData);
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button type="submit">
                            {editingCode ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, code: null })}
                onConfirm={() => {
                    if (deleteConfirm.code) {
                        handleDelete(deleteConfirm.code);
                    }
                    setDeleteConfirm({ isOpen: false, code: null });
                }}
                title="Potwierdź usunięcie"
                message={`Czy na pewno chcesz usunąć kod aktywacyjny "${deleteConfirm.code?.code}"? Ta akcja jest nieodwracalna.`}
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="destructive"
            />
        </div>
    );
}
