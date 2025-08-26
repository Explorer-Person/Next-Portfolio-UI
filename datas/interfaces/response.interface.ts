import {
    BlogsDataset,
    ContactsDataset,
    ProjectsDataset,
    ContributionsDataset,
    HeroDataset,
    ProfileImageDataset,
    QualificationsDataset,
    SocialsDataset,
    TechStacksDataset, 
} from "@/datas/interfaces";

export type ApiDataUnion =
    | BlogsDataset
    | ContactsDataset
    | ProjectsDataset
    | ContributionsDataset
    | HeroDataset
    | ProfileImageDataset
    | QualificationsDataset
    | SocialsDataset
    | TechStacksDataset;

export type Resource =
    | "blogs" | "contacts" | "projects" | "contributions"
    | "hero" | "profileImage" | "qualifications" | "socials" | "techSkills";

export default interface ResponseInterface {
    status: number;
    msg: string;
    resource: Resource;
    data: ApiDataUnion;
}
