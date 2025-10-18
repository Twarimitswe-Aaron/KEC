import { createContext, type Dispatch, type SetStateAction } from "react";

export const SearchContext = createContext<{
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}>({
    searchQuery: "",
    setSearchQuery: (_value: SetStateAction<string>) => {}
});