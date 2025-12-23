import React, { useEffect, useRef, useState } from 'react'
import useGlobalStore from '../../store/global-store'
import { getListTopic } from '../../api/Topic';
import { getListCategory } from '../../api/Category';
import { getListQuestion } from '../../api/Queation';
import { getListSubQuestion } from '../../api/SubQuestion';
import { createChoice, getChoiceById, getListChoices, updateChoice } from '../../api/Choices';
import { Modal } from 'bootstrap';
import { CirclePlus, SquarePen, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const FormChoiceSmartHosp = () => {

    const user = useGlobalStore(state => state.user);
    const token = useGlobalStore(state => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listTopic, setListTopic] = useState([]);
    const [listCategory, setListCategory] = useState([]);
    const [listQuestion, setListQuestion] = useState([]);
    const [listSubQuestion, setListSubQuestion] = useState([]);
    const [listChoice, setListChoice] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        id: '',
        topic_id: '',
        category_id: '',
        question_id: '',
        sub_question_id: '',
        user_id: user ? user.id : '',
        answers: [
            {
                choice_text: '',
                choice_value: '',
                choice_required: ''
            }
        ]
    });

    // Modal Create Instance
    const [modalCreateInstance, setModalCreateInstance] = useState(null);
    const modalCreateRef = useRef(null);
    // Modal Edit Instance
    const [modalEditInstance, setModalEditInstance] = useState(null);
    const modalEditRef = useRef(null);

    const truncateWords = (text, limit = 200) => {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + "...";
    };

    useEffect(() => {
        loadListTopic(token);
        loadListCategory(token);
        loadListQuestion(token);
        loadListSubQuestion(token);
        loadListChoice(token);
        // สร้าง instance ของ Modal จาก ref
        if (modalCreateRef.current) {
            setModalCreateInstance(new Modal(modalCreateRef.current));
        }
        if (modalEditRef.current) {
            setModalEditInstance(new Modal(modalEditRef.current));
        }
    }, []);

    // Load list topic
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

    // Lost list category
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

    // Load list question
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

    // Load list subquestion
    const loadListSubQuestion = async () => {
        try {
            setIsLoading(true);
            const res = await getListSubQuestion(token);
            setListSubQuestion(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // Load list choice
    const loadListChoice = async () => {
        try {
            setIsLoading(true);
            const res = await getListChoices(token);
            setListChoice(res.data);
            setSearchQuery(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handlaFilter = (e) => {

    }

    const topic_option = listTopic.filter(f => f.status === true);
    const category_option = listCategory.filter(f => f.topic_id === 2);



    // อัปเดตค่าใน formData
    const handleFormDataChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    // อัปเดตค่าใน answers แบบไดนามิก
    const handleAnswerChange = (index, fields, value) => {
        const updated = { ...formData };
        updated.answers[index][fields] = value;
        setFormData(updated);
    }

    // เพิ่มคำตอบ (Choice)
    const addAnswer = () => {
        setFormData(prev => ({
            ...prev,
            answers: [
                ...prev.answers,
                {
                    choiceText: '',
                    choiceValue: '',
                    choiceRequired: ''
                }
            ]
        }))
    }

    // ลบคำตอบ (Choice)
    const removeAnswer = (idx) => {
        setFormData(prev => ({
            ...prev,
            answers: prev.answers.filter((_, index) => index !== idx)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('Submitting form data:', formData);
        const res = await createChoice(token, formData);

        modalCreateInstance.hide();

        setFormData({
            id: '',
            topic_id: '',
            category_id: '',
            question_id: '',
            sub_question_id: '',
            user_id: user ? user.id : '',
            answers: [
                {
                    choice_text: '',
                    choice_value: '',
                    choice_required: ''
                }
            ]
        });

        Swal.fire({
            title: "📢 แจ้งผลการบันทึกข้อมูล!",
            text: `${res.data.message}`,
            icon: "success",
            showConfirmButton: false,
            timer: 2000
        });

        loadListChoice(token);
    }

    // ✅ แสดงหน้าละ 10 รายการ
    const itemsPerPage = 10;

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

    const openModalUpdate = async(id) => {
        console.log("Edit id:", id);
        modalEditInstance.show();

        try {
            setIsLoading(true);
            const res = await getChoiceById(token, id);
            setFormData(res.data);
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
            const res = await updateChoice(token, formData);

            modalEditInstance.hide();

            setFormData({
                id: '',
                topic_id:'',
                category_id: '',
                question_id: '',
                sub_question_id: '',
                user_id: user ? user.id : '',
                answers: [
                    {
                        choice_text: '',
                        choice_value: '',
                        choice_required: ''
                    }
                ]
            });

            Swal.fire({
                title: "📢 แจ้งผลการแก้ไขข้อมูล!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

            loadListChoice(token);
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
                    <h3>🗂️ เพิ่มคำตอบ (Choices)</h3>
                </div>
                <div className='d-flex align-items-center justify-content-between gap-3'>
                    <div className="input-group w-100 w-md-auto" style={{ maxWidth: "380px" }}>
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
                        เพิ่มคำตอบ (Choice)
                    </button>
                </div>

                {/* Table */}
                <div className='table-responsive mt-3'>
                    <table className='table table-bordered'>
                        <thead className='bg-success align-top'>
                            <tr className='text-white text-center'>
                                <th style={{ width: "5%" }}>ลำดับ</th>
                                <th style={{ width: "20%" }}>คำถามหลัก</th>
                                <th style={{ width: "20%" }}>คำถามย่อย</th>
                                <th style={{ width: "15%" }}>คำตอบ</th>
                                <th style={{ width: "10%" }}>คะแนนปกติ</th>
                                <th style={{ width: "10%" }}>คะแนนจำเป็น</th>
                                <th style={{ width: "10%" }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentItems.length > 0 ? (
                                    currentItems.map((item, idx) =>
                                        <tr key={idx}>
                                            <td className='text-center'>
                                                {(currentPage - 1) * itemsPerPage + (idx + 1)}
                                            </td>
                                            <td>
                                                {truncateWords(listQuestion.find(q => q.id === item.question_id)?.question_name || "-", 40)}
                                            </td>
                                            <td>
                                                {truncateWords(listSubQuestion.find(sq => sq.id === item.sub_question_id)?.sub_quest_name || "-", 40)}
                                            </td>
                                            <td>
                                                {item.answers.map((item, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className={item.choice_text.trim().startsWith('ไม่มี') ? 'text-danger' : 'text-success'}
                                                    >
                                                        {truncateWords(item.choice_text, 20)}
                                                        <br />
                                                    </span>
                                                ))}
                                            </td>
                                            <td className='text-center'>
                                                {item.answers.map((item, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className={item.choice_value === 0 ? 'text-danger' : 'text-success'}
                                                    >
                                                        {item.choice_value}
                                                        <br />
                                                    </span>
                                                ))}
                                            </td>
                                            <td className='text-center'>
                                                {item.answers.map((item, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className={item.choice_required === 0 ? 'text-danger' : 'text-success'}
                                                    >
                                                        {item.choice_required}
                                                        <br />
                                                    </span>
                                                ))}
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
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan={6} className='text-center'>ไม่พบข้อมูล!</td>
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

                {/* Modal Create */}
                <div
                    className="modal fade"
                    id="modalCreate"
                    tabIndex="-1"
                    aria-labelledby="modalCreateLabel"
                    role="dialog"
                    ref={modalCreateRef}
                >
                    <div className='modal-dialog modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header bg-success'>
                                <h5 className='modal-title text-white' id='modalCreateLabel'>📋 ฟอร์มบันทึกคำตอบในแบบประเมิน (Choice)</h5>
                                <button
                                    type='button'
                                    className='btn-close btn-close-white'
                                    data-bs-dismiss='modal'
                                    aria-label='Close'
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleSubmit}>
                                    <div className='text-center'>
                                        <h5><u>Section : คำถาม</u></h5>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">ชื่อแบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formData.topic_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกชื่อแบบประเมิน --</option>
                                            {
                                                topic_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.topic_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">ด้าน</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formData.category_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกคำถาม --</option>
                                            {
                                                category_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {idx + 1}.{item.category_name_th}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">คำถามหลัก</label>
                                        <select
                                            className='form-select'
                                            name='question_id'
                                            value={formData.question_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกคำถามหลัก --</option>
                                            {
                                                listQuestion.map((item, idx) =>
                                                    item.category_id === parseInt(formData.category_id) && (
                                                        <option key={idx} value={item.id}>
                                                            {item.question_name}
                                                        </option>
                                                    )
                                                )
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">คำถามย่อย</label>
                                        <select
                                            className='form-select'
                                            name='sub_question_id'
                                            value={formData.sub_question_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกคำถามย่อย --</option>
                                            {
                                                listSubQuestion.map((item, idx) =>
                                                    item.question_id === parseInt(formData.question_id) && (
                                                        <option key={idx} value={item.id}>
                                                            {item.sub_quest_name}
                                                        </option>
                                                    )
                                                )
                                            }
                                        </select>
                                    </div>
                                    <div className='text-center'>
                                        <h5><u>Section : คำตอบ</u></h5>
                                    </div>
                                    {formData.answers.map((ans, idx) => (
                                        <div key={idx} className='d-flex gap-2 mb-2'>
                                            {/* ✅ ชื่อตัวเลือก */}
                                            <textarea
                                                rows={1}
                                                className='form-control'
                                                placeholder='ตัวเลือก...'
                                                value={ans.choice_text}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "choice_text", e.target.value)
                                                }
                                                required
                                            />

                                            {/* ✅ คะแนน */}
                                            <input
                                                type='number'
                                                className='form-control'
                                                placeholder='คะแนน...'
                                                value={ans.choice_value}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "choice_value", e.target.value)
                                                }
                                                style={{ maxWidth: '120px' }}
                                                required
                                            />

                                            {/* ✅ คะแนนจำเป็น */}
                                            <input
                                                type='number'
                                                className='form-control'
                                                placeholder='คะแนนจำเป็น...'
                                                value={ans.choice_required}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "choice_required", e.target.value)
                                                }
                                                style={{ maxWidth: '120px' }}
                                                required
                                            />

                                            {/* ✅ ปุ่มลบ */}
                                            {formData.answers.length > 1 && (
                                                <Trash2
                                                    className='text-danger'
                                                    style={{ cursor: 'pointer' }}
                                                    size={36}
                                                    onClick={() => removeAnswer(idx)}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* ✅ ปุ่มเพิ่มคำตอบ */}
                                    <div className='d-flex justify-content-center mb-2'>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-primary d-flex align-items-center rounded-5 gap-1'
                                            onClick={addAnswer}
                                        >
                                            <CirclePlus size={20} /> เพิ่มคำตอบ
                                        </button>
                                    </div>

                                    <div className='modal-footer'>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-secondary rounded-5'
                                            data-bs-dismiss='modal'
                                        >
                                            ปิดหน้าต่าง
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn btn-sm btn-success rounded-5'
                                        // disabled={!isFormValid}
                                        >
                                            {isLoading ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Edit */}
                <div
                    className="modal fade"
                    id="modalUpdate"
                    tabIndex="-1"
                    aria-labelledby="modalUpdateLabel"
                    role="dialog"
                    ref={modalEditRef}
                >
                    <div className='modal-dialog modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header bg-success'>
                                <h5 className='modal-title text-white' id='modalUpdateLabel'>📋 ฟอร์มแก้ไขคำตอบในแบบประเมิน (Choice)</h5>
                                <button
                                    type='button'
                                    className='btn-close btn-close-white'
                                    data-bs-dismiss='modal'
                                    aria-label='Close'
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleUpdateSubmit}>
                                    <div className='text-center'>
                                        <h5><u>Section : คำถาม</u></h5>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">ชื่อแบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formData.topic_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกชื่อแบบประเมิน --</option>
                                            {
                                                topic_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.topic_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">ด้าน</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formData.category_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกคำถาม --</option>
                                            {
                                                category_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {idx + 1}.{item.category_name_th}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">คำถามหลัก</label>
                                        <select
                                            className='form-select'
                                            name='question_id'
                                            value={formData.question_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกคำถามหลัก --</option>
                                            {
                                                listQuestion.map((item, idx) =>
                                                    item.category_id === parseInt(formData.category_id) && (
                                                        <option key={idx} value={item.id}>
                                                            {item.question_name}
                                                        </option>
                                                    )
                                                )
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">คำถามย่อย</label>
                                        <select
                                            className='form-select'
                                            name='sub_question_id'
                                            value={formData.sub_question_id}
                                            onChange={handleFormDataChange}
                                        >
                                            <option value="">-- เลือกคำถามย่อย --</option>
                                            {
                                                listSubQuestion.map((item, idx) =>
                                                    item.question_id === parseInt(formData.question_id) && (
                                                        <option key={idx} value={item.id}>
                                                            {item.sub_quest_name}
                                                        </option>
                                                    )
                                                )
                                            }
                                        </select>
                                    </div>
                                    <div className='text-center'>
                                        <h5><u>Section : คำตอบ</u></h5>
                                    </div>
                                    {formData.answers.map((ans, idx) => (
                                        <div key={idx} className='d-flex gap-2 mb-2'>
                                            {/* ✅ ชื่อตัวเลือก */}
                                            <textarea
                                                rows={1}
                                                className='form-control'
                                                placeholder='ตัวเลือก...'
                                                value={ans.choice_text}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "choice_text", e.target.value)
                                                }
                                                required
                                            />

                                            {/* ✅ คะแนน */}
                                            <input
                                                type='number'
                                                className='form-control'
                                                placeholder='คะแนน...'
                                                value={ans.choice_value}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "choice_value", e.target.value)
                                                }
                                                style={{ maxWidth: '120px' }}
                                                required
                                            />

                                            {/* ✅ คะแนนจำเป็น */}
                                            <input
                                                type='number'
                                                className='form-control'
                                                placeholder='คะแนนจำเป็น...'
                                                value={ans.choice_required}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "choice_required", e.target.value)
                                                }
                                                style={{ maxWidth: '120px' }}
                                                required
                                            />

                                            {/* ✅ ปุ่มลบ */}
                                            {formData.answers.length > 1 && (
                                                <Trash2
                                                    className='text-danger'
                                                    style={{ cursor: 'pointer' }}
                                                    size={36}
                                                    onClick={() => removeAnswer(idx)}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* ✅ ปุ่มเพิ่มคำตอบ */}
                                    <div className='d-flex justify-content-center mb-2'>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-primary d-flex align-items-center rounded-5 gap-1'
                                            onClick={addAnswer}
                                        >
                                            <CirclePlus size={20} /> เพิ่มคำตอบ
                                        </button>
                                    </div>

                                    <div className='modal-footer'>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-secondary rounded-5'
                                            data-bs-dismiss='modal'
                                        >
                                            ปิดหน้าต่าง
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn btn-sm btn-success rounded-5'
                                        // disabled={!isFormValid}
                                        >
                                            {isLoading ? 'กำลังแก้ไข...' : '💾 แก้ไขข้อมูล'}
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

export default FormChoiceSmartHosp
