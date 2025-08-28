import Link from "next/link";
import Head from "next/head";

export function ComingSoon() {
    return (
        <>
            <Head>
                <title>Page in Development</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className="min-h-[70vh] w-full bg-white text-stone-900 flex items-center justify-center px-6">
                <div className="max-w-xl w-full text-center">
                    <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-stone-100">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087a5.25 5.25 0 11-4.5 0M8.25 6h7.5M3 21l4.5-4.5M14.25 9.75l6.75 6.75" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                        This page is in development
                    </h1>
                    <p className="mt-3 text-[15px] leading-7 text-stone-600">
                        We’re crafting this section. Please check back soon.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-stone-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-black/90 transition">← Back to Home</Link>
                        <Link href="/projects" className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium ring-1 ring-stone-300 text-stone-800 hover:bg-stone-50 transition">View Projects</Link>
                    </div>
                </div>
            </main>
        </>
    );
}
