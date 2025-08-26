export interface BaseEntity {
    id: string;
    _id?:string | undefined;
    fk: string;
}

export type URLString = string;
export type SlugString = string;