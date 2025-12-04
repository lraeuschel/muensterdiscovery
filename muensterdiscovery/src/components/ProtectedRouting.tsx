import React from "react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient";

export default function ProtectedRouting({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function checkUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        }

        checkUser();
    }, []);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
