import { useState, useEffect } from 'react';
import useGlobalStore from '../../../store/global-store';
import { changeUserStatus, getListUsers } from '../../../api/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/th'
import buddhistExtra from 'dayjs/plugin/buddhistEra'

dayjs.extend(buddhistExtra)

const FormUserManagement = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listUsers, setListUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const province = user?.province;

  useEffect(() => {
    loadListUsers(token);
  }, []);

  const loadListUsers = async () => {
    try {
      setIsLoading(true);

      const res = await getListUsers(token);
      const data = res?.data;

      const filtered = data.filter(f =>
        f.province === province &&
        f.role === 'user' &&
        f.user_type === 'Unit_service'
      )

      setListUsers(filtered)
      setSearchQuery(filtered)

    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFilter = (e) => {
    const keyword = e.target.value.toLowerCase();

    if (!keyword) {
      setSearchQuery(finalData);
      return;
    }

    setSearchQuery(listUsers.filter(f =>
      f.hname_th?.toLowerCase().includes(keyword) ||
      f.hcode9?.toLowerCase().includes(keyword) ||
      f.name_th?.toLowerCase().includes(keyword)
    ))
  }

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

  const returnUserType = (user_type) => {
    switch (user_type) {
      case 'Unit_service':
        return 'ผู้ประเมินโรงพยาบาลอัจฉริยะ'
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
      loadListUsers(token);
    } catch (err) {
      console.log(err);
    }


  }

  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='text-success fw-bold'>อนุมัติผู้ประเมินโรงพยาบาลอัจริยะ ของจังหวัด{province}</h4>
      </div>
      <div className="input-group w-100 w-md-auto mb-3" style={{ width: "100%", maxWidth: "380px" }}>
        <span className="input-group-text bg-white border-end-0 rounded-start-pill">
          <i className="bi bi-search"></i>
        </span>
        <input
          className="form-control form-control-sm border-start-0 rounded-end-pill px-3"
          placeholder="ค้นหา..."
          onChange={handleFilter}
        />
      </div>
      <div className='table-responsive nb-3'>
        <table className='table table-bordered'>
          <thead className='table-success'>
            <tr className='text-center align-middle'>
              <th>ชื่อ-สกุล</th>
              <th>ตำแหน่ง</th>
              <th>โรงพยาบาล</th>
              <th>ประเภท</th>
              <th>สถานะ</th>
              <th>วันที่อัปเดต</th>
            </tr>
          </thead>
          <tbody>
            {
              currentItems.length > 0 && (
                currentItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.title_th}{item.name_th}
                    </td>
                    <td className='text-center'>
                      {item.position} ({item.position_id})
                    </td>
                    <td>
                      {item.hname_th} ({item.hcode9})
                    </td>
                    <td className='text-center'>
                      {returnUserType(item.user_type)}
                    </td>
                    <td className='text-center'>
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
                    <td className='text-center'>
                      {dayjs(item.updateAt).locale('th').format('DD MMM BB')}
                    </td>
                  </tr>
                ))
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

export default FormUserManagement