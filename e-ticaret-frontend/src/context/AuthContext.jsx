import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// ... diğer importlar
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null); // 🔥 Eklendi
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user"); // 🔥 Eklendi

    if (token) {
      setIsAuthenticated(true);
      setRole(storedRole);
      setUser(storedUser); // 🔥 Eklendi
    }
    setLoading(false);
  }, []);

  const login = (token, userRole, userEmail) => { // 🔥 userEmail parametresi eklendi
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    localStorage.setItem("user", userEmail); // 🔥 Kaydet
    setIsAuthenticated(true);
    setRole(userRole);
    setUser(userEmail); // 🔥 State'e yaz
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}