// app/coming-soon/page.tsx
import { ComingSoon } from "@/app/common/ComingSoon";
import AuthGate from "@/components/AuthGate";


export const metadata = {
    title: "Page in Development",
    description: "This page is currently under development.",
    robots: { index: false, follow: false }, // keep it out of search while dev
};

export default function ExperiencesEditorPage() {
    return (
        <AuthGate>
            <ComingSoon />
        </AuthGate>
    );
}
