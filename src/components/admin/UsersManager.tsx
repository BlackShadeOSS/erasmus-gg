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
import {
    DataStatusIndicator,
    type DataStatus,
} from "@/components/ui/data-status-indicator";

interface User {
    id: string;
    username: string;
    email: string;
    role: "student" | "teacher" | "admin";
    full_name?: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
    selected_profession_id?: string;
}

interface UserFormData {
    username: string;
    email: string;
    full_name: string;
    role: "student" | "teacher" | "admin";
    is_active: boolean;
    password?: string;
}

const initialFormData: UserFormData = {
    username: "",
    email: "",
    full_name: "",
    role: "student",
    is_active: true,
};

export default function UsersManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({
        isOpen: false,
        user: null,
    });
    const { showToast, ToastComponent } = useToast();

    // Refs for tracking ongoing requests to prevent race conditions
    const abortControllerRef = useRef<AbortController | null>(null);

    const limit = 10;

    // Fetch users data with caching
    const fetchUsers = useCallback(
        async (forceRefresh = false) => {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm,
                role: selectedRole,
                status: selectedStatus,
            };

            const cacheKey = generateCacheKey("users", params);

            // Check cache first
            if (!forceRefresh) {
                const cachedData = adminCache.get<{
                    users: User[];
                    pagination: any;
                }>(cacheKey);
                if (cachedData) {
                    setUsers(cachedData.users);
                    setTotalPages(cachedData.pagination?.totalPages || 1);
                    setLoading(false);
                    setHasError(false);

                    // Schedule background refresh if stale
                    if (adminCache.isStale(cacheKey)) {
                        setBackgroundLoading(true);
                        setTimeout(() => fetchUsers(true), 100);
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
                else setBackgroundLoading(true);
                setHasError(false);

                const urlParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value) urlParams.append(key, value.toString());
                });

                // For manual refresh, ensure minimum visual feedback time
                const fetchPromise = fetch(`/api/admin/users?${urlParams}`, {
                    signal: abortControllerRef.current.signal,
                });
                const minTimePromise = forceRefresh
                    ? new Promise((resolve) => setTimeout(resolve, 1500))
                    : Promise.resolve();

                const [response] = await Promise.all([
                    fetchPromise,
                    minTimePromise,
                ]);
                const data = await response.json();

                if (response.ok && data.success) {
                    setUsers(data.users);
                    setTotalPages(data.pagination?.totalPages || 1);
                    setHasError(false);

                    // Cache the result
                    adminCache.set(cacheKey, {
                        users: data.users,
                        pagination: data.pagination,
                    });
                } else {
                    setHasError(true);
                    showToast(
                        data.error || "Błąd podczas pobierania użytkowników",
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
        [currentPage, searchTerm, selectedRole, selectedStatus, showToast]
    );

    // Debounced effect for data fetching
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            adminCache.invalidate("users");
            fetchUsers(true);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

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

        if (!formData.username || !formData.email) {
            showToast(
                "Wypełnij wymagane pola: nazwa użytkownika, email",
                "error"
            );
            return;
        }

        if (!editingUser && !formData.password) {
            showToast("Hasło jest wymagane dla nowego użytkownika", "error");
            return;
        }

        try {
            const url = editingUser
                ? `/api/admin/users?id=${editingUser.id}`
                : "/api/admin/users";
            const method = editingUser ? "PUT" : "POST";
            const payload = editingUser
                ? {
                      username: formData.username,
                      email: formData.email,
                      fullName: formData.full_name,
                      role: formData.role,
                      isActive: formData.is_active,
                      ...(formData.password && { password: formData.password }),
                  }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    editingUser
                        ? "Użytkownik został zaktualizowany"
                        : "Użytkownik został utworzony",
                    "success"
                );
                setIsModalOpen(false);
                setEditingUser(null);
                setFormData(initialFormData);

                // Invalidate cache and refresh data
                adminCache.invalidate("users");
                fetchUsers(true);
            } else {
                showToast(data.error || "Błąd podczas zapisywania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Handle delete
    const handleDelete = async (user: User) => {
        try {
            const response = await fetch(`/api/admin/users?id=${user.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Użytkownik został usunięty", "success");
                adminCache.invalidate("users");
                fetchUsers(true);
            } else {
                showToast(data.error || "Błąd podczas usuwania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Toggle user status
    const toggleUserStatus = async (user: User) => {
        try {
            const response = await fetch(`/api/admin/users?id=${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name || "",
                    role: user.role,
                    isActive: !user.is_active,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    `Użytkownik został ${
                        !user.is_active ? "aktywowany" : "dezaktywowany"
                    }`,
                    "success"
                );
                adminCache.invalidate("users");
                fetchUsers(true);
            } else {
                showToast(data.error || "Błąd podczas zmiany statusu", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Open edit modal
    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            full_name: user.full_name || "",
            role: user.role,
            is_active: user.is_active,
        });
        setIsModalOpen(true);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingUser(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "admin":
                return "Administrator";
            case "teacher":
                return "Nauczyciel";
            case "student":
                return "Uczeń";
            default:
                return role;
        }
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">
                        Zarządzanie Użytkownikami
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Zarządzaj kontami użytkowników i uprawnieniami
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
                        onClick={() => fetchUsers(true)}
                        disabled={loading || backgroundLoading}
                        className="text-xs"
                    >
                        Odśwież
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Szukaj</Label>
                    <Input
                        id="search"
                        placeholder="Szukaj po nazwie użytkownika, email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="min-w-[150px]">
                    <Label htmlFor="role">Rola</Label>
                    <Select
                        id="role"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Wszystkie role</option>
                        <option value="student">Uczeń</option>
                        <option value="teacher">Nauczyciel</option>
                        <option value="admin">Administrator</option>
                    </Select>
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
                        <option value="active">Aktywni</option>
                        <option value="inactive">Nieaktywni</option>
                    </Select>
                </div>

                <Button onClick={openAddModal}>Dodaj użytkownika</Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie...
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                    Brak użytkowników
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Użytkownik</TableHeaderCell>
                            <TableHeaderCell>Email</TableHeaderCell>
                            <TableHeaderCell>Rola</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>
                                Ostatnie logowanie
                            </TableHeaderCell>
                            <TableHeaderCell>Akcje</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">
                                        {user.username}
                                    </div>
                                    {user.full_name && (
                                        <div className="text-sm text-neutral-400">
                                            {user.full_name}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-neutral-300">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-amber-200 text-neutral-900 rounded text-xs">
                                        {getRoleLabel(user.role)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => toggleUserStatus(user)}
                                        className={`px-2 py-1 rounded text-xs transition-colors ${
                                            user.is_active
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : "bg-red-600 text-white hover:bg-red-700"
                                        }`}
                                    >
                                        {user.is_active
                                            ? "Aktywny"
                                            : "Nieaktywny"}
                                    </button>
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {user.last_login
                                        ? new Date(
                                              user.last_login
                                          ).toLocaleDateString("pl-PL")
                                        : "Nigdy"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(user)}
                                        >
                                            Edytuj
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                setDeleteConfirm({
                                                    isOpen: true,
                                                    user,
                                                })
                                            }
                                            disabled={user.role === "admin"}
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
                    setEditingUser(null);
                    setFormData(initialFormData);
                }}
                title={editingUser ? "Edytuj użytkownika" : "Dodaj użytkownika"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="username">Nazwa użytkownika *</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="full_name">Imię i nazwisko</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    full_name: e.target.value,
                                })
                            }
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <Label htmlFor="password">Hasło *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                required={!editingUser}
                            />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="role">Rola</Label>
                        <Select
                            id="role"
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value as
                                        | "student"
                                        | "teacher"
                                        | "admin",
                                })
                            }
                        >
                            <option value="student">Uczeń</option>
                            <option value="teacher">Nauczyciel</option>
                            <option value="admin">Administrator</option>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_active: e.target.checked,
                                })
                            }
                            className="w-4 h-4 text-amber-200 bg-neutral-800 border-neutral-600 rounded focus:ring-amber-300 focus:ring-2"
                        />
                        <Label htmlFor="is_active">Konto aktywne</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingUser(null);
                                setFormData(initialFormData);
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button type="submit">
                            {editingUser ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
                onConfirm={() => {
                    if (deleteConfirm.user) {
                        handleDelete(deleteConfirm.user);
                    }
                    setDeleteConfirm({ isOpen: false, user: null });
                }}
                title="Potwierdź usunięcie"
                message={`Czy na pewno chcesz usunąć użytkownika "${deleteConfirm.user?.username}"? Ta akcja jest nieodwracalna.`}
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="destructive"
            />
        </div>
    );
}
