import React, { useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../store/global-store';
import { Modal } from 'bootstrap';
import { getListTopic } from '../../api/Topic';
import { createCategory, getListCategory, getCategoryById, updateCategory } from '../../api/Category';
import { toast } from 'react-toastify';
import { SquarePen } from 'lucide-react';

const FormCreateCategory = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listTopic, setListTopic] = useState([]);
    const [listCategory, setListCategory] = useState([]);
    const [modalCreateInstance, setModalCreateInstance] = useState(null);
    const [modalUpdateInstance, setModalUpdateInstance] = useState(null);
    const [formCreateData, setFormCreateData] = useState({
        id: "",
        topic_id: "",
        category_name_th: "",
        category_name_eng: "",
        fiscal_year: "",
        user_id: user?.id
    });
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10; // ✅ แสดงหน้าละ 10 รายการ

    // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = listCategory.slice(firstIndex, lastIndex);

    // ✅ จำนวนหน้า
    const totalPages = Math.ceil(listCategory.length / itemsPerPage);

    // ✅ ฟังก์ชันคลิกเลขหน้า
    const goToPage = (pageNum) => {
        setCurrentPage(pageNum);
    };

    // Create modal
    const modalCreateRef = useRef(null);
    // Update modal
    const modalUpdateRef = useRef(null);

    useEffect(() => {
        loadListTopic(token);
        loadListCategory(token);
        // สร้าง instance ของ Modal จาก ref
        setModalCreateInstance(new Modal(modalCreateRef.current));
        setModalUpdateInstance(new Modal(modalUpdateRef.current));
    }, [])

    const loadListTopic = async () => {
        try {
            setIsLoading(true);
            const res = await getListTopic(token);
            setListTopic(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const loadListCategory = async () => {
        try {
            setIsLoading(true);
            const res = await getListCategory(token);
            setListCategory(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormCreateChange = (e) => {
        const { name, value } = e.target;
        setFormCreateData((prev) => ({ ...prev, [name]: value }));
    }

    const isFormValid = formCreateData.topic_id !== "" &&
        formCreateData.category_name_th !== "" &&
        formCreateData.category_name_eng !== "" &&
        formCreateData.fiscal_year !== "";

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        console.log('Data: ', formCreateData)
        try {
            setIsLoading(true);
            const res = await createCategory(token, formCreateData);
            loadListCategory(token);
            setFormCreateData({ topic_id: "", category_name_th: "", category_name_eng: "", fiscal_year: "", user_id: user?.id });
            modalCreateInstance?.hide();
            toast.success(res.data.message);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const openModalUpdate = async (id) => {
        modalUpdateInstance?.show();

        try {
            setIsLoading(true);
            const res = await getCategoryById(token, id);
            setFormCreateData(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const res = await updateCategory(token, formCreateData);
            modalUpdateInstance?.hide();
            loadListCategory(token);
            toast.success(res.data.message);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div style={{ fontFamily: "Sarabun, sans-serif" }}>
                <div className='d-flex justify-content-center'>
                    <h3>🗂️ เพิ่มกลุ่มกลุ่ม/ด้าน คำถามในแบบประเมิน</h3>
                </div>
                <div className='d-flex justify-content-end'>
                    <button
                        className='btn btn-sm btn-success rounded-5'
                        onClick={() => modalCreateInstance?.show()}
                    >
                        ✚ เพิ่มกลุ่มกลุ่ม/ด้าน คำถามในแบบประเมิน
                    </button>
                </div>

                {/* Table display data */}
                <div className='table-responsive mt-3'>
                    <table className='table table-bordered'>
                        <thead>
                            <tr>
                                <th className='text-center'>ลำดับ</th>
                                <th className='text-center'>ชื่อแบบประเมิน</th>
                                <th className='text-center'>กลุ่ม/ด้าน (ไทย)</th>
                                <th className='text-center'>กลุ่ม/ด้าน (eng)</th>
                                <th className='text-center'>ปีงบประมาณ</th>
                                <th className='text-center'>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentItems.length > 0 ? (
                                    currentItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td
                                                className='text-center'
                                            >
                                                {idx + 1}
                                            </td>
                                            <td
                                                className=''
                                            >
                                                {listTopic.find(f => f.id === item.topic_id)?.topic_name || "-"}
                                            </td>
                                            <td
                                                className=''
                                            >
                                                {item.category_name_th}
                                            </td>
                                            <td
                                                className=''
                                            >
                                                {item.category_name_eng}
                                            </td>
                                            <td
                                                className='text-center'
                                            >
                                                {item.fiscal_year}
                                            </td>
                                            <td
                                                className='text-center'
                                            >
                                                <SquarePen
                                                    className='text-warning'
                                                    style={{ cursor: 'pointer' }}
                                                    size={18}
                                                    onClick={() => openModalUpdate(item.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            className='text-center'
                                            colSpan={5}
                                        >
                                            ยังไม่มีข้อมูล
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {/* ✅ Pagination */}
                <nav>
                    <ul className="pagination">

                        {/* Previous */}
                        <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                ก่อนหน้า
                            </button>
                        </li>

                        {/* Numbers */}
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li
                                key={index}
                                className={`page-item ${currentPage === index + 1 ? "active" : ""
                                    }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => goToPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        {/* Next */}
                        <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                ถัดไป
                            </button>
                        </li>

                    </ul>
                </nav>

                {/* Table display data */}

                {/* Modal form create */}
                <div
                    className='modal fade'
                    id='formCreateModal'
                    tabIndex='-1'
                    aria-labelledby='formCreateModalLabel'
                    aria-hidden='true'
                    ref={modalUpdateRef}
                >
                    <div className='modal-dialog'>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='formCreateModalLabel'>
                                    📋 ฟอร์มบันทึกกลุ่ม/ด้าน คำถามในแบบประเมิน
                                </h5>
                                <button
                                    type='button'
                                    className='btn-close btn-close-white'
                                    data-bs-dismiss='modal'
                                    aria-label='Close'
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleUpdateSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อแบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formCreateData.topic_id}
                                            onChange={handleFormCreateChange}
                                        >
                                            <option value="">-- เลือกชื่อแบบประเมิน --</option>
                                            {
                                                listTopic.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.topic_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">กลุ่ม/ด้าน ภาษาไทย</label>
                                        <textarea
                                            className='form-control'
                                            name='category_name_th'
                                            value={formCreateData.category_name_th}
                                            onChange={handleFormCreateChange}
                                            placeholder="กลุ่ม/ด้าน..."
                                            required
                                            rows={2}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">กลุ่ม/ด้าน ภาษาอังกฤษ</label>
                                        <textarea
                                            className='form-control'
                                            name='category_name_eng'
                                            value={formCreateData.category_name_eng}
                                            onChange={handleFormCreateChange}
                                            placeholder="กลุ่ม/ด้าน..."
                                            required
                                            rows={2}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ปีงบประมาณ</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            name='fiscal_year'
                                            value={formCreateData.fiscal_year}
                                            onChange={handleFormCreateChange}
                                            placeholder='ปีงบประมาณ...'
                                        />
                                    </div>
                                    <div className='modal-footer'>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            ปิด
                                        </button>
                                        <button
                                            type='submit'
                                            className="btn btn-success"
                                            disabled={!isFormValid}
                                        >
                                            {isLoading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Modal form create */}

                {/* Modal form update */}
                <div
                    className='modal fade'
                    id='formCreateModal'
                    tabIndex='-1'
                    aria-labelledby='formCreateModalLabel'
                    aria-hidden='true'
                    ref={modalCreateRef}
                >
                    <div className='modal-dialog'>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='formCreateModalLabel'>
                                    📋 ฟอร์มบันทึกกลุ่ม/ด้าน คำถามในแบบประเมิน
                                </h5>
                                <button
                                    type='button'
                                    className='btn-close btn-close-white'
                                    data-bs-dismiss='modal'
                                    aria-label='Close'
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อแบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formCreateData.topic_id}
                                            onChange={handleFormCreateChange}
                                        >
                                            <option value="">-- เลือกชื่อแบบประเมิน --</option>
                                            {
                                                listTopic.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.topic_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">กลุ่ม/ด้าน ภาษาไทย</label>
                                        <textarea
                                            className='form-control'
                                            name='category_name_th'
                                            value={formCreateData.category_name_th}
                                            onChange={handleFormCreateChange}
                                            placeholder="กลุ่ม/ด้าน..."
                                            required
                                            rows={2}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">กลุ่ม/ด้าน ภาษาอังกฤษ</label>
                                        <textarea
                                            className='form-control'
                                            name='category_name_eng'
                                            value={formCreateData.category_name_eng}
                                            onChange={handleFormCreateChange}
                                            placeholder="กลุ่ม/ด้าน..."
                                            required
                                            rows={2}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ปีงบประมาณ</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            name='fiscal_year'
                                            defaultValue={formCreateData.fiscal_year}
                                            onChange={handleFormCreateChange}
                                            placeholder='ปีงบประมาณ...'
                                        />
                                    </div>
                                    <div className='modal-footer'>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            ปิด
                                        </button>
                                        <button
                                            type='submit'
                                            className="btn btn-success"
                                            disabled={!isFormValid}
                                        >
                                            {isLoading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Modal form update */}

            </div>
        </>
    )
}

export default FormCreateCategory
