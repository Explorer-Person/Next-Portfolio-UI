'use client'

import { useParams } from "next/navigation";
import { useEffect } from "react";
import QualificationsEditor from "@/components/QualificationsEditor";
import AuthGate from "@/components/AuthGate";

export default function UpdateProjectsPage() {
    const { id } = useParams<{ id: string }>(); // Type-safe ID

    useEffect(() => {
        if (!id) return; // Avoid running before `id` is available

        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/qualifications/${id}`, { method: "GET", credentials: "include", });
                if (!res.ok) throw new Error("Failed to fetch project");

                const resp = await res.json();
                const data = resp.data;

                // Store in localStorage (convert to string)
                localStorage.setItem("qualificationsEditing", JSON.stringify(data));
                localStorage.setItem("qualificationsId", data._id);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProject();
    }, [id]);

    return (
        <AuthGate>
            <QualificationsEditor mode='update' />
        </AuthGate>

    );
}
