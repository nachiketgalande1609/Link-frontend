import { createContext, useState, useEffect, ReactNode, useContext } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    profile_picture_url: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    unreadNotificationsCount: number | null;
    setUnreadNotificationsCount: (count: number | null) => void;
    resetNotificationsCount: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number | null>(null);

    const resetNotificationsCount = () => {
        setUnreadNotificationsCount(null);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                unreadNotificationsCount,
                setUnreadNotificationsCount,
                resetNotificationsCount,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
