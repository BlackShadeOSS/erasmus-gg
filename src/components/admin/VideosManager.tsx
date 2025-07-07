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

interface Profession {
    id: string;
    name: string;
    name_en: string;
}

interface Video {
    id: string;
    profession_id: string;
    title_en: string;
    title_pl: string;
    description_en?: string;
    description_pl?: string;
    video_url: string;
    thumbnail_url?: string;
    duration?: number;
    difficulty_level: number;
    is_active: boolean;
    created_at: string;
    profession: Profession;
}

interface VideoFormData {
    profession_id: string;
    title_en: string;
    title_pl: string;
    description_en: string;
    description_pl: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    difficulty_level: number;
    is_active: boolean;
}

const initialFormData: VideoFormData = {
    profession_id: "",
    title_en: "",
    title_pl: "",
    description_en: "",
    description_pl: "",
    video_url: "",
    thumbnail_url: "",
    duration: 0,
    difficulty_level: 1,
    is_active: true,
};

export default function VideosManager() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProfession, setSelectedProfession] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [formData, setFormData] = useState<VideoFormData>(initialFormData);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        video: Video | null;
    }>({
        isOpen: false,
        video: null,
    });
    const { showToast, ToastComponent } = useToast();

    const limit = 10;

    // Fetch videos data
    const fetchVideos = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedProfession && { professionId: selectedProfession }),
                ...(selectedDifficulty && {
                    difficultyLevel: selectedDifficulty,
                }),
            });

            const response = await fetch(`/api/admin/videos?${params}`);
            const data = await response.json();

            if (response.ok) {
                setVideos(data.videos);
                setTotalPages(data.pagination.totalPages);
            } else {
                showToast(
                    data.error || "Błąd podczas pobierania filmów",
                    "error"
                );
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch professions
    const fetchProfessions = async () => {
        try {
            const response = await fetch("/api/admin/professions");
            const data = await response.json();

            if (response.ok) {
                setProfessions(data.professions);
            } else {
                showToast("Błąd podczas pobierania zawodów", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [currentPage, searchTerm, selectedProfession, selectedDifficulty]);

    useEffect(() => {
        fetchProfessions();
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.profession_id ||
            !formData.title_en ||
            !formData.title_pl ||
            !formData.video_url
        ) {
            showToast(
                "Wypełnij wymagane pola: zawód, tytuł angielski, tytuł polski, URL filmu",
                "error"
            );
            return;
        }

        try {
            const url = "/api/admin/videos";
            const method = editingVideo ? "PUT" : "POST";
            const payload = editingVideo
                ? { ...formData, id: editingVideo.id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(
                    editingVideo
                        ? "Film został zaktualizowany"
                        : "Film został utworzony",
                    "success"
                );
                setIsModalOpen(false);
                setEditingVideo(null);
                setFormData(initialFormData);
                fetchVideos();
            } else {
                showToast(data.error || "Błąd podczas zapisywania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Handle delete
    const handleDelete = async (video: Video) => {
        try {
            const response = await fetch(`/api/admin/videos?id=${video.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Film został usunięty", "success");
                fetchVideos();
            } else {
                showToast(data.error || "Błąd podczas usuwania", "error");
            }
        } catch (error) {
            showToast("Błąd połączenia z serwerem", "error");
        }
    };

    // Open edit modal
    const openEditModal = (video: Video) => {
        setEditingVideo(video);
        setFormData({
            profession_id: video.profession_id,
            title_en: video.title_en,
            title_pl: video.title_pl,
            description_en: video.description_en || "",
            description_pl: video.description_pl || "",
            video_url: video.video_url,
            thumbnail_url: video.thumbnail_url || "",
            duration: video.duration || 0,
            difficulty_level: video.difficulty_level,
            is_active: video.is_active,
        });
        setIsModalOpen(true);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingVideo(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const formatDuration = (duration: number) => {
        if (!duration) return "N/A";
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="space-y-6">
            {ToastComponent}

            <div>
                <h2 className="text-2xl font-bold text-neutral-100">
                    Menedżer Filmów
                </h2>
                <p className="text-neutral-400 mt-2">
                    Zarządzaj filmami edukacyjnymi
                </p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Szukaj</Label>
                    <Input
                        id="search"
                        placeholder="Szukaj tytułów, opisów..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

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
                            <option key={profession.id} value={profession.id}>
                                {profession.name}
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

                <Button onClick={openAddModal}>Dodaj film</Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie...
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                    Brak filmów
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Tytuł</TableHeaderCell>
                            <TableHeaderCell>Zawód</TableHeaderCell>
                            <TableHeaderCell>Czas trwania</TableHeaderCell>
                            <TableHeaderCell>Poziom</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Utworzony</TableHeaderCell>
                            <TableHeaderCell>Akcje</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {videos.map((video) => (
                            <TableRow key={video.id}>
                                <TableCell>
                                    <div className="font-medium">
                                        {video.title_pl}
                                    </div>
                                    <div className="text-sm text-neutral-400">
                                        {video.title_en}
                                    </div>
                                </TableCell>
                                <TableCell>{video.profession.name}</TableCell>
                                <TableCell className="text-neutral-400">
                                    {formatDuration(video.duration || 0)}
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-amber-200 text-neutral-900 rounded text-xs">
                                        Poziom {video.difficulty_level}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            video.is_active
                                                ? "bg-green-600 text-white"
                                                : "bg-red-600 text-white"
                                        }`}
                                    >
                                        {video.is_active
                                            ? "Aktywny"
                                            : "Nieaktywny"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {new Date(
                                        video.created_at
                                    ).toLocaleDateString("pl-PL")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(video)}
                                        >
                                            Edytuj
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                setDeleteConfirm({
                                                    isOpen: true,
                                                    video,
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
                    setEditingVideo(null);
                    setFormData(initialFormData);
                }}
                title={editingVideo ? "Edytuj film" : "Dodaj film"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="profession_id">Zawód *</Label>
                        <Select
                            id="profession_id"
                            value={formData.profession_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    profession_id: e.target.value,
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
                            <Label htmlFor="title_pl">Tytuł (polski) *</Label>
                            <Input
                                id="title_pl"
                                value={formData.title_pl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title_pl: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="title_en">
                                Tytuł (angielski) *
                            </Label>
                            <Input
                                id="title_en"
                                value={formData.title_en}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title_en: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="description_pl">
                                Opis (polski)
                            </Label>
                            <Textarea
                                id="description_pl"
                                value={formData.description_pl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description_pl: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="description_en">
                                Opis (angielski)
                            </Label>
                            <Textarea
                                id="description_en"
                                value={formData.description_en}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description_en: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="video_url">URL filmu *</Label>
                        <Input
                            id="video_url"
                            type="url"
                            placeholder="https://..."
                            value={formData.video_url}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    video_url: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="thumbnail_url">URL miniaturki</Label>
                        <Input
                            id="thumbnail_url"
                            type="url"
                            placeholder="https://..."
                            value={formData.thumbnail_url}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    thumbnail_url: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="duration">
                                Czas trwania (sekundy)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                min="0"
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        duration: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
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
                        <Label htmlFor="is_active">Film aktywny</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingVideo(null);
                                setFormData(initialFormData);
                            }}
                        >
                            Anuluj
                        </Button>
                        <Button type="submit">
                            {editingVideo ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, video: null })}
                onConfirm={() => {
                    if (deleteConfirm.video) {
                        handleDelete(deleteConfirm.video);
                    }
                    setDeleteConfirm({ isOpen: false, video: null });
                }}
                title="Potwierdź usunięcie"
                message={`Czy na pewno chcesz usunąć film "${deleteConfirm.video?.title_pl}"? Ta akcja jest nieodwracalna.`}
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="destructive"
            />
        </div>
    );
}
