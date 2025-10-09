"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VocabularyItem {
    term_en: string;
    term_pl: string;
    definition_en?: string;
    definition_pl?: string;
    pronunciation?: string;
    example_sentence_en?: string;
    example_sentence_pl?: string;
    difficulty_level?: number;
    category_id?: string;
}

interface Category {
    id: string;
    name: string;
    name_en: string;
    profession_id: string;
    profession?: {
        id: string;
        name: string;
        name_en: string;
    };
}

interface Profession {
    id: string;
    name: string;
    name_en: string;
}

export default function VocabularyImportManager() {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<VocabularyItem[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [selectedProfessionId, setSelectedProfessionId] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch professions on component mount
    useEffect(() => {
        fetchProfessions();
    }, []);

    // Fetch categories when profession is selected
    useEffect(() => {
        if (selectedProfessionId) {
            fetchCategories(selectedProfessionId);
        } else {
            setCategories([]);
        }
    }, [selectedProfessionId]);

    const fetchProfessions = async () => {
        try {
            const response = await fetch("/api/admin/professions");
            if (response.ok) {
                const data = await response.json();
                setProfessions(data.professions || data);
            }
        } catch (error) {
            console.error("Error fetching professions:", error);
        }
    };

    const fetchCategories = async (professionId: string) => {
        try {
            const response = await fetch(
                `/api/admin/vocabulary/categories?professionId=${professionId}`
            );
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const createCategory = async () => {
        if (!newCategoryName.trim() || !selectedProfessionId) {
            setMessage("Podaj nazwę kategorii i wybierz zawód");
            return;
        }

        setCreatingCategory(true);
        try {
            const response = await fetch("/api/admin/vocabulary/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    name_en: newCategoryName.trim(),
                    profession_id: selectedProfessionId,
                }),
            });

            if (response.ok) {
                const newCategory = await response.json();
                setCategories([...categories, newCategory]);
                setNewCategoryName("");
                setMessage("Kategoria utworzona pomyślnie");
            } else {
                setMessage("Błąd podczas tworzenia kategorii");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            setMessage("Błąd podczas tworzenia kategorii");
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "text/csv") {
            setCsvFile(file);
            setMessage("");
        } else {
            setMessage("Proszę wybrać plik CSV");
        }
    };

    const parseCSV = useCallback(async () => {
        if (!csvFile) {
            setMessage("Proszę wybrać plik CSV");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const text = await csvFile.text();
            const lines = text.split("\n").filter((line) => line.trim());

            if (lines.length < 2) {
                setMessage("Plik CSV jest pusty");
                setLoading(false);
                return;
            }

            // Parse header
            const headers = lines[0].split(",").map((h) => h.trim());

            // Parse data rows
            const data: VocabularyItem[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map((v) => v.trim());
                const item: VocabularyItem = {
                    term_en: "",
                    term_pl: "",
                };

                headers.forEach((header, index) => {
                    const value = values[index] || "";
                    switch (header.toLowerCase()) {
                        case "term_en":
                            item.term_en = value;
                            break;
                        case "term_pl":
                            item.term_pl = value;
                            break;
                        case "definition_en":
                            item.definition_en = value;
                            break;
                        case "definition_pl":
                            item.definition_pl = value;
                            break;
                        case "pronunciation":
                            item.pronunciation = value;
                            break;
                        case "example_sentence_en":
                            item.example_sentence_en = value;
                            break;
                        case "example_sentence_pl":
                            item.example_sentence_pl = value;
                            break;
                        case "difficulty_level":
                            item.difficulty_level = value ? parseInt(value) : 1;
                            break;
                    }
                });

                if (item.term_en && item.term_pl) {
                    data.push(item);
                }
            }

            setParsedData(data);
            setMessage(`Wczytano ${data.length} pozycji`);
        } catch (error) {
            console.error("Parse error:", error);
            setMessage("Błąd podczas parsowania pliku CSV");
        } finally {
            setLoading(false);
        }
    }, [csvFile]);

    const handleCategoryChange = (index: number, categoryId: string) => {
        setParsedData((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                category_id: categoryId || undefined,
            };
            return updated;
        });
    };

    const assignCategoryToAll = (categoryId: string) => {
        setParsedData((prev) =>
            prev.map((item) => ({
                ...item,
                category_id: categoryId || undefined,
            }))
        );
        setMessage(`Przypisano kategorię do wszystkich pozycji`);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) {
            setMessage("Brak danych do importu");
            return;
        }

        setImporting(true);
        setMessage("");

        try {
            const response = await fetch("/api/admin/vocabulary/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: parsedData }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message || "Import zakończony pomyślnie");
                setParsedData([]);
                setCsvFile(null);
            } else {
                setMessage(result.error || "Błąd podczas importu");
            }
        } catch (error) {
            console.error("Import error:", error);
            setMessage("Błąd podczas importu słownictwa");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-amber-200 text-4xl font-bold mb-2">
                    Import Słownictwa
                </h1>
                <p className="text-stone-400">
                    Wybierz zawód, zarządzaj kategoriami i importuj słownictwo z pliku CSV
                </p>
            </div>

            {/* Profession Selection */}
            <Card className="p-6 bg-neutral-800/50 border-neutral-700">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="profession-select" className="text-stone-300 text-lg font-semibold">
                            1. Wybierz Zawód
                        </Label>
                        <select
                            id="profession-select"
                            value={selectedProfessionId}
                            onChange={(e) => setSelectedProfessionId(e.target.value)}
                            className="mt-2 w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-stone-300"
                        >
                            <option value="">-- Wybierz zawód --</option>
                            {professions.map((profession) => (
                                <option key={profession.id} value={profession.id}>
                                    {profession.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Category Management */}
            {selectedProfessionId && (
                <Card className="p-6 bg-neutral-800/50 border-neutral-700">
                    <div className="space-y-4">
                        <Label className="text-stone-300 text-lg font-semibold">
                            2. Zarządzaj Kategoriami
                        </Label>
                        
                        <div className="flex gap-3">
                            <Input
                                placeholder="Nowa kategoria..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 bg-neutral-700 border-neutral-600 text-stone-300"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        createCategory();
                                    }
                                }}
                            />
                            <Button
                                onClick={createCategory}
                                disabled={creatingCategory || !newCategoryName.trim()}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {creatingCategory ? "Tworzenie..." : "Dodaj Kategorię"}
                            </Button>
                        </div>

                        <div className="mt-4">
                            <p className="text-stone-400 text-sm mb-2">
                                Dostępne kategorie ({categories.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="px-3 py-1 bg-neutral-700 border border-neutral-600 rounded-full text-stone-300 text-sm"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                                {categories.length === 0 && (
                                    <span className="text-stone-500 text-sm">
                                        Brak kategorii - dodaj pierwszą powyżej
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* CSV Upload */}
            {selectedProfessionId && categories.length > 0 && (
                <Card className="p-6 bg-neutral-800/50 border-neutral-700">
                    <div className="space-y-4">
                        <Label className="text-stone-300 text-lg font-semibold">
                            3. Importuj Plik CSV
                        </Label>
                        
                        <div>
                            <Label htmlFor="csv-file" className="text-stone-300">
                                Wybierz plik CSV
                            </Label>
                            <input
                                id="csv-file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="mt-2 block w-full text-sm text-stone-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-amber-600 file:text-white
                                    hover:file:bg-amber-700
                                    file:cursor-pointer cursor-pointer"
                            />
                        </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={parseCSV}
                            disabled={!csvFile || loading}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {loading ? "Wczytywanie..." : "Wczytaj CSV"}
                        </Button>

                        {parsedData.length > 0 && (
                            <>
                                <Button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {importing
                                        ? "Importowanie..."
                                        : `Importuj (${parsedData.length})`}
                                </Button>

                                <Button
                                    onClick={() => {
                                        setParsedData([]);
                                        setCsvFile(null);
                                        setMessage("");
                                    }}
                                    variant="secondary"
                                    className="bg-neutral-700 hover:bg-neutral-600"
                                >
                                    Wyczyść
                                </Button>
                            </>
                        )}
                    </div>

                    {message && (
                        <p
                            className={`text-sm ${
                                message.includes("Błąd") ||
                                message.includes("Proszę")
                                    ? "text-red-400"
                                    : "text-green-400"
                            }`}
                        >
                            {message}
                        </p>
                    )}
                </div>
            </Card>
            )}

            {/* Preview and Category Assignment */}
            {parsedData.length > 0 && (
                <Card className="p-6 bg-neutral-800/50 border-neutral-700">
                    <div className="mb-4 flex items-center gap-4">
                        <Label className="text-stone-300">
                            Przypisz kategorię do wszystkich:
                        </Label>
                        <select
                            onChange={(e) =>
                                assignCategoryToAll(e.target.value)
                            }
                            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-stone-300"
                        >
                            <option value="">Wybierz kategorię</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-neutral-700">
                                <tr className="text-left text-stone-400">
                                    <th className="pb-3 pr-4">Angielski</th>
                                    <th className="pb-3 pr-4">Polski</th>
                                    <th className="pb-3 pr-4">Definicja EN</th>
                                    <th className="pb-3 pr-4">Poziom</th>
                                    <th className="pb-3">Kategoria</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-neutral-700/50"
                                    >
                                        <td className="py-3 pr-4 text-stone-300">
                                            {item.term_en}
                                        </td>
                                        <td className="py-3 pr-4 text-stone-300">
                                            {item.term_pl}
                                        </td>
                                        <td className="py-3 pr-4 text-stone-400 text-xs max-w-xs truncate">
                                            {item.definition_en || "-"}
                                        </td>
                                        <td className="py-3 pr-4 text-stone-300">
                                            {item.difficulty_level || 1}
                                        </td>
                                        <td className="py-3">
                                            <select
                                                value={item.category_id || ""}
                                                onChange={(e) =>
                                                    handleCategoryChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                className="px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-stone-300 text-xs"
                                            >
                                                <option value="">
                                                    Brak kategorii
                                                </option>
                                                {categories.map((cat) => (
                                                    <option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
