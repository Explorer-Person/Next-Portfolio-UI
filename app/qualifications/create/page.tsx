/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/qualifications/create/page.tsx
"use client";

import QualificationsEditor from "@/components/QualificationsEditor";
import AuthGate from "@/components/AuthGate";

export default function CreateQualificationPage() {
    return(
        <AuthGate>
            <QualificationsEditor mode='create' />
        </AuthGate>
    )
}

