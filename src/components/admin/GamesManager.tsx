"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GamesManager() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gry</h2>
            </div>

            <Card className="bg-neutral-800/50 border-neutral-700">
                <CardHeader>
                    <CardTitle className="text-amber-200 text-center">
                        🎮 Wkrótce...
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <div className="space-y-4">
                        <div className="text-6xl">🚧</div>
                        <h3 className="text-2xl font-semibold text-white">
                            Zarządzanie grami
                        </h3>
                        <p className="text-neutral-400 max-w-md mx-auto">
                            Ta funkcjonalność jest obecnie w fazie rozwoju.
                            Wkrótce będzie można zarządzać grami edukacyjnymi
                            dla różnych zawodów.
                        </p>
                        <div className="mt-8">
                            <span className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg font-medium">
                                W trakcie budowy
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
