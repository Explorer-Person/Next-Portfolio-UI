// AuthContext.tsx
"use client";
import React, { createContext, useContext } from "react";

export type AuthState = { ready: boolean; isAuthed: boolean };
export type AuthContextValue = AuthState & {
    login: () => void;
    logout: () => void;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
    ready: false,
    isAuthed: false,
    login: () => { },
    logout: () => { },
    refresh: async () => { },
});

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}

// keep this Provider simple; it just provides the value it receives
export function AuthProvider({
    value,
    children,
}: {
    value: AuthContextValue;
    children: React.ReactNode;
}) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
