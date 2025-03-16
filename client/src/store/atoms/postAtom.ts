import { atom } from "recoil";
import { Post } from "../../types";

export const postAtom = atom<Post[]>({
    key: 'postAtom',
    default: []
});