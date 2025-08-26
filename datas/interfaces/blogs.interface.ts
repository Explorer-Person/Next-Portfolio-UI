import { BaseEntity, SlugString, URLString } from "./common";

export interface Blog extends BaseEntity {
    title: string;
    slug?: SlugString;
    excerpt?: string;
    html?: string;
    jsonModel?: string;
    coverImage?: string;
    medias?: string[];
    tags?: string[];
    href?: URLString;
    priority?: number;
    date: string;
}

export interface BlogContentImageNode {
    type: "image";
    version: number;
    src: string;
    altText: string;
    alignment: "left" | "center" | "right";
}

export interface BlogContentTextNode {
    type: "text";
    version: number;
    detail: number;
    format: number;
    mode: string;
    style: string;
    text: string;
}

export type BlogContentChildNode = BlogContentImageNode | BlogContentTextNode | BlogContentHeading | BlogContentParagraph;

export interface BlogContentHeading {
    type: "heading";
    version: number;
    tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    direction: "ltr" | "rtl";
    format: string;
    indent: number;
    children: BlogContentChildNode[];
}

export interface BlogContentParagraph {
    type: "paragraph";
    version: number;
    direction: "ltr" | "rtl";
    format: string;
    indent: number;
    children: BlogContentTextNode[]; // only text allowed in paragraph
    textFormat: number;
    textStyle: string;
}

export type BlogContentBlock = BlogContentHeading | BlogContentParagraph;

export interface BlogContentRoot {
    type: "root";
    version: number;
    direction: "ltr" | "rtl";
    format: string;
    indent: number;
    children: BlogContentBlock[];
}

export interface BlogContent {
    replace(arg0: RegExp, arg1: string): unknown;
    root: BlogContentRoot;
}

export interface BlogsDataset {
    blogs: Blog[];
}