import { useEffect, useState } from "react";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await fetch("http://localhost:8080/users");
        const data = await response.json();
        setUsers(data);
    };

    const addUser = async () => {
        const response = await fetch("http://localhost:8080/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });
        if (response.ok) {
            setName("");
            setEmail("");
            fetchUsers();
        }
    };

    const deleteUser = async (id) => {
        await fetch(`http://localhost:8080/users/${id}`, { method: "DELETE" });
        fetchUsers();
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 mr-2 rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 mr-2 rounded"
                />
                <button
                    onClick={addUser}
                    className="bg-blue-500 text-white p-2 rounded">
                    Add User
                </button>
            </div>
            <ul>
                {users.map(user => (
                    <li key={user.id} className="flex justify-between items-center border-b p-2">
                        {user.name} ({user.email})
                        <button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-500 text-white p-2 rounded">
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
