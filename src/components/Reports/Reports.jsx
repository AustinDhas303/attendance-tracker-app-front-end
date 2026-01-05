import { useEffect, useState, useMemo } from "react";
import api from "../utils/api.jsx";
import { useNavigate } from "react-router-dom";
import "./Reports.css";

const Reports = () => {

    const [attendanceReport, setAttendanceReport] = useState([]);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [studentName, setStudentName] = useState("");
    const [reportType, setReportType] = useState("daily");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [department, setDepartment] = useState("");

    const currentYear = new Date().getFullYear();
    const monthOptions = [
        { value: '1', label: 'Jan' }, { value: '2', label: 'Feb' }, { value: '3', label: 'Mar' }, { value: '4', label: 'Apr' },
        { value: '5', label: 'May' }, { value: '6', label: 'Jun' }, { value: '7', label: 'Jul' }, { value: '8', label: 'Aug' },
        { value: '9', label: 'Sep' }, { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
    ];
    const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

    const handleShowDailyReport = async () => {
        try {
            const response = await api.get(`/api/v1/report/attendance/today`, {
                params: {
                    // page,
                    // size,
                    studentName,
                    // attendanceStatus,
                    department
                }
            });
            setAttendanceReport(response.data.attendanceDTOs ?? response.data.attendanceReport ?? response.data ?? []);
            console.log("Report Response:", response.data);
        }
        catch (error) {
            console.error("Unable to fetch report", error);
            setError("Unable to fetch attendance report.");
        }
    }

    useEffect(() => {
        const fetchReport = async () => {
            if (reportType === 'monthly') {
                if (!month || !year) {
                    setError('Please select month and year for monthly report.');
                    return;
                }
                setError('');
                await handleShowMonthlyReport();
            } else {
                setError('');
                await handleShowDailyReport();
            }
        };
        fetchReport();
    }, [page, size, studentName, reportType, department, month, year]);

    const handleShowMonthlyReport = async () => {
        if (!month || !year) {
            setError('Please select month and year for monthly report.');
            return;
        }
        try {
            setError('');
            const response = await api.get(`/api/v1/report/attendance/monthly-report`, {
                params: {
                    // page,
                    // size,
                    // studentName,
                    department,
                    month,
                    year
                }
            });
            setAttendanceReport(response.data.attendanceDTOs ?? response.data.attendanceReport ?? response.data ?? []);
            console.log("Report Response:", response.data);
        }
        catch (error) {
            console.error("Unable to fetch report", error);
            setError("Unable to fetch attendance report.");
        }
    }



    // Group attendance by student to render one row per student with period columns
    // const groupedAttendance = useMemo(() => {
    //     const grouped = new Map();
    //     attendanceReport.forEach(att => {
    //         const id = att?.studentId ?? att?.student?.studentId ?? att?.student;
    //         if (!grouped.has(id)) {
    //             grouped.set(id, {
    //                 studentId: att?.studentId ?? att?.student?.studentId ?? '—',
    //                 studentName: att?.studentName ?? att?.student?.studentName ?? '—',
    //                 rollNo: att?.rollNo ?? att?.student?.rollNo ?? '—',
    //                 department: att?.department ?? att?.student?.department ?? '—',
    //                 attendancePercentage: att?.attendancePercentage ?? null,
    //                 periods: Array(8).fill('—'),
    //                 latestDate: null
    //             });
    //         }
    //         const item = grouped.get(id);
    //         // Populate period statuses from the `periodStatus` object (keys as strings '1'..'8')
    //         for (let p = 1; p <= 8; p++) {
    //             const status = att?.periodStatus?.[String(p)];
    //             if (status) item.periods[p - 1] = status;
    //         }
    //         if (att?.date) {
    //             if (!item.latestDate || new Date(att.date) > new Date(item.latestDate)) item.latestDate = att.date;
    //         }
    //     });
    //     return Array.from(grouped.values());
    // }, [attendanceReport]);

    const monthlyRows = useMemo(() => {
        const rows = [];

        attendanceReport.forEach(student => {
            student?.dailyAttendance?.forEach(day => {

                const periods = Array(8).fill("—");

                Object.entries(day.periodStatus || {}).forEach(([p, status]) => {
                    periods[Number(p) - 1] = status;
                });

                rows.push({
                    studentId: student.studentId,
                    studentName: student.studentName,
                    rollNo: student.rollNo,
                    department: student.department,
                    date: day.date,
                    percentage: student.monthlyPercentage || student.attendancePercentage,
                    periods
                });
            });
        });

        return rows;
    }, [attendanceReport]);



    return (
        <div className="report-container">
            <div className="report-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div className="input-group" style={{ maxWidth: 420 }}>
                    <span className="input-group-text" aria-hidden="true"><i className="bi bi-search" /></span>
                    <input type="text" className="form-control" placeholder="Search students by name..." value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                </div>

                <select className="form-select" style={{ width: 160 }} value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="daily">Daily report</option>
                    <option value="monthly">Monthly report</option>
                </select>

                {reportType === 'monthly' && (
                    <>
                        <select className="form-select" style={{ width: 140 }} value={month} onChange={(e) => setMonth(e.target.value)}>
                            <option value="">Month</option>
                            {monthOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        <select className="form-select" style={{ width: 110 }} value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value="">Year</option>
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </>
                )}

                <input type="text" className="form-control" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: 160 }} />

                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                        if (reportType === 'monthly') {
                            if (!month || !year) {
                                setError('Please select month and year for monthly report.');
                                return;
                            }
                            handleShowMonthlyReport();
                        } else {
                            handleShowDailyReport();
                        }
                    }}
                >
                    Refresh
                </button>
            </div>

            {error && <div className="text-danger mb-2">{error}</div>}

            <table className="table table-bordered table-hover text-center">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Roll No</th>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <th key={i}>{i + 1}</th>
                        ))}
                        <th>Date</th>
                        <th>Percentage</th>
                        <th>Department</th>
                    </tr>
                </thead>
                <tbody>
                    {/* {Array.isArray(groupedAttendance) && groupedAttendance.length > 0 ? groupedAttendance.map((row, index) => (
                        <tr key={row?.studentId ?? index}>
                            <td>{row?.studentId ?? '—'}</td>
                            <td>{row?.studentName ?? '—'}</td>
                            <td>{row?.rollNo ?? '—'}</td>

                            {row.periods.map((status, i) => (
                                <td key={i}>{status}</td>
                            ))}

                            <td>{row.latestDate ?? '—'}</td>
                            <td>{row.monthlyPercentage ?? row.attendancePercentage ?? '--'}</td>
                            <td>{row?.department ?? '—'}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={13} className="text-muted py-6">No attendance records found. Click <strong>Refresh</strong> to fetch.</td>
                        </tr>
                    )} */}

                    {monthlyRows.length > 0 ? monthlyRows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.studentId}</td>
                            <td>{row.studentName}</td>
                            <td>{row.rollNo}</td>

                            {row.periods.map((status, i) => (
                                <td key={i}
                                    className={
                                        status === "PRESENT" ? "text-success fw-bold" :
                                            status === "ABSENT" ? "text-danger fw-bold" : ""
                                    }>
                                    {status === "PRESENT" ? "P" :
                                        status === "ABSENT" ? "A" : "—"}
                                </td>
                            ))}

                            <td>{row.date ?? "—"}</td>
                            <td>{row.percentage ?? "--"}%</td>
                            <td>{row.department}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={13} className="text-muted py-4">
                                No attendance records found
                            </td>
                        </tr>
                    )}

                </tbody>
            </table>
        </div>
    );
}

export default Reports;