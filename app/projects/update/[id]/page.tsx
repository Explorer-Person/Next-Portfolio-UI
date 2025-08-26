'use client'

import { useParams } from "next/navigation";

import { useEffect } from "react";
import AuthGate from "@/components/AuthGate";
import ProjectsEditorComponent from "@/components/ProjectsEditor";

export default function UpdateProjectsPage() {
    const { id } = useParams<{ id: string }>(); // Type-safe ID

    useEffect(() => {
        if (!id) return; // Avoid running before `id` is available

        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/common/projects/${id}`, { method: "GET" });
                if (!res.ok) throw new Error("Failed to fetch project");

                const resp = await res.json();
                const data = resp.data;

                // Store in localStorage (convert to string)
                localStorage.setItem("projectEditing", JSON.stringify(data));
                localStorage.setItem("projectId", data._id);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProject();
    }, [id]);

    return (
        <AuthGate>
            <ProjectsEditorComponent
                mode="update"
            />
        </AuthGate>

    );
}
