'use client';

import {
    $getSelection,
    $createParagraphNode,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
} from 'lexical';
import {
    $createHeadingNode,
    $isHeadingNode,
    HeadingTagType,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState, useRef } from 'react';
import { $createImageNode, $isImageNode } from '@/components/nodes/ImageNode';


export function Toolbar() {
    const [editor] = useLexicalComposerContext();
    const [heading, setHeading] = useState<string | undefined>('h1');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;

                const anchorNode = selection.anchor.getNode();
                const element = anchorNode.getTopLevelElementOrThrow();

                if ($isHeadingNode(element)) {
                    setHeading(element.getTag()); // "h1", "h2", etc.
                } else {
                    setHeading('paragraph');
                }
            });
        });
    }, [editor]);


    // helper (place above your component or inside the same file)
    function sanitizeBaseName(name: string) {
        return name
            .toLowerCase()
            .replace(/\.[^/.]+$/, "")      // strip extension
            .replace(/[^a-z0-9-_]+/g, "_") // non-allowed -> "_"
            .replace(/^_+|_+$/g, "_")      // trim leading/trailing "_"
            .replace(/_+/g, "_");          // collapse multiple "_"
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        // client-side guard
        if (!file.type.startsWith("image/")) {
            console.error("Only image files are allowed.");
            input.value = "";
            return;
        }

        // Build desired filename: media-<base>-<unique>.<ext>
        const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".png").toLowerCase();
        const base = sanitizeBaseName(file.name || "image");
        const unique =
            (typeof crypto !== "undefined" && "randomUUID" in crypto)
                ? (crypto.randomUUID() as string).split("-")[0]
                : Math.random().toString(36).slice(2, 8);
        const desiredName = `media-${base}-${unique}${ext}`;

        const formData = new FormData();
        formData.append("image", file);
        // Optional hints for your backend:
        formData.append("desiredName", desiredName);
        formData.append("scope", "blog");

        let res: Response;
        try {
            res = await fetch(`/api/upload`, { method: "POST", body: formData });
        } catch (err) {
            console.error("Upload request failed", err);
            input.value = "";
            return;
        }

        if (!res.ok) {
            console.error("Upload failed", res.status, await res.text().catch(() => ""));
            input.value = "";
            return;
        }

        // Server should return: { ok: true, fileName: "...", url?: "https://..." }
        const json = await res.json();
        const serverFileName: string | undefined = json?.fileName;
        const serverUrl: string | undefined = json?.url;

        const finalFileName = (serverFileName ?? desiredName).replace(/[^a-zA-Z0-9-_.]/g, "_");
        const publicUrl = serverUrl || `/upload/blog/${finalFileName}`;

        console.log(`Image uploaded -> ${publicUrl}`);

        editor.update(() => {
            const imageNode = $createImageNode(publicUrl, finalFileName, "center");
            const paragraphNode = $createParagraphNode();
            const selection = $getSelection();
            if (selection && $isRangeSelection(selection)) {
                selection.insertNodes([imageNode, paragraphNode]);
            }
        });

        // allow re-selecting same file immediately
        input.value = "";
    };

    const alignSelectedImage = (align: 'left' | 'center' | 'right') => {
        editor.update(() => {
            const selection = $getSelection();
            if (selection && $isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                for (const node of nodes) {
                    if ($isImageNode(node)) {
                        node.setAlignment(align, editor); // triggers replace
                    }
                }
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-4 mb-4 border-b pb-4">

            {/* TEXT CONTROLS */}
            <div className="flex items-center gap-2 border-r pr-4">
                <span className="text-sm font-semibold text-gray-500">Text</span>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                >
                    <strong>B</strong>
                </button>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                >
                    Left
                </button>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                >
                    Center
                </button>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                >
                    Right
                </button>
            </div>

            {/* HEADING CONTROLS */}
            <div className="flex items-center gap-2 border-r pr-4">
                <span className="text-sm font-semibold text-gray-500">Heading</span>
                <select
                    className="px-2 py-1 border rounded text-sm"
                    value={heading}
                    onChange={(e) => {
                        const value = e.target.value;
                        setHeading(value);
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                if (value === 'paragraph') {
                                    $setBlocksType(selection, () => $createParagraphNode());
                                } else {
                                    const tag = value as HeadingTagType; // 👈 Fix type here
                                    $setBlocksType(selection, () => $createHeadingNode(tag));
                                }
                            }
                        });
                    }}
                >
                    <option value="paragraph">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                </select>
            </div>


            {/* IMAGE CONTROLS */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">Image</span>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => alignSelectedImage('left')}
                >
                    🖼 Left
                </button>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => alignSelectedImage('center')}
                >
                    🖼 Center
                </button>
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => alignSelectedImage('right')}
                >
                    🖼 Right
                </button>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                />
                <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                >
                    🖼 Upload
                </button>
            </div>

        </div>

    );
}
