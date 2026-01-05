import { useEffect, useState } from "react";
import api from "../utils/api.jsx";

const Attendance = () => {

    const [error, setError] = useState('');
    const [saved, setSaved] = useState({});

    const [studentData, setStudentData] = useState([]);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(1000);
    const [studentName, setStudentName] = useState("");

    const [selectedPeriod, setSelectedPeriod] = useState(1);
    const [rowSelections, setRowSelections] = useState({});

    const handleCreateAttendance = async (studentId, status, period = selectedPeriod) => {
        if (!studentId) return;
        if (!status) return setError("Please select PRESENT or ABSENT before saving.");
        const savedFor = saved[studentId] || [];
        if (savedFor.includes(Number(period))) return setError(`Attendance for period ${period} already created for this student.`);

        const payload = {
            periodNo: Number(period),
            attendanceStatus: status,
            student: { studentId: Number(studentId) }
        };

        try {
            const response = await api.post(`/api/v1/attendance/create`, payload);
            console.log("Create attendance response:", response.data);
            setSaved(prev => {
                const arr = new Set(prev[studentId] || []);
                arr.add(Number(period));
                return { ...prev, [studentId]: Array.from(arr) };
            });
            setError("");
            setRowSelections(prev => ({ ...prev, [studentId]: '' }));
        }
        catch (error) {
            console.error("Unable to create attendance", error);
            setError("Unable to create attendance.");
        }
    }; 

    const handleShowStudent = async () => {
        try {
            const response = await api.get(`/api/v1/student/fetch`, {
                params: {
                    page,
                    size,
                    studentName
                }
            });
            setStudentData(response.data.studentDTOs ?? []);
            console.log("Student Response:", response.data);
        }
        catch (error) {
            console.error("Unable to fetch student data", error);
            setError("Unable to fetch student data.");
        }
    }

    useEffect(() => {
        handleShowStudent();
    }, [page, size, studentName]);


    useEffect(()=>{
        const map = {};
        (studentData || []).forEach(s => {
            const sid = s?.studentId;
            if(!sid) return;
            map[sid] = '';
        });
        setRowSelections(prev => ({ ...map, ...prev }));
    }, [studentData]);

    return (
        <div className="attendance-container">
            <div className="attendance-controls" style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
                <div className="input-group" style={{maxWidth:420}}>
                    <span className="input-group-text" aria-hidden="true"><i className="bi bi-search"/></span>
                    <input type="text" className="form-control" placeholder="Search students by name..." value={studentName} onChange={(e)=>setStudentName(e.target.value)} />
                </div>



                <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <label style={{margin:0,fontSize:13,color:'#666'}}>Period</label>
                    <select className="form-select" style={{width:84}} value={selectedPeriod} onChange={(e)=>setSelectedPeriod(Number(e.target.value))}>
                        {Array.from({length:8}).map((_,i)=>(<option key={i} value={i+1}>{i+1}</option>))}
                    </select>
                </div>

                <button className="btn btn-sm btn-primary" onClick={()=>{ handleShowStudent(); }}>Refresh</button> 
            </div>

            <div style={{fontSize:13,color:'#666',marginBottom:8}}>Only create attendance once per student per selected period. Saved rows will be disabled.</div>
            { error && <div className="text-danger mb-2">{error}</div> }

            <table className="table table-bordered table-hover text-center">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Roll No</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(studentData) && studentData.length > 0 ? studentData.map((stu, index) => {
                        const sid = stu?.studentId;

                        const current = rowSelections[sid] ?? '';
                        const isSaved = (saved[sid] || []).includes(Number(selectedPeriod));

                        return (
                            <tr key={sid ?? index}>
                                <td>{sid ?? '—'}</td>
                                <td>{stu?.studentName ?? '—'}</td>
                                <td>{stu?.rollNo ?? '—'}</td>
                                <td>{stu?.department ?? '—'}</td>

                                <td style={{minWidth:220}}>
                                    <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center'}}>
                                        <select className="form-select form-select-sm" style={{width:120}} value={current} disabled={isSaved} onChange={(e)=>setRowSelections(prev=>({ ...prev, [sid]: e.target.value }))}>
                                            <option value="">--</option>
                                            <option value="PRESENT">PRESENT</option>
                                            <option value="ABSENT">ABSENT</option>
                                        </select>
                                        <button className="btn btn-sm btn-primary" disabled={isSaved} onClick={()=>handleCreateAttendance(sid, rowSelections[sid] ?? current, selectedPeriod)}>{isSaved ? 'Saved' : 'Save'}</button>
                                    </div>
                                </td>
                            </tr>
                        );

                    }) : (
                        <tr>
                            <td colSpan={5} className="text-muted py-6">No students found. Click <strong>Refresh</strong> to fetch.</td>
                        </tr>
                    )}

                </tbody>
            </table>
        </div>
    );
}

export default Attendance;