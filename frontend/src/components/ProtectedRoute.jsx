import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRole, children }) {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("access_token");

    if (!token || !role || role !== allowedRole) {
      // Redirect to login if not logged in or role mismatch
      navigate("/login", { replace: true });
    } else {
      setIsAllowed(true);
    }
  }, [allowedRole, navigate]);

  // 🚫 Prevent rendering before auth check
  if (!isAllowed) return null;

  // ✅ Render protected content
  return children;
}
