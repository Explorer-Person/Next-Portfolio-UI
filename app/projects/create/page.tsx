/* eslint-disable @next/next/no-img-element */
"use client";

import AuthGate from "@/components/AuthGate";
import ProjectsEditorComponent from "@/components/ProjectsEditor";




export default function ProjectsEditorPage() {
    return (
        <AuthGate><ProjectsEditorComponent mode="create" /></AuthGate>
    )
}


