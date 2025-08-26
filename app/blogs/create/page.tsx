import AuthGate from "@/components/AuthGate";
import Editor from "@/components/Editor";

export default function CreateBlogPage() {
    return (
        <AuthGate>
            <Editor initialData={undefined} mode="create" />
        </AuthGate>
    );
}
