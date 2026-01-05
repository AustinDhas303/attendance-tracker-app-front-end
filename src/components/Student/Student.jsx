import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";
import CreateStudent from "./CreateStudent";
import "./Student.css";
const Student = () => {

    const [student, setStudent] = useState([]);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [studentName, setStudentName] = useState("");
    const [createCategory, setCreateCategory] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState(''); const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');
    const [updateStudent, setUpdateStudent] = useState({
        studentId: "",
        studentName: "",
        rollNo: "",
        department: ""
    });

    const handleShowStudent = async () => {
        try {
            const response = await api.get(
                `/api/v1/student/fetch`, {
                params: {
                    page,
                    size,
                    studentName
                }
            }
            );

            console.log("Response:", response.data);
            setStudent(response.data.studentDTOs ?? []);
        }
        catch (err) {
            setError("Error while fetching users.");
        }
    };

    useEffect(() => {
        handleShowStudent();
    }, [page, size, studentName]);

    const handleEditStudent = async () => {
        setSaving(true);
        setModalError('');
        try {
            console.log('Updating student with payload:', updateStudent);
            const response = await api.put(`/api/v1/student/update`, updateStudent);
            console.log('Update response:', response);
            setUpdateStudent({
                studentId: "",
                studentName: "",
                rollNo: "",
                department: ""
            });
            handleShowStudent();
            setIsEditing(false);
            setToastMessage('Student saved');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2800);
        } catch (error) {
            console.error('Error updating student:', error);
            const msg = error?.response?.data?.message || error?.response?.data || error?.message || 'Error while updating student.';
            setModalError(String(msg));
            setError('Error while updating student.');
        } finally {
            setSaving(false);
        }
    }

    const handleEditClick = (stud) => {
        setUpdateStudent({
            studentId: stud.studentId,
            studentName: stud.studentName,
            rollNo: stud.rollNo,
            department: stud.department
        });
        setIsEditing(true);
    }

    const handleCancelEdit = () => {
        setUpdateStudent({
            studentId: "",
            studentName: "",
            rollNo: "",
            department: ""
        });
        setIsEditing(false);
    }

    const handleDeleteStudent = async (id) => {
        try {
            await api.delete(`/api/v1/student/delete/${id}`);
            handleShowStudent();
            alert("Student deleted successfully.");
        } catch (err) {
            console.error("Error deleting student:", err);
            setError("Failed to delete student. Please try again.");
            alert("Failed to delete student. Please try again.");
        }
    };

    return (
        <div className="student-container">
            {/* <h2 className="text-2xl font-semibold">Student</h2> */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {!error && (!student || student.length === 0) && <p className="mt-4 text-slate-600">No students found.</p>}
            <div className="search-row">
                <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search students by name..."
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        aria-label="Search students"
                    />
                </div>

                <button className="btn btn-sm btn-primary create-student-btn" onClick={() => setIsCreating(true)}>
                    <i className="bi bi-plus-lg"></i> Create Student
                </button>
            </div>

            <table className="table table-bordered table-hover text-center" >
                <thead>
                    <tr>
                        <th>Student Id</th>
                        <th>Student Name</th>
                        <th>Roll No</th>
                        <th>Department</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(student) ? student.map((stud, index) => (
                        <tr key={index}>
                            <td>{stud?.studentId}</td>
                            <td>{stud?.studentName}</td>
                            <td>{stud?.rollNo}</td>
                            <td>{stud?.department}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(stud)}>
                                    <i className="bi bi-pencil-square"></i>
                                </button>

                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteStudent(stud.studentId)}>
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
                            <h3>Edit Student</h3>
                            <button className="clean-close-btn" aria-label="Close" onClick={handleCancelEdit}>&times;</button>
                        </div>

                        <form className="clean-modal-body" onSubmit={(e) => { e.preventDefault(); handleEditStudent(); }}>
                            <div className="clean-form-row">
                                <label htmlFor="editStudentName">Student Name</label>
                                <input id="editStudentName" required type="text" value={updateStudent.studentName || ''} onChange={(e) => setUpdateStudent({ ...updateStudent, studentName: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label htmlFor="editRollNo">Roll No</label>
                                <input id="editRollNo" required type="text" value={updateStudent.rollNo || ''} onChange={(e) => setUpdateStudent({ ...updateStudent, rollNo: e.target.value })} />
                            </div>

                            <div className="clean-form-row">
                                <label htmlFor="editDept">Department</label>
                                <input id="editDept" type="text" value={updateStudent.department || ''} onChange={(e) => setUpdateStudent({ ...updateStudent, department: e.target.value })} />
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

            <CreateStudent
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                onCreated={() => {
                    handleShowStudent();
                    setToastMessage('Student created');
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

export default Student;