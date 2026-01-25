import React, { useEffect, useMemo, useState } from 'react'
import useGlobalStore from '../../store/global-store'
import { changeUserRole, changeUserStatus, changeUserType, getListUsers } from '../../api/User';
import Swal from 'sweetalert2';
import { getListHospitals } from '../../api/Hospitals';
import UsersTable from './UsersTable';
import PendingBadge from './PendingBadge';

const TABS = [
    { key: "Centre", label: "ส่วนกลาง" },
    { key: "Zone", label: "คกก.ระดับเขตฯ" },
    { key: "Prov", label: "คกก.ระดับจังหวัด" },
    { key: "Unit_service", label: "ผู้ประเมินหน่วยบริการ" }
];

const FormUsersManagement = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const pendingUserCount = useGlobalStore((state) => state.pendingUserCount);
    const [isLoading, setIsLoading] = useState(false);
    const [listUsers, setListUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("Centre");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedZone, setSelectedZone] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedHospital, setSelectedHospital] = useState("");

    useEffect(() => {
        // Fetch list users from API
        loadUsersData(token);
    }, []);

    // Get list users function
    const loadUsersData = async () => {
        try {
            setIsLoading(true);
            const res = await getListUsers(token);
            const data = res.data;
            setListUsers(data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // =========================
    // Options สำหรับ Select
    // =========================
    const zoneOptions = useMemo(() => {
        return [...new Set(listUsers.map(u => u.zone).filter(Boolean))]
    }, [listUsers]);

    const provinceOptions = useMemo(() => {
        return [...new Set(listUsers.map(u => u.province).filter(Boolean))]
    }, [listUsers]);

    const hospitalOptions = useMemo(() => {
        return [...new Set(listUsers.map(u => u.hcode9).filter(Boolean))]
    }, [listUsers]);

    // =========================
    // Filter Logic
    // =========================
    const filteredUsers = useMemo(() => {
        const q = String(searchQuery || "").toLowerCase();

        return listUsers.filter(u => {
            let pass = true;

            // 1. กรองตาม TAB
            if (activeTab === "Centre") {
                pass = u.user_type === "Centre";
            }
            if (activeTab === "Zone") {
                pass = u.user_type === "Zone";
            }
            if (activeTab === "Prov") {
                pass = u.user_type === "Prov";
            }
            if (activeTab === "Unit_service") {
                pass = u.user_type === "Unit_service";
            }

            if (!pass) return false;

            // 2. Search input (ทุก tab ใช้ได้)
            if (q) {
                pass =
                    u.name_th?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    u.hname_th?.toLowerCase().includes(q);
            }

            // 3. Filter เฉพาะ tab
            if (activeTab === "Zone" && selectedZone) {
                pass = pass && String(u.zone) === String(selectedZone);
            }

            if (activeTab === "Prov" && selectedProvince) {
                pass = pass && String(u.province) === String(selectedProvince);
            }

            if (activeTab === "Unit_service" && selectedHospital) {
                pass = pass && String(u.hcode9) === String(selectedHospital);
            }

            return pass;
        });
    }, [
        listUsers,
        activeTab,
        searchQuery,
        selectedZone,
        selectedProvince,
        selectedHospital
    ]);

    const pendingUserType = useMemo(() => {
        const base = {
            Centre: 0,
            Zone: 0,
            Prov: 0,
            Unit_service: 0
        };

        listUsers.forEach(u => {
            if (u.enabled === false && base[u.user_type] !== undefined) {
                base[u.user_type]++;
            }
        });
        return base;
    }, [listUsers]);


    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>

                <div className='d-flex justify-content-center mb-3'>
                    <h3>จัดการสิทธิ์ผู้ใช้งาน (Users-Management)</h3>
                </div>

                {/* Tabs */}
                <div className=''>
                    <ul className='nav nav-tabs mb-3'>
                        {TABS.map(tab => (
                            <li key={tab.key} className='nav-item'>
                                <button
                                    className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setSearchQuery("");
                                        setSelectedZone("");
                                        setSelectedProvince("");
                                        setSelectedHospital("");
                                    }}
                                >
                                    {tab.label}
                                    <PendingBadge count={pendingUserType[tab.key]} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Search Bar && Total users */}
                <div className='d-flex justify-content-between align-items-center mt-3'>
                    {/* Total users */}
                    <div>
                        <span>จำนวนผู้ลงทะเบียนทั้งหมด: {filteredUsers.length} คน</span>
                    </div>

                    <div className='d-flex justify-content-between align-items-center gap-2 mb-3'>
                        {/* Select ตาม Tab */}
                        {activeTab === 'Zone' && (
                            <select
                                className='form-select w-auto'
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                            >
                                <option value=''>-- เลือกเขต --</option>
                                {zoneOptions
                                    .sort((a, b) => Number(a) - Number(b))
                                    .map(z => (
                                        <option key={z} value={z}>เขตสุขภาพที่ {z}</option>
                                    ))}
                            </select>
                        )}

                        {activeTab === 'Prov' && (
                            <select
                                className='form-select w-auto'
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
                            >
                                <option value=''>-- เลือกจังหวัด --</option>
                                {provinceOptions.map(p => (
                                    <option key={p} value={p}>จังหวัด{p}</option>
                                ))}
                            </select>
                        )}

                        {activeTab === 'Unit_service' && (
                            <select
                                className='form-select w-auto'
                                value={selectedHospital}
                                onChange={(e) => setSelectedHospital(e.target.value)}
                            >
                                <option value=''>-- เลือกโรงพยาบาล --</option>
                                {hospitalOptions.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                        )}

                        {/* Search input */}
                        <div
                            className="input-group w-100 w-md-auto"
                            style={{ maxWidth: "450px", minWidth: "280px" }}
                        >
                            <span className="input-group-text bg-white border-end-0 rounded-start-pill px-3">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                className="form-control form-control-sm border-start-0 rounded-end-pill px-3"
                                placeholder="ค้นหาชื่อ / email / โรงพยาบาล..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Tab content */}
                <UsersTable filteredUsers={filteredUsers} loadUsersData={loadUsersData} />

                {/* Modal */}


            </div>
        </>
    )
}

export default FormUsersManagement