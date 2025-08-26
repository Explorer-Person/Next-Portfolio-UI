import { BaseEntity, URLString } from "./common";

export interface Hero extends BaseEntity {
    title?: string;
    desc?: string;
    coverImage?: URLString;
    priority?: number;
}

export interface HeroDataset {
    hero: Hero;
}
