/* eslint-disable @next/next/no-img-element */
// ImageNode.tsx
import {
    DecoratorNode,
    LexicalEditor,
    NodeKey,
    SerializedLexicalNode,
    LexicalNode,
} from 'lexical';
import { JSX, useMemo } from 'react';


type Alignment = 'left' | 'center' | 'right';

export type SerializedImageNode = {
    src: string;
    altText?: string;
    alignment?: Alignment;
    type: 'image';
    version: 1;
} & SerializedLexicalNode;




interface ImageProps {
    src: string;
    altText?: string;
    alignment?: Alignment;
    widthClass?: string;
}

export default function ImageComponent({
    src,
    altText,
    alignment = "center",
    widthClass = "w-1/2",
}: ImageProps) {
    // ensure we send only the filename to the API
    const name = src.replace(/^\/+/, "").split("/").pop() || src;

    const alignClass = useMemo(() => {
        switch (alignment) {
            case "left":
                return "float-left mr-4";     // float and add margin
            case "right":
                return "float-right ml-4";
            default:
                return "mx-auto block";       // centered block
        }
    }, [alignment]);

    const baseClass = "my-4 max-w-full rounded";
    const finalClass = `${baseClass} ${alignClass} ${widthClass}`;
    const updatedSrc = name.startsWith('/api/media?url=')
        ? name
        : name.includes('media?url=')
            ? `/api/media?url=${name.split('media?url=')[1]}` // keep existing encoding
            : `/api/media?url=${encodeURIComponent(name)}`;

    return (
        <img
            src={updatedSrc}
            alt={altText || ""}
            className={finalClass}
            style={{ height: "auto" }}
        />
    );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __alignment: Alignment;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__alignment, node.__key);
    }

    constructor(src: string, altText: string, alignment: Alignment = 'center', key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__alignment = alignment;
    }

    createDOM(): HTMLElement {
        const img = document.createElement('span');
        return img;
    }

    updateDOM(): false {
        return false;
    }

    __getImageClass(): string {
        const alignClass = {
            left: 'float-left',
            center: 'mx-auto block',
            right: 'float-right',
        }[this.__alignment];
        return `my-4 max-w-full rounded ${alignClass}`;
    }

    decorate(): JSX.Element {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                alignment={this.__alignment}
            />
        );
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'image',
            version: 1,
            src: this.__src,
            altText: this.__altText,
            alignment: this.__alignment,
        };
    }

    exportDOM(): { element: HTMLElement } {
        const img = document.createElement('img');
        img.setAttribute('src', this.__src);
        img.setAttribute('alt', this.__altText);
        img.setAttribute('crossorigin', 'anonymous');
        img.className = this.__getImageClass();
        return { element: img };
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { src, altText, alignment = 'center' } = serializedNode;
        return new ImageNode(src, altText ?? '', alignment);
    }

    setAlignment(align: Alignment, editor: LexicalEditor) {
        const writable = this.getWritable();
        if (writable.__alignment === align) return;

        // Replace with a new instance (forces re-render)
        editor.update(() => {
            const newNode = new ImageNode(this.__src, this.__altText, align);
            this.replace(newNode);
        });
    }
}

export function $createImageNode(src: string, altText = '', alignment: Alignment = 'center'): ImageNode {
    return new ImageNode(src, altText, alignment);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}
