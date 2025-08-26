import { BaseEntity, URLString, SlugString } from "./common";

export interface Contribution extends BaseEntity {
    title: string;
    slug?: SlugString;
    excerpt?: string;
    coverImage?: string;
    href?: URLString;
    priority?: number;
}

export interface ContributionsDataset {
    contributions: Contribution
}
