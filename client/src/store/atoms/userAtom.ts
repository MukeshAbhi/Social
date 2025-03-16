import { atom } from "recoil";
import { User } from "../../types";

export interface UserAtomType {
    user: User | null;
    edit: boolean;
}

const storedUser = localStorage.getItem("user");

export const userAtom = atom<UserAtomType>({
    key:'userAtom',
    default: {
    user: storedUser ? JSON.parse(storedUser) : {},
        edit: false,
    },
});


