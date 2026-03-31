import { DownloadIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ExportScore from './ExportScore';

const TableForHomeDashBoard = ({ originalData, withLevel }) => {

    const [currentPage, setCurrentPage] = useState(1);

    const getScoreColor = (value, required = 510, cyberLevel = null) => {
        if (value < 600) return 'text-danger';     // 🔴 ไม่ผ่าน
        if (value >= 600 && value < 700) return 'text-secondary';  // ⚪ เงิน
        if (value >= 700 && value < 800 && required < 510) return 'text-secondary';  // ⚪ เงิน
        if (value >= 800 && required < 510) return 'text-secondary';  // ⚪ เงิน

        // 🟡 ทอง ต้องผ่าน required
        if (value >= 700 && value < 800 && required === 510) return 'text-warning';
        if (value >= 800 && value && required === 510 && cyberLevel !== 'GREEN') return 'text-warning';

        // 💎 เพชร ต้องผ่าน required + cyber_level = GREEN
        if (value >= 800 && required === 510 && cyberLevel === 'GREEN')
            return 'text-primary';

        return 'text-dark'; // fallback
    };

    const getCyberLevelColor = (value) => {
        if (value === 'RED') return 'text-danger';
        if (value === 'YELLOW') return 'text-warning';
        if (value === 'GREEN') return 'text-success';

        return 'text-dark';
    }

    const finalData = useMemo(() => {
        return withLevel.map(hos => {
            const rows = originalData.filter(
                o => o.hospital_code === hos.hospital_code
            );

            const getVal = (catId, field) => {
                const found = rows.find(r => r.category_id === catId);
                return found ? Number(found[field] || 0) : 0;
            };

            return {
                zone: hos.zone,
                zone_name: hos.zone_name,
                province: hos.province,
                hospital_code: hos.hospital_code,
                hospital_name: hos.hospital_name,
                hospital_type: hos.hospital_type || hos.dept_type,

                ans_value_id1: getVal(2, "answer_value"),
                ans_required_id1: getVal(2, "answer_required"),

                ans_value_id2: getVal(3, "answer_value"),
                ans_required_id2: getVal(3, "answer_required"),

                ans_value_id3: getVal(4, "answer_value"),
                ans_required_id3: getVal(4, "answer_required"),

                ans_value_id4: getVal(5, "answer_value"),
                ans_required_id4: getVal(5, "answer_required"),

                total_ans_value: Number(hos.total_answer_value || 0),
                total_ans_required: Number(hos.total_answer_required || 0),

                score_level: hos.score_level,
                cyber_level: hos.cyber_level,
                cyber_levelname: hos.cyber_levelname
            };
        });
    }, [originalData, withLevel]);

    const [searchQuery, setSearchQuery] = useState([]);

    const handleFilter = (e) => {
        const keyword = e.target.value.toLowerCase();

        if (!keyword) {
            setSearchQuery(finalData);
            return;
        }

        setSearchQuery(
            finalData.filter(f =>
                f.hospital_name?.toLowerCase().includes(keyword) ||
                f.hospital_code?.toLowerCase().includes(keyword)
            )
        );
    };

    useEffect(() => {
        setSearchQuery(finalData);
        setCurrentPage(1); // รีเซ็ตกลับหน้าแรก
    }, [finalData]);

    // ✅ แสดงหน้าละ 10 รายการ
    const itemsPerPage = 10;

    // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = Array.isArray(searchQuery)
        ? searchQuery.slice(firstIndex, lastIndex)
        : [];

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

    const handleExport = async () => {
        try {
            await ExportScore(finalData);
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className='p-3 border bg-light rounded-3 shadow h-100 mb-3'>
            <div className='d-flex justify-content-center mb-2'>
                <h4 className='text-success fw-bold'>ผลการประเมินโรงพยาบาลอัจฉริยะ ปีงบประมาณ 2569</h4>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
                <div className='d-flex justify-content-center align-middle gap-2'>
                    <div>
                        <p className='ms-2'>จำนวนโรงพยาบาลทั้งหมด {searchQuery.length} แห่ง</p>
                    </div>
                    <div>
                        <button
                            className='btn btn-sm btn-outline-primary'
                            onClick={handleExport}
                        >
                            <DownloadIcon size={12} /> Export รายละเอียดคะแนนทั้งหมด
                        </button>
                    </div>
                </div>
                
                <div className="input-group w-100 w-md-auto mb-2" style={{ width: "100%", maxWidth: "380px" }}>
                    <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        className="form-control form-control-sm border-start-0 rounded-end-pill px-3"
                        placeholder="ค้นหา..."
                        onChange={handleFilter}
                    />
                </div>
            </div>
            <div className='table-responsive' style={{ fontSize: '13px' }}>
                <table className='table table-bordered'>
                    <thead className='table-success'>
                        <tr className='text-center align-middle'>
                            <th rowSpan={2}>เขตฯ</th>
                            <th rowSpan={2}>จังหวัด</th>
                            <th rowSpan={2}>โรงพยาบาล</th>
                            <th colSpan={2}>ด้านโครงสร้าง</th>
                            <th colSpan={2}>ด้านบริหารจัดการ</th>
                            <th colSpan={2}>ด้านการบริการ</th>
                            <th>ด้านบุลากร</th>
                            <th rowSpan={2}>คะแนนที่ได้(รวม)</th>
                            <th rowSpan={2}>คะแนนจำเป็น(รวม)</th>
                            <th rowSpan={2}>ระดับที่ได้</th>
                            <th rowSpan={2}>ระดับ CTAM +</th>
                        </tr>
                        <tr className='text-center align-middle'>
                            <th>คะแนนที่ได้</th>
                            <th>คะแนนจำเป็น</th>
                            <th>คะแนนที่ได้</th>
                            <th>คะแนนจำเป็น</th>
                            <th>คะแนนที่ได้</th>
                            <th>คะแนนจำเป็น</th>
                            <th>คะแนนที่ได้</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            currentItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className='text-center'>
                                            {Number(item.zone)}
                                        </td>
                                        <td className='text-center'>
                                            {item.province}
                                        </td>
                                        <td>
                                            {item.hospital_name} ({item.hospital_code})
                                        </td>

                                        <td className='text-center'>{item.ans_value_id1}</td>
                                        <td className='text-center'>{item.ans_required_id1}</td>

                                        <td className='text-center'>{item.ans_value_id2}</td>
                                        <td className='text-center'>{item.ans_required_id2}</td>

                                        <td className='text-center'>{item.ans_value_id3}</td>
                                        <td className='text-center'>{item.ans_required_id3}</td>

                                        <td className='text-center'>{item.ans_value_id4}</td>

                                        <td className='text-center'>{item.total_ans_value}</td>
                                        <td className='text-center'>{item.total_ans_required}</td>
                                        <td
                                            className={`text-center ${getScoreColor(
                                                item.total_ans_value,
                                                item.total_ans_required,
                                                item.cyber_level
                                            )}`}
                                        >
                                            {item.score_level}
                                        </td>
                                        <td
                                            className={`text-center ${getCyberLevelColor(item.cyber_level)}`}
                                        >
                                            {item.cyber_levelname}
                                        </td>
                                    </tr>
                                ))
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
        </div>
    )
}

export default TableForHomeDashBoard