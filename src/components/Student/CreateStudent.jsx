import { useState } from "react";
import api from "../utils/api.jsx";

const CreateStudent = ({ isOpen, onClose, onCreated }) => {
    const [createStudent, setCreateStudent] = useState({ studentName: "", department: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            console.log('Creating student:', createStudent);
            const res = await api.post('/api/v1/student/create', createStudent);
            console.log('Create response:', res?.data ?? res);
            setCreateStudent({ studentName: "", rollNo: "", department: "" });
            if (onCreated) onCreated(res?.data ?? res);
            if (onClose) onClose();
        } catch (err) {
            console.error('Error creating student:', err);
            const msg = err?.response?.data?.message || err?.message || 'Error while creating student.';
            setError(String(msg));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="clean-modal" onClick={(e)=>e.stopPropagation()}>
                <div className="clean-modal-header">
                    <h3>Create Student</h3>
                    <button className="clean-close-btn" aria-label="Close" onClick={onClose}>&times;</button>
                </div>

                <form className="clean-modal-body" onSubmit={handleSubmit}>
                    <div className="clean-form-row">
                        <label htmlFor="createStudentName">Student Name</label>
                        <input id="createStudentName" required type="text" value={createStudent.studentName} onChange={(e)=>setCreateStudent({...createStudent, studentName: e.target.value})} />
                    </div>

                    {/* <div className="clean-form-row">
                        <label htmlFor="createRollNo">Roll No</label>
                        <input id="createRollNo" required type="text" value={createStudent.rollNo} onChange={(e)=>setCreateStudent({...createStudent, rollNo: e.target.value})} />
                    </div> */}

                    <div className="clean-form-row">
                        <label htmlFor="createDept">Department</label>
                        <input id="createDept" type="text" value={createStudent.department} onChange={(e)=>setCreateStudent({...createStudent, department: e.target.value})} />
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

export default CreateStudent;