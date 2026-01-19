import { useState, useEffect, useMemo } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getProvAndZoneApprove } from '../../../api/Approve';
import { getListHospitals } from '../../../api/Hospitals';

const FormReportProvince = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospEvaluation, setListHospEvaluation] = useState([]);
  const [listProveApprove, setListProvApprove] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const province = user?.province;
  const isUAT = import.meta.env.VITE_IS_UAT === 'true';

  useEffect(() => {
    loadListHospitals(token);
    loadlistProvApprove(token);
  }, []);

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
      setListProvApprove(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const groupByhospAndCategory = (data) => {
    return data.reduce((acc, item) => {
      const key = `${item.hospital_code}_${item.category_id}`;

      if (!acc[key]) {
        acc[key] = {
          hospital_code: item.hospital_code,
          category_id: item.category_id,
          approvedList: [],
          penddingList: []
        }
      }

      if (item.prov_approve === true) {
        acc[key].approvedList.push(item);
      } else {
        acc[key].penddingList.push(item);
      }

      return acc;
    }, {})
  }

  const groupedApprove = groupByhospAndCategory(listProveApprove);
  const groupedArray = Object.values(groupedApprove);

  const finalDataApprove = groupedArray.reduce((acc, app) => {
    const key = app.hospital_code;

    // ถ้ายังไม่มีโรงพยาบาลนี้ใน acc → สร้างแถวใหม่
    if (!acc[key]) {
      acc[key] = {
        hospital_code: app.hospital_code,
        approvedListCat1: 0,
        penddingListCat1: 0,
        approvedListCat2: 0,
        penddingListCat2: 0,
        approvedListCat3: 0,
        penddingListCat3: 0,
        approvedListCat4: 0,
        penddingListCat4: 0
      };
    }

    const countByCat = (arr, catId) =>
      Array.isArray(arr)
        ? arr.filter(f => Number(f.category_id) === Number(catId)).length
        : 0;

    // ใส่ค่าตาม category
    switch (Number(app.category_id)) {
      case 2:
        acc[key].approvedListCat1 = countByCat(app.approvedList, 2);
        acc[key].penddingListCat1 = countByCat(app.penddingList, 2);
        break;
      case 3:
        acc[key].approvedListCat2 = countByCat(app.approvedList, 3);
        acc[key].penddingListCat2 = countByCat(app.penddingList, 3);
        break;
      case 4:
        acc[key].approvedListCat3 = countByCat(app.approvedList, 4);
        acc[key].penddingListCat3 = countByCat(app.penddingList, 4);
        break;
      case 5:
        acc[key].approvedListCat4 = countByCat(app.approvedList, 5);
        acc[key].penddingListCat4 = countByCat(app.penddingList, 5);
        break;
      default:
        break;
    }

    return acc;
  }, {});

  // แปลง object → array สำหรับเอาไป map ใน table
  const finalDataApproveArray = Object.values(finalDataApprove);


  const dataForTable = useMemo(() => {
    if (!Array.isArray(finalDataApproveArray) ||
      !Array.isArray(hospitalFiltered)) return [];

    return finalDataApproveArray.flatMap((app) => {
      const hosp = hospitalFiltered.find(
        f => String(f.hcode9) === String(app.hospital_code)
      );

      if (!hosp) return [];

      return {
        ...app,
        zone: hosp.zone,
        zone_name: hosp.zone_name,
        province: hosp.province,
        hospital_name: hosp.hname_th
      };
    });
  }, [finalDataApproveArray, hospitalFiltered]);


  const [searchQuery, setSearchQuery] = useState([]);

  const handleFilter = (e) => {
    const keyword = e.target.value.toLowerCase();

    if (!keyword) {
      setSearchQuery(dataForTable);
      return;
    }

    setSearchQuery(
      dataForTable.filter(f =>
        f.hospital_name?.toLowerCase().includes(keyword) ||
        f.hospital_code?.toLowerCase().includes(keyword)
      )
    );
  };


  useEffect(() => {
    if (!Array.isArray(dataForTable)) return;

    setSearchQuery(prev => {
      if (prev.length === dataForTable.length) return prev;
      return dataForTable;
    });

    setCurrentPage(1);
  }, [dataForTable]);


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
  console.log("dataForTable:", dataForTable.length);
  console.log("searchQuery:", searchQuery.length);
  console.log("currentItems:", currentItems.length);



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
          <table className='table' style={{ fontSize: '13px' }}>
            <thead className='table-success'>
              <tr className='text-center'>
                <th>โรงพยาบาล</th>
                <th>ด้านโครงสร้าง</th>
                <th>ด้านบริหารจัดการ</th>
                <th>ด้านการบริการ</th>
                <th>ด้านบุคลากร</th>
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
                      <span>อนุมัติแล้ว: {parseInt(item.approvedListCat1)}</span>
                    </td>
                    <td className='text-center'>
                      <span>อนุมัติแล้ว: {parseInt(item.approvedListCat2)}</span>
                    </td>
                    <td className='text-center'>
                      <span>อนุมัติแล้ว: {parseInt(item.approvedListCat3)}</span>
                    </td>
                    <td className='text-center'>
                      <span>อนุมัติแล้ว: {parseInt(item.approvedListCat4)}</span>
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