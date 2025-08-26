"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/Editor";
import { Blog } from "@/datas/interfaces";
import AuthGate from "@/components/AuthGate";

export default function EditBlogPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;

    const [blog, setBlog] = useState<Blog | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/common/blogs/${id}`, {
                    method: "GET"
                });
                if (!res.ok) throw new Error("Failed to fetch blog");

                const response = await res.json();
                const fetchedBlog = response.data;
                setBlog(fetchedBlog);

                // Save id and blog in localStorage
                localStorage.setItem("blogId", id);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                    console.error(err);
                } else {
                    setError("An unknown error occurred");
                    console.error(err);
                }
            }
        };

        fetchBlog();
    }, [id]);

    if (error) return <div className="text-red-600 p-4">Error: {error}</div>;
    if (!blog) return <div className="text-gray-800 p-4">Loading...</div>;

    return <AuthGate><Editor initialData={blog} mode="update" /></AuthGate>
            
            
            
}
