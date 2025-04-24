import { Stream } from "./Stream";

export type User = {
    id?: number;
    username: string;
    password?: string,
    email: string;
    streams?: Stream[];
}