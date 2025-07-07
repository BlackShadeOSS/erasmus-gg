"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Profession {
    id: string;
    name: string;
    name_en: string;
    description: string;
    is_active: boolean;
    created_at: string;
}

export default function ProfessionsManager() {
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: "",
        nameEn: "",
        description: "",
    });

    useEffect(() => {
        fetchProfessions();
    }, []);

    const fetchProfessions = async () => {
        try {
            const response = await fetch("/api/admin/professions");
            const data = await response.json();
            if (data.success) {
                setProfessions(data.professions);
            }
        } catch (error) {
            console.error("Error fetching professions:", error);
        } finally {
            setLoading(false);
        }
    };

    const createProfession = async () => {
        try {
            const response = await fetch("/api/admin/professions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createForm),
            });
            const data = await response.json();
            if (data.success) {
                fetchProfessions();
                setShowCreateForm(false);
                setCreateForm({ name: "", nameEn: "", description: "" });
            }
        } catch (error) {
            console.error("Error creating profession:", error);
        }
    };

    if (loading) {
        return <div className="text-neutral-100">Ładowanie zawodów...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">
                        Zawody
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Zarządzaj kategoriami zawodowymi
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                    Dodaj Zawód
                </Button>
            </div>

            {showCreateForm && (
                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100">
                            Dodaj Nowy Zawód
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-neutral-100">
                                Nazwa (Polski)
                            </Label>
                            <Input
                                id="name"
                                value={createForm.name}
                                onChange={(e) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="bg-neutral-700/50 border-neutral-600 text-neutral-100"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="nameEn"
                                className="text-neutral-100"
                            >
                                Nazwa (Angielski)
                            </Label>
                            <Input
                                id="nameEn"
                                value={createForm.nameEn}
                                onChange={(e) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        nameEn: e.target.value,
                                    }))
                                }
                                className="bg-neutral-700/50 border-neutral-600 text-neutral-100"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="description"
                                className="text-neutral-100"
                            >
                                Opis
                            </Label>
                            <Input
                                id="description"
                                value={createForm.description}
                                onChange={(e) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="bg-neutral-700/50 border-neutral-600 text-neutral-100"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={createProfession}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                Utwórz Zawód
                            </Button>
                            <Button
                                onClick={() => setShowCreateForm(false)}
                                variant="secondary"
                                className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100"
                            >
                                Anuluj
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                <CardHeader>
                    <CardTitle className="text-neutral-100">
                        Wszystkie Zawody
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {professions.map((profession) => (
                            <div
                                key={profession.id}
                                className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg"
                            >
                                <div>
                                    <p className="text-neutral-100 font-medium">
                                        {profession.name}
                                    </p>
                                    <p className="text-neutral-300 text-sm">
                                        {profession.name_en}
                                    </p>
                                    <p className="text-neutral-300 text-sm">
                                        {profession.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
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
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
