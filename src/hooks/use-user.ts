import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserData {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  role?: string;
  [key: string]: any;
}

export function useUser() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (!session) {
      setIsAuthorized(false);
      setLoading(false);
      router.replace("/login");
    } else {
      try {
        const user = JSON.parse(session);
        setUserData(user);
        setIsAuthorized(true);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem("userSession");
        setIsAuthorized(false);
        setLoading(false);
        router.replace("/login");
      }
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("userSession");
    setUserData(null);
    setIsAuthorized(false);
    router.replace("/login");
  };

  const updateSession = (newData: UserData) => {
    setUserData(newData);
    localStorage.setItem("userSession", JSON.stringify(newData));
  };

  return { userData, loading, isAuthorized, logout, updateSession };
}
