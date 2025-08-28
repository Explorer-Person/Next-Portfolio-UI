/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blog } from "@/datas/interfaces";
import { motion } from "framer-motion";
import { getSectionAnim } from "@/utils/animation";



export default function BlogList() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const router = useRouter();

    async function getBlogData() {
        try {
            const res = await fetch("/api/common/blogs", {
                method: "GET",
                cache: "no-store", // Ensure fresh data
                credentials: "include", // send httpOnly cookies
            });
            if (!res.ok) throw new Error("Failed to fetch blogs");

            const response = await res.json();

            console.log("Fetched blogs:", response);

            // Adjust to your API's shape
            if (Array.isArray(response.data)) {
                setBlogs(response.data);
            } else {
                console.error("Unexpected blogs format", response);
            }
        } catch (err) {
            console.error("Error loading blogs:", err);
        }
    }

    useEffect(() => {
        getBlogData();
    }, []);

    useEffect(() => {
        console.log(blogs)
    }, [blogs])

    return (
        <section className="w-full py-10">
            {/* Header */}
            <motion.div {...getSectionAnim({ direction: "", delay: 0.1 })} className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Up To Tech News</h1>
                <p className="text-gray-500 mt-2">
                    A blog about food, experiences, and recipes.
                </p>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Search for articles"
                        className="border rounded px-4 py-2 w-80 max-w-full"
                    />
                </div>
            </motion.div>

            {/* Blog grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {blogs.map((blog) => (
                    <motion.div
                    {...getSectionAnim({ direction: "", delay: 0.2 })}
                        key={blog.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/blogs/${blog.slug}`)}
                    >
                        {/* Cover image */}
                        <div className="overflow-hidden rounded-lg">
                            <img
                                src={`/api/media?url=${encodeURIComponent(blog.coverImage as string)}`}
                                alt={blog.title}
                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                        </div>

                        {/* Category */}
                        {/* Category */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {blog.tags?.map((tag, idx) => (
                                <span
                                    key={idx} // ✅ add key
                                    className="text-xs font-medium text-white bg-stone-800 px-2 py-1 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>



                        {/* Title */}
                        <h2 className="mt-2 text-lg font-semibold text-stone-800 group-hover:text-stone-600">
                            {blog.title}
                        </h2>

                        {/* Meta info */}
                        <p className="text-xs text-gray-500">
                            {new Date(blog.date).toLocaleDateString()} • 2 min read
                        </p>

                        {/* Excerpt */}
                        <p className="mt-1 text-sm text-gray-600">{blog.excerpt}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
