import React, { useEffect, useState } from 'react'
import useGlobalStore from '../../store/global-store'
import { changeUserRole, changeUserStatus, changeUserType, getListUsers } from '../../api/User';
import Swal from 'sweetalert2';
import { getListHospitals } from '../../api/Hospitals';

const FormUsersManagement = () => {

    const user = useGlobalStore(state => state.user);
    const token = useGlobalStore(state => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listUsers, setListUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [listHospitals, setListHospitals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedZone, setSelectedZone] = useState('');
    // ✅ แสดงหน้าละ 10 รายการ
    const itemsPerPage = 10;

    const returnUserType = (user_type) => {
        switch (user_type) {
            case 'Unit_service':
                return 'ผู้ประเมินหน่วยบริการ'
            case 'Prov':
                return 'ผู้อนุมัติระดับจังหวัด'
            case 'Zone':
                return 'ผู้อนุมัติระดับเขตฯ'
            case 'Centre':
                return 'Admin ส่วนกลาง'
            default:
                return '-'
        }
    }

    useEffect(() => {
        // Fetch list users from API
        loadUsersData(token);
    }, []);

    // Get list users function
    const loadUsersData = async () => {
        try {
            setIsLoading(true);
            const res = await getListUsers(token);
            setListUsers(res.data);
            setSearchQuery(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = searchQuery.slice(firstIndex, lastIndex);

    // ✅ จำนวนหน้า
    const totalPages = Math.ceil(searchQuery.length / itemsPerPage);

    // ✅ ฟังก์ชันคลิกเลขหน้า
    const goToPage = (pageNum) => {
        if (pageNum < 1 || pageNum > totalPages) return;
        setCurrentPage(pageNum);
    }

    const getPageNumbers = () => {
        const pages = [];
        const total = totalPages;
        const current = currentPage;

        // === แสดงหน้าแรกเสมอ ===
        pages.push(1);

        // ถ้า current = 1 → เติมหน้าถัดไปเลย
        if (current === 1) {
            if (total > 1) pages.push(2);
            if (total > 2) pages.push(3);
            if (total > 4) pages.push("...");
            if (total > 3) pages.push(total);
            return pages;
        }

        // === ถ้า current > 2 → ใส่ "..." หลังเลข 1 ===
        if (current > 3) {
            pages.push("...");
        }

        // === หน้ากลาง: current-1, current, current+1 ===
        for (let p = current - 1; p <= current + 1; p++) {
            if (p > 1 && p < total) {
                pages.push(p);
            }
        }

        // === ถ้า current < total-2 → ใส่ ... ก่อนเลขท้าย ===
        if (current < total - 2) {
            pages.push("...");
        }

        // === เลขท้ายเสมอ (หาก total > 1) ===
        if (total > 1) {
            pages.push(total);
        }

        return pages;
    };


    // Handle change status user
    const handleChangeStatus = async (e, userId) => {
        const newStatus = e.target.checked;
        const values = {
            id: userId,
            enabled: newStatus
        }

        try {
            const res = await changeUserStatus(token, values);

            Swal.fire({
                title: "📢 แจ้งผลการเปลี่ยนสถานะผู้ใช้งาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

            // Reload list users
            loadUsersData(token);
        } catch (err) {
            console.log(err);
        }


    }

    // Handle change user type
    const userTypeOption = [
        { value: "Centre", label: "Admin ส่วนกลาง" },
        { value: "Unit_service", label: "ผู้ประเมินหน่วยบริการ" },
        { value: "Prov", label: "ผู้อนุมัติระดับจังหวัด" },
        { value: "Zone", label: "ผู้อนุมัติระดับเขตฯ" }
    ]

    const handleChangeUserType = async (e, userId) => {
        const newUserType = e.target.value;
        const values = {
            id: userId,
            user_type: newUserType
        }

        try {
            const res = await changeUserType(token, values);

            Swal.fire({
                title: "📢 แจ้งผลการเปลี่ยนประเภทผู้ใช้งาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

            // Reload list users
            loadUsersData(token);
        } catch (err) {
            console.log(err);
        }
    };

    // Handle change role user
    const roleOptions = [
        { value: "user", label: "ผู้ใช้งานทั่วไป" },
        { value: "admin", label: "ผู้ดูแลระบบ" }
    ];

    const handleChangeRole = async (e, userId) => {
        const newRole = e.target.value;
        const values = {
            id: userId,
            role: newRole
        }

        try {
            const res = await changeUserRole(token, values);

            Swal.fire({
                title: "📢 แจ้งผลการเปลี่ยนสิทธิ์ผู้ใช้งาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

            // Reload list users
            loadUsersData(token);
        } catch (err) {
            console.log(err);
        }
    };

    // Handle filter text
    const handlaFilterText = (e) => {
        setSearchQuery(listUsers.filter(f => f.name_th.toLowerCase().includes(e.target.value) ||
            f.hname_th.toLowerCase().includes(e.target.value) ||
            f.position.toLowerCase().includes(e.target.value) ||
            f.province.toLowerCase().includes(e.target.value)
        ));
    }

    // Handle select search (zone)
    const handleSelectSearch = (e) => {
        const selectedZone = e.target.value;
        setSelectedZone(selectedZone);
        setSearchQuery(listUsers.filter(f => f.zone === selectedZone || selectedZone === ""));
    }

    useEffect(() => {
        if (!selectedZone) return;

        loadListHospitals(selectedZone)
    }, [selectedZone]);

    const loadListHospitals = async (selectedZone) => {
        try {
            const res = await getListHospitals(token);
            const data = res.data;
            const filtered = data.filter(f => Number(f.zone) === Number(selectedZone))
            setListHospitals(filtered);
        } catch (err) {
            console.log(err);
        }
    }

    const handleSelectedProvince = (e) =>{
        const province = e.target.value;
        if (province) {
            setSearchQuery(listUsers.filter(f => f.province === province || province === ""));
        }else{
            setSearchQuery(listUsers.filter(f => f.zone === selectedZone || selectedZone === ""));
        }
    }

    const distinctProvince = Array.from(
        new Map(
            listHospitals
                .map(item => [
                    `${item.zone}-${item.province}`,
                    {zone: item.zone, province: item.province}
                ])
        ).values()
    )

    // console.log('P: ', distinctProvince)

    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>

                <div className='d-flex justify-content-center'>
                    <h3>จัดการสิทธิ์ผู้ใช้งาน (Users-Management)</h3>
                </div>

                {/* Search Bar && Total users */}
                <div className='d-flex justify-content-between align-items-center mt-3'>
                    {/* Total users */}
                    <div>
                        <span>จำนวนผู้ลงทะเบียนทั้งหมด: {listUsers.length} คน</span>
                    </div>
                    {/* Search bar */}
                    <div className='d-flex justify-content-between'>
                        {/* Zone select */}
                        <select
                            className="form-select form-select-sm mx-3 rounded-pill"
                            style={{ width: "250px" }}
                            onChange={handleSelectSearch}
                        >
                            <option value="">ทุกเขต</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    เขตสุขภาพที่ {i + 1}
                                </option>
                            ))}
                        </select>
                        {/* Zone select */}
                        <select
                            className="form-select form-select-sm mx-3 rounded-pill"
                            style={{ width: "250px" }}
                            disabled={!selectedZone}
                            onChange={handleSelectedProvince}
                        >
                            <option value="">--- เลือกจังหวัด ---</option>
                            {
                                distinctProvince && distinctProvince?.map((prov, idx) => (
                                    <option key={idx} value={prov.province}>{prov.province}</option>
                                ))
                            }
                        </select>
                        {/* Search input */}
                        <div
                            className="input-group w-100 w-md-auto"
                            style={{ maxWidth: "220px" }}
                        >
                            <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                className="form-control form-control-sm border-start-0 rounded-end-pill px-3"
                                placeholder="ค้นหา..."
                                onChange={handlaFilterText}
                            />
                        </div>
                    </div>
                </div>

                {/* Table list user */}
                <div className='table-responsive mt-3'>
                    <table className='table table-bordered'>
                        <thead>
                            <tr className='text-center'>
                                <th>ลำดับ</th>
                                <th>เขตฯ</th>
                                <th>จังหวัด</th>
                                <th>หน่วยงาน</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>ตำแหน่ง</th>
                                <th>ประเภท</th>
                                <th>สิทธิ์</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentItems.length > 0 ? (
                                    currentItems.map((item, idx) => (
                                        <tr className='align-middle' key={idx}>
                                            <td className='text-center'>
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className='text-center'>
                                                {`เขตสุขภาพที่ ${item.zone}`}
                                            </td>
                                            <td>
                                                {item.province}
                                            </td>
                                            <td>
                                                {`${item.hname_th} [${item.hcode9}]`}
                                            </td>
                                            <td>
                                                {`${item.title_th}${item.name_th}`}
                                            </td>
                                            <td>
                                                {item.position}
                                            </td>
                                            <td>
                                                <select
                                                    className='form-select'
                                                    value={item.user_type}
                                                    onChange={(e) => handleChangeUserType(e, item.id)}
                                                >
                                                    {
                                                        userTypeOption.map((item) => (
                                                            <option key={item.value} value={item.value}>{item.label}</option>
                                                        ))
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    className='form-select'
                                                    value={item.role}
                                                    onChange={(e) => handleChangeRole(e, item.id)}
                                                >
                                                    {roleOptions.map((item) => (
                                                        <option key={item.value} value={item.value}>{item.label}</option>
                                                    ))
                                                    }
                                                </select>
                                            </td>
                                            <td className=''>
                                                <div className='form-check form-switch d-flex justify-content-center'>
                                                    <input
                                                        className='form-check-input'
                                                        type='checkbox'
                                                        role='switch'
                                                        checked={item.enabled}
                                                        onChange={(e) => handleChangeStatus(e, item.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">ไม่พบข้อมูลผู้ใช้งาน</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {currentItems.length > 0 ? (
                    <>
                        <nav>
                            <ul className="pagination pagination-sm justify-content-center">

                                {/* Previous */}
                                <li className={`page-item mx-1 ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link rounded-2" onClick={() => goToPage(currentPage - 1)}>
                                        Prev
                                    </button>
                                </li>

                                {/* Page numbers (with …) */}
                                {getPageNumbers().map((page, index) => (
                                    <li
                                        key={index}
                                        className={`page-item mx-1 ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
                                    >
                                        <button
                                            className="page-link rounded-2"
                                            disabled={page === "..."}
                                            onClick={() => page !== "..." && goToPage(page)}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}

                                {/* Next */}
                                <li className={`page-item mx-1 ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link rounded-2" onClick={() => goToPage(currentPage + 1)}>
                                        Next
                                    </button>
                                </li>

                            </ul>
                        </nav>
                    </>
                ) : null}

                {/* Modal */}


            </div>
        </>
    )
}

export default FormUsersManagement