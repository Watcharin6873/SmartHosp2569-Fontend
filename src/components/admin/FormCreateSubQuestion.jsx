import React, { useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../store/global-store';
import { getListTopic } from '../../api/Topic';
import { getListCategory } from '../../api/Category';
import { getListQuestion } from '../../api/Queation';
import { createSubQuestion, getListSubQuestion, getSubQuestionById, updateSubQuestion } from '../../api/SubQuestion';
import { SquarePen } from 'lucide-react';
import { Modal } from 'bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const FormCreateSubQuestion = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listTopic, setListTopic] = useState([]);
    const [listCategory, setListCategory] = useState([]);
    const [listQuestion, setListQuestion] = useState([]);
    const [listSubQuestion, setListSubQuestion] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [modalCreateInstance, setModalCreateInstance] = useState(null);
    const [modalUpdateInstance, setModalUpdateInstance] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedCat, setSelectedCat] = useState("");
    const [formData, setFormData] = useState({
        id: '',
        topic_id: '',
        category_id: '',
        question_id: '',
        sub_quest_name: '',
        user_id: user?.id
    });
    const [formUpdateData, setFormUpdateData] = useState({
        id: '',
        topic_id: '',
        category_id: '',
        question_id: '',
        sub_quest_name: '',
        user_id: user?.id
    });

    // Modal useRef
    const modalCreateRef = useRef(null);
    const modalUpdateRef = useRef(null);

    useEffect(() => {
        loadListTopic(token);
        loadListCategory(token);
        loadListQuestion(token);
        loadListSubQuestion(token);
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
            const res = await getListQuestion(token);
            setListQuestion(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const loadListSubQuestion = async () => {
        try {
            setIsLoading(true);
            const res = await getListSubQuestion(token);
            setListSubQuestion(res.data);
            setSearchQuery(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handlaFilter = (e) => {

    }

    // ✅ แสดงหน้าละ 10 รายการ
    const itemsPerPage = 12;

    // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = searchQuery.slice(firstIndex, lastIndex);

    // ✅ จำนวนหน้า
    const totalPages = Math.ceil(searchQuery.length / itemsPerPage);

    // ✅ ฟังก์ชันคลิกเลขหน้า
    const goToPage = (pageNum) => {
        setCurrentPage(pageNum);
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'topic_id') {
            setSelectedTopic(value)
        }
        if (name === 'category_id') {
            setSelectedCat(value)
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const questOption = listQuestion.filter(f => f.category_id === parseInt(selectedCat));

    const truncateWords = (text, limit = 200) => {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + "...";
    };

    const isFormValid = formData.topic_id !== "" &&
        formData.category_id !== "" &&
        formData.question_id !== "" &&
        formData.sub_quest_name !== ""

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const res = await createSubQuestion(token, formData);
            setSelectedTopic("");
            setSelectedCat("");
            setFormData({ id: '', topic_id: '', category_id: '', question_id: '', sub_quest_name: '', user_id: user?.id })
            if (modalCreateInstance) {
                modalCreateInstance.hide()
            }
            loadListSubQuestion(token)
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


    // Open modal update
    const openModalUpdate = async (id) => {
        modalUpdateInstance.show()

        try {
            setIsLoading(true);
            const res = await getSubQuestionById(token, id)
            setFormUpdateData(res.data)
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setFormUpdateData((prev) => ({ ...prev, [name]: value }))
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const res = await updateSubQuestion(token, formUpdateData);
            setFormUpdateData({ id: '', topic_id: '', category_id: '', question_id: '', sub_quest_name: '', user_id: user?.id })
            if (modalUpdateInstance) {
                modalUpdateInstance.hide()
            }
            loadListSubQuestion(token)
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
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                <div className='d-flex justify-content-center'>
                    <h3>🗂️ เพิ่มหัวข้อย่อย (Sub-question)</h3>
                </div>
                <div className='d-flex align-items-center justify-content-between gap-3'>
                    <div className="input-group" style={{ maxWidth: "350px" }}>
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
                        เพิ่มหัวข้อย่อย
                    </button>
                </div>

                {/* Table */}
                <div className='table-responsive mt-3'>
                    <table className='table table-bordered'>
                        <thead className='bg-success'>
                            <tr>
                                <th className='text-center'>ลำดับ</th>
                                <th className='text-center' style={{width: '150px'}}>ด้าน / กลุ่ม</th>
                                <th className='text-center' style={{width: '350px'}}>คำถามหลัก</th>
                                <th className='text-center'>คำถามย่อย</th>
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
                                            <td>{listCategory.find(f => f.id === item.category_id)?.category_name_th || "-"}</td>
                                            <td>
                                                {truncateWords(listQuestion.find(f => f.id === item.question_id)?.question_name || "-", 40)}
                                            </td>
                                            <td className='w-50'>{truncateWords(item.sub_quest_name, 80)}</td>
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
                                    <>
                                        <tr>
                                            <td colSpan={5} className='text-center'>ไม่พบข้อมูล</td>
                                        </tr>
                                    </>
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {currentItems.length > 0 ? (
                    <>
                        <nav>
                            <ul className='pagination pagination-sm justify-content-center'>
                                {/* Prev */}
                                <li className={`page-item mx-1 ${currentPage === 1 && 'disabled'}`}>
                                    <button className='page-link' onClick={() => goToPage(currentPage - 1)}>
                                        Prev
                                    </button>
                                </li>

                                {/* Page number */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <li key={p} className={`page-item mx-1 ${currentPage === p && 'active'}`}>
                                        <button className='page-link' onClick={() => goToPage(p)}>
                                            {p}
                                        </button>
                                    </li>
                                ))}

                                {/* Next */}
                                <li className={`page-item mx-1 ${currentPage === totalPages && 'disabled'}`}>
                                    <button className='page-link' onClick={() => goToPage(currentPage + 1)}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </>
                ) : null}

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
                                    📋 ฟอร์มบันทึกหัวข้อย่อย (Sub-question)
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
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>แบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formData?.topic_id}
                                            onChange={handleFormChange}
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
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>ด้าน / กลุ่ม</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formData?.category_id}
                                            onChange={handleFormChange}
                                            disabled={!selectedTopic}
                                        >
                                            <option value="">-- เลือกด้าน / กลุ่ม --</option>
                                            {listCategory?.map((item, idx) => (
                                                <option key={idx} value={item.id}>
                                                    {item.category_name_th}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>คำถามหลัก</label>
                                        <select
                                            className='form-select'
                                            name='question_id'
                                            value={formData?.question_id}
                                            onChange={handleFormChange}
                                            disabled={!selectedCat}
                                        >
                                            <option>-- เลือกหัวข้อย่อย --</option>
                                            {questOption?.map((item, idx) => (
                                                <option key={idx} value={item.id}>
                                                    {truncateWords(item.question_name, 90)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>คำถามย่อย</label>
                                        <textarea
                                            className='form-control'
                                            name='sub_quest_name'
                                            value={formData?.sub_quest_name}
                                            onChange={handleFormChange}
                                            rows={5}
                                            required
                                        />
                                    </div>
                                    <div className='modal-footer'>
                                        <button
                                            type='button'
                                            className='btn btn-secondary'
                                            data-bs-dismiss='modal'
                                        >
                                            ปิด
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn btn-success'
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
                <div
                    className='modal fade'
                    id='formUpdateModal'
                    tabIndex='-1'
                    aria-labelledby='formUpdateModalLabel'
                    aria-hidden='true'
                    ref={modalUpdateRef}
                >
                    <div className='modal-dialog'>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='formUpdateModalLabel'>
                                    📋 ฟอร์มแก้ไขหัวข้อย่อย (Sub-question)
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
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>แบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formUpdateData?.topic_id}
                                            onChange={handleUpdateChange}
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
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>ด้าน / กลุ่ม</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formUpdateData?.category_id}
                                            onChange={handleUpdateChange}
                                        >
                                            <option value="">-- เลือกด้าน / กลุ่ม --</option>
                                            {listCategory?.map((item, idx) => (
                                                <option key={idx} value={item.id}>
                                                    {item.category_name_th}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>คำถามหลัก</label>
                                        <select
                                            className='form-select'
                                            name='question_id'
                                            value={formUpdateData?.question_id}
                                            onChange={handleUpdateChange}
                                        >
                                            <option>-- เลือกหัวข้อย่อย --</option>
                                            {listQuestion?.filter(f => f.category_id === formUpdateData.category_id).map((item, idx) => (
                                                <option key={idx} value={item.id}>
                                                    {truncateWords(item.question_name, 90)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label fw-bold'>คำถามย่อย</label>
                                        <textarea
                                            className='form-control'
                                            name='sub_quest_name'
                                            value={formUpdateData?.sub_quest_name}
                                            onChange={handleUpdateChange}
                                            rows={5}
                                            required
                                        />
                                    </div>
                                    <div className='modal-footer'>
                                        <button
                                            type='button'
                                            className='btn btn-secondary'
                                            data-bs-dismiss='modal'
                                        >
                                            ปิด
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn btn-success'
                                        // disabled={!isFormValid}
                                        >
                                            {isLoading ? "กำลังแก้ไข..." : "💾 แก้ไขข้อมูล"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default FormCreateSubQuestion
