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
import { Select } from "@/components/ui/form";

interface ActivationCode {
    id: string;
    code: string;
    description: string;
    max_uses: number;
    used_count: number;
    status: string;
    expires_at: string;
    created_at: string;
    profession_id: string | null;
    profession?: {
        id: string;
        name: string;
        name_en: string;
    } | null;
}

export default function ActivationCodesManager() {
    const [codes, setCodes] = useState<ActivationCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        description: "",
        maxUses: 1,
        expiresAt: "",
        professionId: "",
    });
    const [professions, setProfessions] = useState<Array<{id: string, name: string, name_en: string}>>([]);
    const [loadingProfessions, setLoadingProfessions] = useState(false);

    useEffect(() => {
        fetchCodes();
    }, []);

    useEffect(() => {
        const fetchProfessions = async () => {
            setLoadingProfessions(true);
            try {
                const response = await fetch('/api/admin/professions?status=active');
                const data = await response.json();
                if (data.success) {
                    setProfessions(data.professions);
                }
            } catch (error) {
                console.error('Error fetching professions:', error);
            } finally {
                setLoadingProfessions(false);
            }
        };
        fetchProfessions();
    }, []);

    const fetchCodes = async () => {
        try {
            const response = await fetch("/api/admin/activation-codes");
            const data = await response.json();
            if (data.success) {
                setCodes(data.codes);
            }
        } catch (error) {
            console.error("Error fetching activation codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const createCode = async () => {
        try {
            const response = await fetch("/api/admin/activation-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createForm),
            });
            const data = await response.json();
            if (data.success) {
                fetchCodes();
                setShowCreateForm(false);
                setCreateForm({ description: "", maxUses: 1, expiresAt: "", professionId: "" });
            }
        } catch (error) {
            console.error("Error creating activation code:", error);
        }
    };

    if (loading) {
        return (
            <div className="text-neutral-100">
                Ładowanie kodów aktywacyjnych...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100">
                        Kody Aktywacyjne
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Generuj i zarządzaj kodami aktywacyjnymi
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                    Utwórz Nowy Kod
                </Button>
            </div>

            {showCreateForm && (
                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100">
                            Utwórz Kod Aktywacyjny
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <div>
                            <Label
                                htmlFor="maxUses"
                                className="text-neutral-100"
                            >
                                Maksymalna liczba użyć
                            </Label>
                            <Input
                                id="maxUses"
                                type="number"
                                value={createForm.maxUses}
                                onChange={(e) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        maxUses: parseInt(e.target.value),
                                    }))
                                }
                                className="bg-neutral-700/50 border-neutral-600 text-neutral-100"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="professionId"
                                className="text-neutral-100"
                            >
                                Zawód (opcjonalny)
                            </Label>
                            <Select
                                id="professionId"
                                value={createForm.professionId}
                                onChange={(e) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        professionId: e.target.value,
                                    }))
                                }
                                disabled={loadingProfessions}
                                className="bg-neutral-700/50 border-neutral-600 text-neutral-100"
                            >
                                <option value="">Brak (dowolny zawód)</option>
                                {professions.map((profession) => (
                                    <option key={profession.id} value={profession.id}>
                                        {profession.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label
                                htmlFor="expiresAt"
                                className="text-neutral-100"
                            >
                                Data wygaśnięcia (opcjonalna)
                            </Label>
                            <Input
                                id="expiresAt"
                                type="datetime-local"
                                value={createForm.expiresAt}
                                onChange={(e) =>
                                    setCreateForm((prev) => ({
                                        ...prev,
                                        expiresAt: e.target.value,
                                    }))
                                }
                                className="bg-neutral-700/50 border-neutral-600 text-neutral-100"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={createCode}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                Utwórz Kod
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setShowCreateForm(false)}
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
                        Wszystkie Kody Aktywacyjne
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {codes.map((code) => (
                            <div
                                key={code.id}
                                className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg"
                            >
                                <div>
                                    <p className="text-neutral-100 font-medium font-mono">
                                        {code.code}
                                    </p>
                                    <p className="text-neutral-300 text-sm">
                                        {code.description}
                                    </p>
                                    <p className="text-neutral-400 text-xs">
                                        Użyć: {code.used_count}/{code.max_uses}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            code.status === "active"
                                                ? "bg-green-600 text-white"
                                                : code.status === "used"
                                                ? "bg-yellow-600 text-white"
                                                : "bg-red-600 text-white"
                                        }`}
                                    >
                                        {code.status === "active"
                                            ? "Aktywny"
                                            : code.status === "used"
                                            ? "Używany"
                                            : "Wygasły"}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {codes.length === 0 && (
                            <p className="text-neutral-400 text-center py-8">
                                Brak kodów aktywacyjnych
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
