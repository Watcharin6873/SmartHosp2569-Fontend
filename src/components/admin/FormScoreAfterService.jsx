import React, { useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../store/global-store';
import { Modal } from 'bootstrap';
import { getListTopic } from '../../api/Topic';
import { getListCategory } from '../../api/Category';
import { getListQuestion } from '../../api/Queation';
import { CirclePlus, SquarePen, Trash2 } from 'lucide-react';
import { createScoreSurvey, getListScoreSurvey, getSurveyFormById, updateScoreSurvey } from '../../api/Survey';
import { toast } from 'react-toastify';

const FormScoreAfterService = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listTopic, setListTopic] = useState([]);
    const [listCategory, setListCategory] = useState([]);
    const [listQuestion, setListQuestion] = useState([]);
    const [listScoreSurvey, setListScoreSurvey] = useState([]);
    const [modalCreateInstance, setModalCreateInstance] = useState(null);
    const [modalUpdateInstance, setModalUpdateInstance] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [formCreateData, setFormCreateData] = useState({
        id: "",
        topic_id: "",
        category_id: "",
        question_id: "",
        answers: [
            {
                score_name: "",
                score_value: ""
            }
        ]
    });

    // Modal
    const modalCreateRef = useRef(null);
    const modalUpdateRef = useRef(null);

    useEffect(() => {
        loadListTopic(token);
        loadListCategory(token);
        loadListQuestion();
        loadListScoreSurvey();
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
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    }

    const loadListScoreSurvey = async () => {
        try {
            setIsLoading(true);
            const res = await getListScoreSurvey();
            // console.log('ListData: ', res.data)
            setListScoreSurvey(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // option
    const topic_option = listTopic.filter(f => f.id === 1);
    const category_option = listCategory.filter(f => f.topic_id === 1);
    const question_option = listQuestion.filter(f => f.topic_id === 1 && f.category_id === 1);


    // อัปเดตค่าในฟอร์มทั่วไป
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormCreateData({
            ...formCreateData,
            [name]: value
        });
    }

    // อัปเดตคำตอบแบบ Dynamic
    const handleAnswerChange = (index, field, value) => {
        const updated = { ...formCreateData };
        updated.answers[index][field] = value;
        setFormCreateData(updated);
    }

    // ✅ เพิ่มคำตอบ
    const addAnswer = () => {
        setFormCreateData(prev => ({
            ...prev,
            answers: [
                ...prev.answers,
                { score_name: "", score_value: "" }
            ]
        }));
    }

    // ✅ ลบคำตอบ
    const removeAnswer = (index) => {
        setFormCreateData(prev => ({
            ...prev,
            answers: prev.answers.filter((_, i) => i !== index)
        }));
    }

    // ✅ ส่งข้อมูลไป backend
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        // console.log('Data: ', formCreateData)
        try {
            setIsLoading(true);
            const res = await createScoreSurvey(token, formCreateData);
            modalCreateInstance?.hide();
            loadListScoreSurvey(token);
            toast.success(res.data.message);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }

    }

    const itemsPerPage = 3; // ✅ แสดงหน้าละ 3 รายการ 

    // ✅ คำนวณข้อมูลที่จะแสดงในหน้านี้
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentItems = listScoreSurvey.slice(firstIndex, lastIndex);

    // ✅ จำนวนหน้า
    const totalPages = Math.ceil(listScoreSurvey.length / itemsPerPage);

    // ✅ ฟังก์ชันคลิกเลขหน้า
    const goToPage = (pageNum) => {
        setCurrentPage(pageNum);
    }

    // Open modal update
    const openModalUpdate = async (id) => {
        modalUpdateInstance?.show();
        try {
            // Code
            const res = await getSurveyFormById(token, id);
            setFormCreateData(res.data);
        } catch (err) {
            console.log(err)
        }
    }

    // Submit update form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            // Code
            const res = await updateScoreSurvey(token, formCreateData);
            modalUpdateInstance?.hide()
            loadListScoreSurvey(token);
            toast.success(res.data.message);
        } catch (err) {
            console.log
        }
    }

    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                <div className='d-flex justify-content-center'>
                    <h3>🗂️ เพิ่มคำตอบในแบบประเมิน After service</h3>
                </div>
                <div className='d-flex justify-content-end'>
                    <button
                        className='btn btn-success rounded-5'
                        onClick={() => modalCreateInstance?.show()}
                    >
                        ✚ เพิ่มคำตอบ After Service
                    </button>
                </div>

                {/* Table */}
                <div className='table-responsive mt-3'>
                    <table className='table table-bordered'>
                        <thead>
                            <tr>
                                <th className='text-center'>ลำดับ</th>
                                <th className='text-center'>ชื่อแบบประเมิน</th>
                                <th className='text-center'>คำถาม</th>
                                <th className='text-center'>คำตอบ</th>
                                <th className='text-center'>การแก้ไข</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentItems.length > 0 ? (
                                    currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className='text-center'>
                                                {index + 1}
                                            </td>
                                            <td>
                                                {listTopic.find(f => f.id === item.topic_id)?.topic_name || "-"}
                                            </td>
                                            <td>
                                                {listQuestion.find(f => f.id === item.question_id)?.question_name || "-"}
                                            </td>
                                            <td>
                                                {
                                                    item.answers.map((itm, idx) => (
                                                        <ul key={idx}>
                                                            <li>{itm.score_name}</li>
                                                        </ul>
                                                    ))
                                                }
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
                                        <td
                                            className='text-center'
                                            colSpan={4}
                                        >
                                            ไม่พบข้อมูล
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                {/* End table */}

                {/* Pagination */}
                <nav>
                    <ul className="pagination justify-content-center">

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
                {/* End pagination */}

                {/* Modal form create */}
                <div
                    className='modal fade'
                    id='createModal'
                    tabIndex='-1'
                    aria-labelledby='createModalLabel'
                    aria-hidden='true'
                    ref={modalCreateRef}
                >
                    <div className='modal-dialog'>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='createModalLabel'>
                                    📋 ฟอร์มบันทึกคำตอบในแบบประเมิน After Service
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
                                    <div className='text-center'>
                                        <h5><u>Section : คำถาม</u></h5>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อแบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formCreateData.topic_id}
                                            onChange={handleFormChange}
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
                                        <label className="form-label">กลุ่ม / ด้าน</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formCreateData.category_id}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">-- เลือกกลุ่ม / ด้าน --</option>
                                            {
                                                category_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.category_name_th}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">คำถาม</label>
                                        <select
                                            className='form-select'
                                            name='question_id'
                                            value={formCreateData.question_id}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">-- เลือกคำถาม --</option>
                                            {
                                                question_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.question_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className='text-center'>
                                        <h5><u>Section : คำตอบ</u></h5>
                                    </div>

                                    {formCreateData.answers.map((ans, idx) => (
                                        <div key={idx} className='d-flex gap-2 mb-2'>
                                            {/* ✅ ชื่อตัวเลือก */}
                                            <input
                                                type='text'
                                                className='form-control'
                                                placeholder='ตัวเลือก...'
                                                value={ans.score_name}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "score_name", e.target.value)
                                                }
                                                required
                                            />

                                            {/* ✅ คะแนน */}
                                            <input
                                                type='number'
                                                className='form-control'
                                                placeholder='คะแนน...'
                                                value={ans.score_value}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "score_value", e.target.value)
                                                }
                                                required
                                            />

                                            {/* ✅ ปุ่มลบ */}
                                            {formCreateData.answers.length > 1 && (
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
                                            className='btn btn-sm btn-primary rounded-5'
                                            onClick={addAnswer}
                                        >
                                            <CirclePlus /> เพิ่มคำตอบ
                                        </button>
                                    </div>

                                    <div className='modal-footer'>
                                        <button
                                            type='button'
                                            className='btn btn-secondary rounded-5'
                                            data-bs-dismiss='modal'
                                        >
                                            ปิดหน้าต่าง
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn btn-success rounded-5'
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
                {/* End modal form create */}

                {/* Modal form update */}
                <div
                    className='modal fade'
                    id='updateModal'
                    tabIndex='-1'
                    aria-labelledby='updateModalLabel'
                    aria-hidden='true'
                    ref={modalUpdateRef}
                >
                    <div className='modal-dialog'>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='updateModalLabel'>
                                    📋 ฟอร์มแก้ไขคำตอบในแบบประเมิน After Service
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
                                    <div className='text-center'>
                                        <h5><u>Section : คำถาม</u></h5>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อแบบประเมิน</label>
                                        <select
                                            className='form-select'
                                            name='topic_id'
                                            value={formCreateData.topic_id}
                                            onChange={handleFormChange}
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
                                        <label className="form-label">กลุ่ม / ด้าน</label>
                                        <select
                                            className='form-select'
                                            name='category_id'
                                            value={formCreateData.category_id}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">-- เลือกกลุ่ม / ด้าน --</option>
                                            {
                                                category_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.category_name_th}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">คำถาม</label>
                                        <select
                                            className='form-select'
                                            name='question_id'
                                            value={formCreateData.question_id}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">-- เลือกคำถาม --</option>
                                            {
                                                question_option.map((item, idx) => (
                                                    <option key={idx} value={item.id}>
                                                        {item.question_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className='text-center'>
                                        <h5><u>Section : คำตอบ</u></h5>
                                    </div>

                                    {formCreateData.answers.map((ans, idx) => (
                                        <div key={idx} className='d-flex gap-2 mb-2'>
                                            {/* ✅ ชื่อตัวเลือก */}
                                            <input
                                                type='text'
                                                className='form-control'
                                                placeholder='ตัวเลือก...'
                                                value={ans.score_name}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "score_name", e.target.value)
                                                }
                                                required
                                            />

                                            {/* ✅ คะแนน */}
                                            <input
                                                type='number'
                                                className='form-control'
                                                placeholder='คะแนน...'
                                                value={ans.score_value}
                                                onChange={(e) =>
                                                    handleAnswerChange(idx, "score_value", e.target.value)
                                                }
                                                required
                                            />

                                            {/* ✅ ปุ่มลบ */}
                                            {formCreateData.answers.length > 1 && (
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
                                            className='btn btn-sm btn-primary rounded-5'
                                            onClick={addAnswer}
                                        >
                                            <CirclePlus /> เพิ่มคำตอบ
                                        </button>
                                    </div>

                                    <div className='modal-footer'>
                                        <button
                                            type='button'
                                            className='btn btn-secondary rounded-5'
                                            data-bs-dismiss='modal'
                                        >
                                            ปิดหน้าต่าง
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn btn-success rounded-5'
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
                {/* End form update */}

            </div>
        </>
    )
}

export default FormScoreAfterService
