import React, { useEffect, useRef, useState } from 'react'
import useGlobalStore from '../../store/global-store'
import { Modal } from 'bootstrap';
import { getListTopic } from '../../api/Topic';
import { createQuestion, getListQuestion, getQuestionById, updateQuestion } from '../../api/Queation';
import { toast } from 'react-toastify';
import { SquarePen } from 'lucide-react';
import { getListCategory } from '../../api/Category';
import Swal from 'sweetalert2';

const FormCreateQuestion = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listTopic, setListTopic] = useState([]);
    const [listCategory, setListCategory] = useState([]);
    const [listQuestion, setListQuestion] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [modalCreateInstance, setModalCreateInstance] = useState(null);
    const [modalUpdateInstance, setModalUpdateInstance] = useState(null);
    const [selectTopic, setSelectTopic] = useState("");
    const [groupData, setGroupData] = useState([]);
    const [formCreateData, setFormCreateData] = useState({
        topic_id: "",
        category_id: "",
        question_name: "",
        user_id: user?.id
    });
    const [formUpdateData, setFormUpdateData] = useState({
        id: "",
        topic_id: "",
        category_id: "",
        question_name: "",
        user_id: user?.id
    });
    const [currentPage, setCurrentPage] = useState(1);

    const handlaFilter = (e) => {
        setSearchQuery(listQuestion.filter(f =>
            f.question_name.toLowerCase().includes(e.target.value)
        ))
    }

    const itemsPerPage = 12; // ✅ แสดงหน้าละ 10 รายการ

    // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = searchQuery.slice(firstIndex, lastIndex);

    // ✅ จำนวนหน้า
    const totalPages = Math.ceil(searchQuery.length / itemsPerPage);

    // ✅ ฟังก์ชันคลิกเลขหน้า
    const goToPage = (pageNum) => {
        setCurrentPage(pageNum);
    };

    // Select search
    const selectRef = useRef();

    // Create modal
    const modalCreateRef = useRef(null);
    // Update modal
    const modalUpdateRef = useRef(null);

    useEffect(() => {
        loadListTopic(token);
        loadListQuestion(token);
        loadListCategory(token);
        // สร้าง instance ของ Modal จาก ref
        setModalCreateInstance(new Modal(modalCreateRef.current));
        setModalUpdateInstance(new Modal(modalUpdateRef.current));
    }, []);

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

    const loadListQuestion = async () => {
        try {
            setIsLoading(true);
            const res = await getListQuestion();
            setListQuestion(res.data);
            setSearchQuery(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const truncateWords = (text, limit = 200) => {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + "...";
    };

    const handleFormCreateChange = (e) => {
        const { name, value } = e.target;
        const topicId = value
        setSelectTopic(topicId)
        setFormCreateData((prev) => ({ ...prev, [name]: value }));
    }

    const isFormValid = formCreateData.topic_id !== "" &&
        formCreateData.category_id !== "" &&
        formCreateData.question_name !== "";

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        // console.log('Data: ', formCreateData)

        try {
            setIsLoading(true);
            const res = await createQuestion(token, formCreateData);
            setFormCreateData({ topic_id: "", category_id: "", question_name: "", user_id: user?.id })
            if (modalCreateInstance) {
                modalCreateInstance.hide()
            }
            loadListQuestion(token);
            Swal.fire({
                title: "📢 แจ้งผลการบันทึกข้อมูล!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
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
            const res = await getQuestionById(token, id);
            setFormUpdateData(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormUpdateChange = (e) => {
        const { name, value } = e.target;
        setFormUpdateData((prev) => ({ ...prev, [name]: value }));
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const res = await updateQuestion(token, formUpdateData);
            modalUpdateInstance?.hide();
            loadListQuestion(token);
            Swal.fire({
                title: "📢 แจ้งผลการแก้ไขข้อมูล!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
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
                    <h3>🗂️ เพิ่มหัวข้อหลัก (Main-question)</h3>
                </div>
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">

                    <div className="input-group w-100 w-md-auto" style={{width: "100%", maxWidth: "380px" }}>
                        <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            className="form-control form-control-sm border-start-0 rounded-end-pill px-3"
                            placeholder="ค้นหา..."
                            onChange={handlaFilter}
                        />
                    </div>

                    <button
                        className="btn btn-sm btn-success rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                        onClick={() => modalCreateInstance.show()}
                    >
                        <span>✚</span>
                        เพิ่มหัวข้อหลัก
                    </button>
                </div>

                {/* Table display data */}
                <div className='table-responsive mt-3'>
                    <table className='table table-bordered'>
                        <thead>
                            <tr>
                                <th className='text-center'>ลำดับ</th>
                                <th className='text-center'>ชื่อแบบประเมิน</th>
                                <th className='text-center'>ชื่อกลุ่ม / ด้าน</th>
                                <th className='text-center w-50'>รายการคำถาม</th>
                                <th className='text-center'>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentItems.length > 0 ? (
                                    currentItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className='text-center'>
                                                {firstIndex + idx + 1}
                                            </td>
                                            <td>
                                                {listTopic.find(f => f.id === item.topic_id)?.topic_name || "-"}
                                            </td>
                                            <td>
                                                {listCategory.find(f => f.id === item.category_id)?.category_name_th || "-"}
                                            </td>
                                            <td>
                                                {truncateWords(item.question_name, 80)}
                                            </td>
                                            <td className='text-center'>
                                                <SquarePen
                                                    className='text-warning'
                                                    size={18}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => openModalUpdate(item.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className='text-center'>
                                            ไม่พบข้อมูล
                                        </td>
                                    </tr>
                                )
                            }

                        </tbody>
                    </table>
                </div>
                {/* End Table display data */}

                {/* ✅ Pagination */}
                <nav>
                    <ul className="pagination pagination-sm justify-content-center">

                        {/* Prev */}
                        <li className={`page-item mx-1 ${currentPage === 1 && "disabled"}`}>
                            <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                                Prev
                            </button>
                        </li>

                        {/* Page Numbers แบบสวย */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <li
                                key={p}
                                className={`page-item mx-1 ${currentPage === p && "active"}`}
                            >
                                <button className="page-link" onClick={() => goToPage(p)}>
                                    {p}
                                </button>
                            </li>
                        ))}

                        {/* Next */}
                        <li className={`page-item mx-1 ${currentPage === totalPages && "disabled"}`}>
                            <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                                Next
                            </button>
                        </li>

                    </ul>
                </nav>
                {/* ✅ Pagination */}

                {/* Modal form create */}
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
                                    📋 ฟอร์มบันทึกคำถามในแบบประเมิน
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
                                                listTopic?.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.topic_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">กลุ่ม / ด้าน</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formCreateData.category_id}
                                            onChange={handleFormCreateChange}
                                            disabled={!selectTopic}
                                        >
                                            <option value="">-- เลือกกลุ่ม / ด้าน --</option>
                                            {
                                                listCategory?.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.category_name_th}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">คำถาม</label>
                                        <textarea
                                            name="question_name"
                                            className="form-control"
                                            value={formCreateData.question_name}
                                            onChange={handleFormCreateChange}
                                            placeholder="คำถาม..."
                                            required
                                            rows={5}
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
                {/* End modal form create */}

                {/* Modal form update */}
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
                                    📋 ฟอร์มแก้ไขคำถามในแบบประเมิน
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
                                            value={formUpdateData.topic_id}
                                            onChange={handleFormUpdateChange}
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
                                        <label className="form-label">คำถาม</label>
                                        <textarea

                                            name="question_name"
                                            className="form-control"
                                            value={formUpdateData.question_name}
                                            onChange={handleFormUpdateChange}
                                            placeholder="คำถาม..."
                                            rows={5}
                                            required
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
                                        >
                                            {isLoading ? "กำลังแก้ไข..." : "📝 แก้ไขข้อมูล"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End modal form update */}

            </div>
        </>
    )
}

export default FormCreateQuestion
