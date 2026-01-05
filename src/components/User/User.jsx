import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";
import "./User.css";

const CreateUser = ({ isOpen, onClose, onCreated }) => {
    const [createUser, setCreateUser] = useState({ firstName: "", lastName: "", emailId: "",password:"", contactNo:"", address:"", roleId: "", status: 0 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...createUser,
                role: (createUser.roleId ? { roleId: Number(createUser.roleId) } : undefined),
                status: createUser.status ? 1 : 0
            };
            const res = await api.post('/api/v1/user/create', payload);
            setCreateUser({ firstName: "", lastName: "", emailId: "",password:"", contactNo:"", address:"", roleId: "", status: 1 });
            if (onCreated) onCreated(res?.data ?? res);
            if (onClose) onClose();
        } catch (err) {
            console.error('Error creating user:', err);
            const msg = err?.response?.data?.message || err?.message || 'Error while creating user.';
            setError(String(msg));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="clean-modal" onClick={(e) => e.stopPropagation()}>
                <div className="clean-modal-header">
                    <h3>Create User</h3>
                    <button className="clean-close-btn" aria-label="Close" onClick={onClose}>&times;</button>
                </div>

                <form className="clean-modal-body" onSubmit={handleSubmit}>
                    <div className="clean-form-row">
                        <label htmlFor="createFirst">First Name</label>
                        <input id="createFirst" required type="text" value={createUser.firstName} onChange={(e) => setCreateUser({ ...createUser, firstName: e.target.value })} />
                    </div>

                    <div className="clean-form-row">
                        <label htmlFor="createLast">Last Name</label>
                        <input id="createLast" required type="text" value={createUser.lastName} onChange={(e) => setCreateUser({ ...createUser, lastName: e.target.value })} />
                    </div>

                    <div className="clean-form-row">
                        <label htmlFor="createEmail">Email</label>
                        <input id="createEmail" required type="email" value={createUser.emailId} onChange={(e) => setCreateUser({ ...createUser, emailId: e.target.value })} />
                    </div>

                    <div className="clean-form-row">
                        <label htmlFor="createRole">Role</label>
                        <input id="createRole" type="number" value={createUser.roleId} onChange={(e) => setCreateUser({ ...createUser, roleId: e.target.value })} />
                    </div>

                    <div className="clean-form-row">
                        <label>
                            <input type="checkbox" checked={createUser.status} onChange={(e) => setCreateUser({ ...createUser, status: e.target.checked })} />{' '}
                            Active
                        </label>
                    </div>

                    <div className="clean-modal-actions">
                        <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    </div>

                    {error && <div className="modal-error" role="alert">{error}</div>}
                </form>
            </div>
        </div>
    );
}

const User = () => {

    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [userName, setUserName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    const [updateUser, setUpdateUser] = useState({
        userId: "",
        firstName: "",
        lastName: "",
        emailId: "",
        contactNo: "",
        address: "",
        roleId: "",
        status: 1
    });

    const handleShowUser = async () => {
        console.log('Fetching users with params:', { page, size, userName });
        try {
            const response = await api.get(`/api/v1/user/fetchallusers`, {
                params: {
                    page,
                    size,
                    userName
                }
            });

            console.log("Response:", response.data);
            setUsers(response.data.userDTOs ?? response.data.userDTO ?? response.data.users ?? response.data ?? []);
        }
        catch (err) {
            console.error('Error fetching users:', err, err?.response?.data ?? err?.response?.status);
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.message || err?.response?.data || null;
            const friendly = serverMsg ? `${serverMsg}` : (err?.message || 'Unable to fetch users');
            setError(`Failed to fetch users${status ? ` (status ${status})` : ''}: ${friendly}`);
        }
    };

    useEffect(() => {
        handleShowUser();
    }, [page, size, userName]);

    const handleEditUser = async () => {
        setSaving(true);
        setModalError('');
        try {
            const payload = {
                ...updateUser,
                role: { roleId: Number(updateUser.roleId) },
                status: updateUser.status ? 1 : 0
            };
            const response = await api.put(`/api/v1/user/updateUser`, payload);
            setUpdateUser({ userId: "", firstName: "", lastName: "", emailId: "",contactNo: "", address:"", roleId: "", status: 1 });
            await handleShowUser();
            setIsEditing(false);
            setToastMessage('User saved');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2800);
        } catch (error) {
            console.error('Error updating user:', error);
            const msg = error?.response?.data?.message || error?.message || 'Error while updating user.';
            setModalError(String(msg));
            setError('Error while updating user.');
        } finally {
            setSaving(false);
        }
    }

    const handleEditClick = (u) => {
        setUpdateUser({
            userId: u.userId ?? u.id ?? '',
            firstName: u.firstName ?? '' ,
            lastName: u.lastName ?? '' ,
            emailId: u.emailId ?? u.email ?? '' ,
            contactNo: u.contactNo ?? u.contact ?? '',
            address: u.address ?? u.address ?? '',
            roleId: u.role?.roleId ?? u.roleId ?? '',
            status: (typeof u.status === 'boolean') ? u.status : (u.status ? 1 : 0)
        });
        setIsEditing(true);
    }

    const handleCancelEdit = () => {
        setUpdateUser({ userId: "", firstName: "", lastName: "", emailId: "",contactNo: "", address:"", roleId: "", status: 1 });
        setIsEditing(false);
    }

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/api/v1/user/delete/${id}`);
            handleShowUser();
            alert("User deleted successfully.");
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user. Please try again.");
            alert("Failed to delete user. Please try again.");
        }
    };

    return (
        <div className="user-container">
            {error && <p className="text-danger mt-2">{error}</p>}
            {!error && (!users || users.length === 0) && <p className="mt-4 text-slate-600">No users found.</p>}

            <div className="search-row">
                <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search users by name or email..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        aria-label="Search users"
                    />
                </div>

                <div style={{display:'flex', gap:8}}>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => { setError(''); handleShowUser(); }}>
                        Refresh
                    </button>
                    <button className="btn btn-sm btn-primary create-student-btn" onClick={() => setIsCreating(true)}>
                        <i className="bi bi-plus-lg"></i> Create User
                    </button>
                </div>
            </div>

            <table className="table table-bordered table-hover text-center" >
                <thead>
                    <tr>
                        <th>User Id</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) ? users.map((u, index) => (
                        <tr key={u.userId ?? u.id ?? index}>
                            <td>{u.userId ?? u.id ?? '—'}</td>
                            <td>{u.firstName ?? u.fname ?? '—'}</td>
                            <td>{u.lastName ?? u.lname ?? '—'}</td>
                            <td>{u.emailId ?? u.email ?? '—'}</td>
                            <td>{u.contactNo ?? u.contactNo ?? '_'}</td>
                            <td>{u.address ?? u.address ?? '_'}</td>
                            <td>
                                <span className={(u.status || u.status === 1) ? "active-dot" : "inactive-dot"}></span>
                                {(u.status || u.status === 1) ? ' Active' : ' Inactive'}
                            </td>
                            <td>{u.role?.roleName ?? u.roleName ?? '—'}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(u)}>
                                    <i className="bi bi-pencil-square"></i>
                                </button>

                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.userId ?? u.id)}>
                                    <i className="bi bi-trash"></i>
                                </button>

                            </td>
                        </tr>
                    )) : null}
                </tbody>
            </table>

            {isEditing && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleCancelEdit}>
                    <div className="clean-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="clean-modal-header">
                            <h3>Edit User</h3>
                            <button className="clean-close-btn" aria-label="Close" onClick={handleCancelEdit}>&times;</button>
                        </div>

                        <form className="clean-modal-body" onSubmit={(e) => { e.preventDefault(); handleEditUser(); }}>
                            <div className="clean-form-row">
                                <label htmlFor="editFirst">First Name</label>
                                <input id="editFirst" required type="text" value={updateUser.firstName || ''} onChange={(e) => setUpdateUser({ ...updateUser, firstName: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label htmlFor="editLast">Last Name</label>
                                <input id="editLast" required type="text" value={updateUser.lastName || ''} onChange={(e) => setUpdateUser({ ...updateUser, lastName: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label htmlFor="editEmail">Email</label>
                                <input id="editEmail" required type="email" value={updateUser.emailId || ''} onChange={(e) => setUpdateUser({ ...updateUser, emailId: e.target.value })} />
                            </div>
                            
                            <div className="clean-form-row">
                                <label htmlFor="editContactNo">Contact No</label>
                                <input id="editContactNo" required type="number" value={updateUser.contactNo || ''} onChange={(e) => setUpdateUser({ ...updateUser, contactNo: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label htmlFor="editAddress">Address</label>
                                <input id="editAddress" required type="text" value={updateUser.address || ''} onChange={(e) => setUpdateUser({ ...updateUser, address: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label htmlFor="editRole">Role</label>
                                <input id="editRole" type="text" value={updateUser.roleId || ''} onChange={(e) => setUpdateUser({ ...updateUser, roleId: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label>
                                    <input type="checkbox" checked={!!updateUser.status} onChange={(e) => setUpdateUser({ ...updateUser, status: e.target.checked })} />{' '}
                                    Active
                                </label>
                            </div>

                            <div className="clean-modal-actions">
                                <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancelEdit} disabled={saving}>Cancel</button>
                            </div>

                            {modalError && (
                                <div className="modal-error" role="alert">{modalError}</div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <CreateUser
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                onCreated={async () => {
                    await handleShowUser();
                    setToastMessage('User created');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2800);
                    setIsCreating(false);
                }}
            />

            {showToast && (
                <div className="toast-notification" role="status" aria-live="polite">{toastMessage}</div>
            )}
        </div>
    );
}

export default User;