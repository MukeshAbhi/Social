import { selector } from "recoil";
import { themeAtom } from "../atoms/themeAtom";

// to update the theme
export const themeSelector = selector({
    key: "themeSelector",
    get: ({get}) => get(themeAtom),
    set: ({set}, newValue) => {
        if(typeof newValue === "string") {
            localStorage.setItem('theme', newValue);
            set(themeAtom, newValue);
        }
    }
})