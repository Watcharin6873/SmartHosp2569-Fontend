import { useState, useEffect, useMemo } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListHospitalsInEvaluation } from '../../../api/Evaluate';
import { getProvAndZoneApprove } from '../../../api/Approve';
import { getListHospitals } from '../../../api/Hospitals';

const FormReportProvince = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospEvaluation, setListHospEvaluation] = useState([]);
  const [listProveApprove, setListProvApprove] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const province = user?.province;
  // const province = "ศรีสะเกษ";
  const isUAT = import.meta.env.VITE_IS_UAT === 'true';

  useEffect(() => {
    if (!token) return;

    loadListHospitals(token);
    loadlistProvApprove(token);
  }, [token]);

  const loadListHospitals = async () => {
    try {
      setIsLoading(true);

      const res = await getListHospitals(token);
      const data = res.data;
      const filtered = isUAT ? data : data.filter(f => f.dept_type !== 'หน่วยงานทดสอบ');
      setListHospEvaluation(filtered);

    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const hospitalFiltered = listHospEvaluation.filter(f => f.province === province);

  const loadlistProvApprove = async () => {
    try {
      setIsLoading(true);

      const res = await getProvAndZoneApprove(token);
      const data = res.data;
      const filtered = isUAT 
        ? data.filter(f => f.province === province)
        : data.filter(f => f.hospital_type !== 'หน่วยงานทดสอบ' && f.province === province);
      
      setListProvApprove(filtered);
      setSearchQuery(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFilter = (e) => {
    const keyword = e.target.value.toLowerCase();

    setSearchQuery(
      listProveApprove.filter(f =>
        f.hospital_name?.toLowerCase().includes(keyword) ||
        f.hospital_code?.toLowerCase().includes(keyword)
      )
    );
  };


  // ✅ แสดงหน้าละ 10 รายการ
  const itemsPerPage = 10;

  // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = searchQuery.slice(firstIndex, lastIndex)


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


  // console.log('Final: ', currentItems)

  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='text-success fw-bold'>รายงานการอนุมัติผลการประเมินโรงพยาบาลอัจฉริยะ ของจังหวัด{province}</h4>
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

      <div className='p-3 border bg-light rounded-3 shadow h-100 mb-3'>
        <div className='table-responsive'>
          <table className='table table-bordered' style={{ fontSize: '13px' }}>
            <thead className='table-success'>
              <tr className='text-center align-middle'>
                <th rowSpan={2}>โรงพยาบาล</th>
                <th colSpan={2}>ด้านโครงสร้าง (66 ข้อ)</th>
                <th colSpan={2}>ด้านบริหารจัดการ (46 ข้อ)</th>
                <th colSpan={2}>ด้านการบริการ (46 ข้อ)</th>
                <th colSpan={2}>ด้านบุคลากร (9 ข้อ)</th>
              </tr>
              <tr className='text-center align-middle'>
                <th>สสจ.</th>
                <th>เขตฯ</th>
                <th>สสจ.</th>
                <th>เขตฯ</th>
                <th>สสจ.</th>
                <th>เขตฯ</th>
                <th>สสจ.</th>
                <th>เขตฯ</th>
              </tr>
            </thead>
            <tbody>
              {
                currentItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.hospital_name} ({item.hospital_code})
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.prov_approvedCat1) === 66
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.prov_approvedCat1)}</span>
                      }                      
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.zone_approvedCat1) === 66
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.zone_approvedCat1)}</span>
                      }
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.prov_approvedCat2) === 46
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.prov_approvedCat2)}</span>
                      } 
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.zone_approvedCat2) === 46
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.zone_approvedCat2)}</span>
                      }
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.prov_approvedCat3) === 46
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.prov_approvedCat3)}</span>
                      }
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.zone_approvedCat3) === 46
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.zone_approvedCat3)}</span>
                      }
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.prov_approvedCat4) === 9
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.prov_approvedCat4)}</span>
                      }
                    </td>
                    <td className='text-center'>
                      {
                        parseInt(item.zone_approvedCat4) === 9
                          ? <span className='text-success'>🎉 ครบแล้ว</span>
                          : <span className=''>{parseInt(item.zone_approvedCat4)}</span>
                      }
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

    </div>
  )
}

export default FormReportProvince