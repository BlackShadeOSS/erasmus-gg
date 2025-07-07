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

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
}

export default function UsersManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-neutral-100">Ładowanie użytkowników...</div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-100">
                    Zarządzanie Użytkownikami
                </h2>
                <p className="text-neutral-400 mt-2">
                    Zarządzaj kontami użytkowników i uprawnieniami
                </p>
            </div>

            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                <CardHeader>
                    <CardTitle className="text-neutral-100">
                        Wszyscy Użytkownicy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg"
                            >
                                <div>
                                    <p className="text-neutral-100 font-medium">
                                        {user.username}
                                    </p>
                                    <p className="text-neutral-300 text-sm">
                                        {user.email}
                                    </p>
                                    <p className="text-neutral-300 text-sm">
                                        Rola:{" "}
                                        {user.role === "admin"
                                            ? "Administrator"
                                            : user.role === "teacher"
                                            ? "Nauczyciel"
                                            : "Uczeń"}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            user.is_active
                                                ? "bg-green-600 text-white"
                                                : "bg-red-600 text-white"
                                        }`}
                                    >
                                        {user.is_active
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
