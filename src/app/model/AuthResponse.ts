import { User } from "./User";

export type AuthResponse = {
    token: string;
    user: User
}