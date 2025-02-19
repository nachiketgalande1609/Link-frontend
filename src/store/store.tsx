import { create } from "zustand";

interface User {
    id: string;
    username: string;
    email: string;
    profile_picture_url: string;
}

interface globalStoreState {
    user: User | null;
    unreadNotificationsCount: number | null;
    unreadMessagesCount: number | null;
    setUser: (user: User | null) => void;
    setUnreadNotificationsCount: (count: number | null) => void;
    setUnreadMessagesCount: (count: number | null) => void;
    resetNotificationsCount: () => void;
}

export const useGlobalStore = create<globalStoreState>((set) => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    unreadNotificationsCount: null,
    unreadMessagesCount: null,
    setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user });
    },
    setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
    setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),
    resetNotificationsCount: () => set({ unreadNotificationsCount: null }),
}));
