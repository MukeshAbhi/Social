import { atom } from "recoil";
import { Post } from "../../types";
import { posts } from "../../assets/data";

const defaultPost = posts;

export const postAtom = atom<Post[]>({
    key: 'postAtom',
    default: []
});