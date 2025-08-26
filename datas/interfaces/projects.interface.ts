import { BaseEntity, URLString, SlugString } from "./common";

export interface Project extends BaseEntity {
    href?: string;
    title: string;
    slug?: SlugString;
    description?: string;
    coverImage?: URLString;
    medias?: URLString[];
    gitLink?: URLString;
    prodLink?: URLString;
    tags?: string[];
    priority?: number;
}

export interface ProjectsDataset {
    projects: Project[];
}
