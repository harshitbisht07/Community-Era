import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../context/useAuthContext";

const AdminUsers = () => {
  const { user, loading } = useAuthContext();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Not authorized");
    }
  };

  const makeAdmin = async (id) => {
    try {
      await axios.patch(`/api/admin/users/${id}/make-admin`);
      fetchUsers();
    } catch (err) {
      alert("Action not allowed");
    }
  };

  useEffect(() => {
    if (!loading && user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      {users.map((u) => (
        <div key={u._id} className="flex justify-between mb-2">
          <span>
            {u.username} — <b>{u.role}</b>
          </span>

          {u.role === "user" && (
            <button
              onClick={() => makeAdmin(u._id)}
              className="bg-blue-600 text-white px-2 rounded"
            >
              Make Admin
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;
