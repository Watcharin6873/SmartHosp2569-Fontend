import { useEffect, useState } from 'react'
import useGlobalStore from '../../../store/global-store';
import { getListHospitalsInEvaluation2 } from '../../../api/Evaluate';
import { getProvAndZoneApprove, zoneApproveEvaluation } from '../../../api/Approve';
import { CircleCheckBig, CircleXIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const FormZoneApproved = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospEvaluation, setListHospEvaluation] = useState([]);
  const [listApproved, setListApproved] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvince, setSelectedProvince] = useState("");


  const zone = user?.zone;
  const isUAT = import.meta.env.VITE_IS_UAT === 'true';

  useEffect(() => {
    loadListHospEvaluation(token);
  }, []);

  const loadListHospEvaluation = async () => {
    try {
      const res = await getListHospitalsInEvaluation2(token);
      const data = res.data;
      const filtered = isUAT
        ? data.filter(f => Number(f.zone) === Number(zone))
        : data.filter(f => Number(f.zone) === Number(zone) && hospital_type !== 'หน่วยงานทดสอบ');

      setListHospEvaluation(filtered);

    } catch (err) {
      console.log(err);
    }
  }

  const provOption = [
    ...new Map(
      listHospEvaluation.map(p => [
        p.province_code,
        { value: p.province_code, label: p.province }
      ])
    ).values()
  ];

  useEffect(() => {
    if (!selectedProvince) return;
    loadListApproved(selectedProvince);
  }, [selectedProvince]);

  const handleSelectedProv = (e) => {
    setSelectedProvince(e.target.value);
  };

  const loadListApproved = async (provinceCode) => {
    try {
      setIsLoading(true);

      const res = await getProvAndZoneApprove(token);
      const data = res.data;

      const filtered = isUAT
        ? data.filter(f => f.province_code === provinceCode)
        : data.filter(f =>
          f.province_code === provinceCode &&
          f.hospital_type !== "หน่วยงานทดสอบ"
        );

      setListApproved(filtered);

    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleApproved = async (e, value) => {
    const newChecked = e.target.checked;
    const hospital_code = value;
    const values = {
      newChecked: newChecked,
      hospital_code: hospital_code
    }

    try {
      const res = await zoneApproveEvaluation(token, values);
      const message = res.data.message;

      Swal.fire({
        title: "📢 แจ้งผลการอนุมัติ/ยกเลิกผลการอนุมัติ!",
        text: `${message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      })

      // ✅ reload ตามจังหวัดเดิม
      loadListApproved(selectedProvince);

    } catch (err) {
      console.log(err)
    }
  }


  // ✅ แสดงหน้าละ 10 รายการ
  const itemsPerPage = 10;

  // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = listApproved.slice(firstIndex, lastIndex);

  // ✅ จำนวนหน้า
  const totalPages = Math.ceil(listApproved.length / itemsPerPage);

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


  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='fw-bold text-success'>อนุมัติผลการประเมินโรงพยาบาลอัจฉริยะ ปีงบประมาณ พ.ศ.2569 (ระดับเขตสุขภาพ)</h4>
      </div>

      <div className='d-flex justify-content-center gap-3 mb-3'>
        <div className='col-md-2'>
          <select
            className="form-select"
            value={selectedProvince}
            onChange={handleSelectedProv}
          >
            <option value="">-- เลือกจังหวัด --</option>
            {provOption.map((prov, idx) => (
              <option key={idx} value={prov.value}>
                {prov.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className='ms-2'>จำนวนโรงพยาบาลทั้งหมด {listApproved.length} แห่ง</span>
      </div>

      <div className='table-responsive'>
        <table className='table table-bordered'>
          <thead className='table-success'>
            <tr className='text-center align-middle'>
              <th rowSpan={2}>โรงพยาบาล</th>
              <th rowSpan={2}>จังหวัด</th>
              <th colSpan={2}>ด้านโครงสร้าง</th>
              <th colSpan={2}>ด้านบริหารจัดการ</th>
              <th colSpan={2}>ด้านการบริการ</th>
              <th colSpan={2}>ด้านบุคลากร</th>
              <th rowSpan={2}>เขตฯ อนุมัติ</th>
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
              currentItems.length > 0 &&
              currentItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.hospital_name} ({item.hospital_code})
                  </td>
                  <td className='text-center'>
                    {item.province}
                  </td>
                  <td className='text-center'>
                    {
                      item.prov_approvedCat1 === 66
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.prov_approvedCat1 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat1
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.zone_approvedCat1 === 66
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.zone_approvedCat1 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat1
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.prov_approvedCat2 === 46
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.prov_approvedCat2 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat2
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.zone_approvedCat2 === 46
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.zone_approvedCat2 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat2
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.prov_approvedCat3 === 46
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.prov_approvedCat3 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat3
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.zone_approvedCat3 === 46
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.zone_approvedCat3 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat3
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.prov_approvedCat4 === 9
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.prov_approvedCat4 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat4
                    }
                  </td>
                  <td className='text-center'>
                    {
                      item.zone_approvedCat4 === 9
                        ? <CircleCheckBig className='text-success' size={16} />
                        : item.zone_approvedCat4 === 0
                          ? <CircleXIcon className='text-danger' size={16} />
                          : item.prov_approvedCat4
                    }
                  </td>
                  <td className='text-center'>
                    <div className='form-check form-switch d-flex justify-content-center'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        role='switch'
                        checked={
                          item.zone_approvedCat1 === 66 &&
                          item.zone_approvedCat2 === 46 &&
                          item.zone_approvedCat3 === 46 &&
                          item.zone_approvedCat4 === 9
                        }
                        disabled={
                          item.prov_approvedCat1 !== 66 &&
                          item.prov_approvedCat2 !== 46 &&
                          item.prov_approvedCat3 !== 46 &&
                          item.prov_approvedCat4 !== 9
                        }
                        onChange={(e) => handleApproved(e, item.hospital_code)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            }
            {
              currentItems.length === 0 && (
                <tr className='text-center'>
                  <td colSpan={11}>--- ไม่พบข้อมูล กรุณาเลือกจังหวัด ---</td>
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

    </div>
  )
}

export default FormZoneApproved