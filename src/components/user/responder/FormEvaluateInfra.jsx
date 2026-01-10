import { Fragment, useEffect, useRef, useState } from 'react'
import useGlobalStore from '../../../store/global-store'
import { getListQuestionByCatId } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getListChoices } from '../../../api/Choices';
import { Eye, FolderOpenIcon, Trash2, UploadIcon } from 'lucide-react';
import { Modal } from 'bootstrap';
import { getEvidenceFiles, uploadEvidenceFile, removeEvidenceFileById, getListEvidence } from '../../../api/Uploadfile';
import Swal from 'sweetalert2';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createEvaluation, getDraftEvaluation } from '../../../api/Evaluate';

const FormEvaluateInfra = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listQuestion, setListQuestion] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [selectQuestion, setSelectQuestion] = useState(null);
    const [listSubQuestion, setListSubQuestion] = useState([]);
    const [listChoices, setListChoices] = useState([]);
    const [modalUploadInstance, setModalUploadInstance] = useState(null);
    const [modalShowEvInstance, setModalShowEvInstance] = useState(null);
    const [modalConfirmDelInstance, setModalConfirmDelInstance] = useState(null);
    const [modalConfirmSendInstance, setModalConfirmSendInstance] = useState(null);
    const [evidenceId, setEvidenceId] = useState('');
    const [fileEvidences, setFileEvidences] = useState('');
    const [listEvidence, setListEvidence] = useState([]);
    const [evaluateId, setEvaluateId] = useState(null);
    const [isDraft, setIsDraft] = useState(true);
    const [answers, setAnswers] = useState({}); // key=sub_question_id
    const [draftData, setDraftData] = useState(null);


    const topic_id = 2;
    const category_id = 2;
    const hcode9 = user?.hcode9;
    const user_id = user?.id;

    // File upload sector
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileError, setFileError] = useState('');

    const modalUploadRef = useRef(null);
    const modalShowEvRef = useRef(null);
    const modalConfirmDel = useRef(null);
    const modalConfirmSend = useRef(null);

    useEffect(() => {
        loadListQuestion(token);
        loadListSubQuestion(token);
        loadListChoices(token);
        loadFileUpload(token);
        // สร้าง instance ของ Modal จาก ref
        if (modalUploadRef.current) {
            setModalUploadInstance(new Modal(modalUploadRef.current));
        }
        if (modalShowEvRef.current) {
            setModalShowEvInstance(new Modal(modalShowEvRef.current));
        }
        if (modalConfirmDel.current) {
            setModalConfirmDelInstance(new Modal(modalConfirmDel.current));
        }
        if (modalConfirmSend.current) {
            setModalConfirmSendInstance(new Modal(modalConfirmSend.current));
        }
    }, []);

    // หมวดโครงสร้างพื้นฐาน
    const loadListQuestion = async () => {
        try {
            setIsLoading(true);
            const res = await getListQuestionByCatId(token, category_id);
            setListQuestion(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const questOptions = listQuestion.map(item => ({
        value: item.id,
        label: item.question_name
    }));

    // Handle select question
    const handleSelectQuestion = (e) => {
        const selectedValue = e.target.value;
        setSelectQuestion(selectedValue);

        if (selectedValue === "") {
            setSearchQuery([]);
            return;
        }

        const question_id = Number(selectedValue);

        const filteredQuestions = listQuestion.filter(
            (question) => question.id === question_id
        );

        setSearchQuery(filteredQuestions);

        // ✅ ใช้ค่าที่เลือกจริง
        loadDraft(question_id);
    };


    // Load SubQuestions
    const loadListSubQuestion = async () => {
        try {
            const res = await getListSubQuestion(token);
            setListSubQuestion(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    // Load Choices
    const loadListChoices = async () => {
        try {
            const res = await getListChoices(token);
            setListChoices(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    // Load file upload
    const loadFileUpload = async () => {
        try {
            const res = await getListEvidence(token);

            const filtered = res.data.filter(f => f.hcode9 === hcode9 && f.category_id === category_id);
            setFileEvidences(filtered)
        } catch (err) {
            console.log(err);
        }
    }


    // เลือกไฟล์
    const handleFilterChange = (e) => {
        const selectedFile = e.target.files[0];
        setFileError('');

        if (!selectedFile) return;

        // ตรวจสอบ file type
        if (selectedFile.type !== 'application/pdf') {
            setFileError('❌ รองรับเฉพาะไฟล์ PDF เท่านั้น');
            e.tatget.value = "";
            return;
        }

        // ตรวจสอบขนาดไฟล์
        if (selectedFile.size > MAX_FILE_SIZE) {
            setFileError('❌ ขนาดไฟล์เกิน 15 MB กรุณาเลือกไฟล์ใหม่');
            e.target.value = "";
            return;
        }

        // สร้าง preview url
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result); // base64 (ถ้าต้องใช้)
        };
        reader.readAsDataURL(selectedFile);
        setFile(selectedFile);
    }

    // ลบไฟล์ ก่อนอัปโหลด
    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview(null);
        setFileError('');
        document.getElementById('file_ev').value = "";
    }

    // Form Upload file
    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setFileError('❌ กรุณาเลือกไฟล์ก่อนอัปโหลด');
            return;
        }

        // สร้าง FormData เพื่อส่งไฟล์
        const formData = new FormData();
        formData.append('file_ev', file);
        formData.append('user_id', user.id);
        formData.append('category_id', category_id);
        formData.append('hcode9', user.hcode9);

        // ทำการส่งข้อมูลไปยัง API
        try {
            setIsLoading(true);
            const res = await uploadEvidenceFile(token, formData);
            // ปิด modal หลังอัปโหลดเสร็จ
            modalUploadInstance.hide();

            // รีเซ็ตฟอร์ม
            Swal.fire({
                title: "📢 แจ้งผลการแนบไฟล์หลักฐาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
            handleRemoveFile()
            loadFileUpload(token);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }

    };

    // แสดงไฟล์หลักฐานที่อัปโหลดแล้ว
    const showEvidenceFiles = async () => {
        modalShowEvInstance.show();
    }


    // Remove evidence file
    const handleRemoveEvidence = async (id) => {
        setEvidenceId(id);
        // เปิด Modal
        modalConfirmDelInstance.show();
    }

    const handleConfirmSubmit = async () => {
        try {
            const res = await removeEvidenceFileById(token, evidenceId);
            // ปิด Modal
            modalConfirmDelInstance.hide();
            modalShowEvInstance.hide();

            loadFileUpload(token);

            Swal.fire({
                title: "📢 แจ้งผลการลบไฟล์หลักฐาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
        } catch (err) {
            console.log(err)
        }
    }

    // กระบวนการ Save Evaluate
    const handleRadioChange = ({
        sub_question_id,
        choice_id,
        answer_id,
        choice_value,
        choice_required
    }) => {
        setAnswers(prev => ({
            ...prev,
            [sub_question_id]: {
                sub_question_id,
                choice_id,
                answer_id,
                choice_value,
                choice_required
            }
        }))
    }


    // Load Draft
    const loadDraft = async (question_id) => {
        const res = await getDraftEvaluation(token, question_id, hcode9);
        setDraftData(res.data);

        if (!res.data) {
            setEvaluateId(null);
            setAnswers({});
            return;
        }

        const map = {};
        res.data?.evaluateAnswers.forEach(a => {
            map[a.sub_question_id] = {
                sub_question_id: a.sub_question_id,
                choice_id: a.choice_id,
                answer_id: a.answer_id,
                choice_value: a.choice_value,
                choice_required: a.choice_required
            };
        });
        setEvaluateId(res.data?.id);
        setAnswers(map);
    };

    const validateBeforeSubmit = () => {
        const requiredSubs = listSubQuestion.map(s => s.id);
        const answered = Object.keys(answers).map(Number);

        return requiredSubs.every(id => answered.includes(id));
    }

    const saveEvaluate = async (e, submit = false) => {
        e.preventDefault();

        if (Object.keys(answers).length === 0) {
            toast.warning("กรุณาเลือกคำตอบอย่างน้อย 1 ข้อ")
            return;
        }

        const payload = {
            evaluate_id: evaluateId,
            topic_id: topic_id,
            category_id: category_id,
            question_id: selectQuestion,
            hcode9: hcode9,
            user_id: user_id,
            is_draft: !submit,
            answers: Object.values(answers).map(a => ({
                topic_id: topic_id,
                category_id: category_id,
                question_id: selectQuestion,
                sub_question_id: a.sub_question_id,
                choice_id: a.choice_id,
                answer_id: a.answer_id,
                choice_value: a.choice_value,
                choice_required: a.choice_required
            }))
        }

        // console.log("Payload: ", payload)

        try {
            setIsLoading(true);

            const res = await createEvaluation(token, payload);
            loadDraft(res.data.question_id, hcode9);    
            
            if (submit === true) {
                Swal.fire({
                    title: "📢 แจ้งผลการส่งแบบประเมิน!",
                    text: `✅ ส่งประเมินเรียบร้อย!`,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                Swal.fire({
                    title: "📢 แจ้งผลการบันทึกร่าง!",
                    text: `💾 บันทึกร่างเรียบร้อย`,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } catch (err) {
            console.log(err);
            toast.dismiss("❌ เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                <div className='d-flex justify-content-center'>
                    <h3 className='p-3'>แบบประเมินด้านโครงสร้างพื้นฐาน (Infrastructure)</h3>
                </div>

                {/* Search question */}
                <div className='d-flex justify-content-center mb-2 gap-3'>
                    {/* Select */}
                    <select
                        className="form-select w-50"
                        aria-label="Select question to search"
                        value={selectQuestion ?? ""}
                        onChange={handleSelectQuestion}
                    >
                        <option value="">-- เลือกหัวข้อเพื่อตอบแบบประเมิน --</option>
                        {
                            questOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))
                        }
                    </select>
                    {/* Upload evidence */}
                    {
                        fileEvidences.length > 0 ? (
                            <>
                                <button
                                    className='btn btn-outline-primary'
                                    onClick={showEvidenceFiles}
                                >
                                    <FolderOpenIcon className="me-2" size={16} /> ดูหลักฐานที่อัปโหลดแล้ว
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className='btn btn-outline-success'
                                    onClick={() => modalUploadInstance.show()}
                                >
                                    <UploadIcon className="me-2" size={16} /> อัปโหลดหลักฐาน
                                </button>
                            </>
                        )
                    }
                </div>
                {/* คำอธิบาย */}
                <div className='alert alert-success mt-3' role='alert'>
                    📌 กรุณาเลือกคำตอบให้ครบทุกข้อ หากยังไม่สามารถประเมินได้ สามารถบันทึกร่างไว้ก่อน แล้วกลับมาทำต่อภายหลังได้ <br />
                    📌 เมื่อแนบไฟล์หลักฐานแล้ว หากต้องการเปลี่ยนไฟล์ใหม่ กรุณาลบไฟล์เดิมก่อน แล้วจึงอัปโหลดไฟล์ใหม่ <br />
                    📌 เมื่อส่งประเมินแล้ว จะไม่สามารถแก้ไขข้อมูลได้อีก
                </div>

                {/* แบบสอบถาม */}
                <form onSubmit={(e) => saveEvaluate(e, true)}>
                    <div className='table-responsive mt-3'>
                        <table className="table table-bordered">
                            <thead>
                                {/* tr แรก : หัวข้อหลัก */}
                                <tr className="table-success">
                                    <th className="text-center">แบบประเมินโครงสร้างพื้นฐาน</th>
                                    {/* <th className="text-center" style={{ width: "150px" }}>คะแนนเต็ม</th>
                                    <th className="text-center" style={{ width: "150px" }}>คะแนนจำเป็น</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    searchQuery.length === 0 && (
                                        <tr>
                                            <td className="text-center">
                                                -- ไม่มีข้อมูลคำถามย่อย กรุณาเลือกหัวข้อเพื่อตอบแบบประเมิน --
                                            </td>
                                        </tr>
                                    )
                                }
                                {
                                    searchQuery.length > 0 && searchQuery.map((item, idx) => (
                                        <Fragment key={idx}>
                                            {/* Parent row */}
                                            <tr className="table-secondary">
                                                <td colSpan={3} className="fw-bold">
                                                    {item.question_name}
                                                </td>
                                            </tr>
                                            {/* Children rows */}
                                            {
                                                listSubQuestion.length > 0 && listSubQuestion
                                                    .filter(f => f.question_id === item.id)
                                                    .map((item2, idx2) => (
                                                        <tr key={idx2}>
                                                            <td
                                                                style={{ paddingLeft: "30px" }}
                                                                className="fw-bold"
                                                            >
                                                                <div className="mb-2">
                                                                    <span>
                                                                        {item2.sub_quest_name
                                                                            ?.split("\n")
                                                                            .map((line, index) => (
                                                                                <div
                                                                                    key={index}
                                                                                    style={{
                                                                                        marginLeft: index === 0 ? 0 : 40,
                                                                                        whiteSpace: "pre-line"
                                                                                    }}
                                                                                >
                                                                                    {line}
                                                                                </div>
                                                                            ))}
                                                                    </span>
                                                                </div>
                                                                {
                                                                    listChoices.length > 0 && listChoices
                                                                        .filter(f => f.sub_question_id === item2.id)
                                                                        .map((item3, idx3) => (
                                                                            <div key={idx3} className="d-flex flex-lg-column gap-1">
                                                                                {item3.answers.map((answer, answerIdx) => {
                                                                                    const isNegative = answer.choice_text.trim().startsWith("ไม่มี");

                                                                                    return (
                                                                                        <div
                                                                                            key={answer.id ?? answerIdx}
                                                                                            className="form-check"
                                                                                            style={{
                                                                                                marginLeft: 40
                                                                                            }}
                                                                                        >
                                                                                            <input
                                                                                                className="form-check-input"
                                                                                                type="radio"
                                                                                                name={`subquestion_${item2.id}`}
                                                                                                checked={answers[item2.id]?.answer_id === answer.id}
                                                                                                disabled={draftData?.is_draft === false}
                                                                                                onChange={() =>
                                                                                                    handleRadioChange({
                                                                                                        sub_question_id: item2.id,
                                                                                                        choice_id: item3.id,
                                                                                                        answer_id: answer.id,
                                                                                                        choice_value: answer.choice_value,
                                                                                                        choice_required: answer.choice_required
                                                                                                    })
                                                                                                }
                                                                                            />
                                                                                            <label
                                                                                                className={`form-check-label fw-semibold ${isNegative ? "text-danger" : "text-success"
                                                                                                    }`}
                                                                                                htmlFor={`choice_${item3.id}_answer_${answerIdx}`}
                                                                                            >
                                                                                                {answer.choice_text}
                                                                                            </label>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        ))
                                                                }
                                                            </td>
                                                            {/* <td className="text-center align-middle">
                                                                {
                                                                    listChoices.length > 0 && listChoices
                                                                        .filter(f => f.sub_question_id === item2.id)
                                                                        .map((item3, idx3) => (
                                                                            <div key={idx3}>
                                                                                {item3.answers.map((answer, answerIdx) => (
                                                                                    <div
                                                                                        key={answer.id ?? answerIdx}
                                                                                        className="d-flex justify-content-center"
                                                                                    >
                                                                                        <span className={answer.choice_value === 0 ? "fw-semibold text-danger" : "fw-semibold text-success"}>
                                                                                            {answer.choice_value === 0 && answer.choice_required === 0 ? null : answer.choice_value}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ))
                                                                }
                                                            </td>
                                                            <td className="text-center align-middle">
                                                                {
                                                                    listChoices.length > 0 && listChoices
                                                                        .filter(f => f.sub_question_id === item2.id)
                                                                        .map((item3, idx3) => (
                                                                            <div key={idx3}>
                                                                                {item3.answers.map((answer, answerIdx) => (
                                                                                    <div
                                                                                        key={answer.id ?? answerIdx}
                                                                                        className="d-flex justify-content-center"
                                                                                    >
                                                                                        <span className={answer.choice_required === 0 ? "fw-semibold text-danger" : "fw-semibold text-success"}>
                                                                                            {answer.choice_value === 0 && answer.choice_required === 0 ? "" : answer.choice_required}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ))
                                                                }
                                                            </td> */}
                                                        </tr>
                                                    ))
                                            }
                                        </Fragment>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    {
                        selectQuestion && (
                            <>
                                <div className="d-flex justify-content-end gap-2 mt-3 mb-3">
                                    {/* Save Draft */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning"
                                        disabled={isLoading || draftData?.is_draft === false}
                                        onClick={(e) => saveEvaluate(e, false)}
                                    >
                                        💾 บันทึกร่าง
                                    </button>

                                    {/* Submit */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        disabled={isLoading || draftData?.is_draft === false}
                                        onClick={() => modalConfirmSendInstance.show()}
                                    >
                                        📤 ส่งประเมิน
                                    </button>
                                </div>
                            </>
                        )
                    }
                </form>

                {/* Modal Upload */}
                <div
                    className='modal fade'
                    id='formUploadModal'
                    tabIndex='-1'
                    aria-labelledby='formUploadModalLabel'
                    aria-hidden='true'
                    ref={modalUploadRef}
                >
                    <div className='modal-dialog' style={{ marginTop: "70px" }}>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='formUploadModalLabel'>
                                    📋 แนบไฟล์หลักฐานด้านโครงสร้างพื้นฐาน (Infrastructure)
                                </h5>
                                <button
                                    type='button'
                                    className='btn-close btn-close-white'
                                    data-bs-dismiss='modal'
                                    aria-label='Close'
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <form onSubmit={handleUploadSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">แนบไฟล์หลักฐาน</label>
                                        <input
                                            id='file_ev'
                                            type='file'
                                            className='form-control'
                                            name='file_ev'
                                            accept='application/pdf'
                                            onChange={handleFilterChange}
                                            disabled={!!file}
                                            required
                                        />
                                    </div>
                                    {
                                        file && (
                                            <div className='alert alert-info d-flex justify-content-between align-items-center'>
                                                <span>📄 {file.name}</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={handleRemoveFile}
                                                >
                                                    ลบไฟล์
                                                </button>
                                            </div>
                                        )
                                    }

                                    {fileError && (
                                        <div className='alert alert-danger'>
                                            {fileError}
                                        </div>
                                    )}

                                    <div className='modal-footer'>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            ปิด
                                        </button>
                                        <button
                                            type='submit'
                                            className="btn btn-outline-success"
                                            disabled={!file || isLoading}
                                        >
                                            {isLoading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Modal Show Evidence Files */}
                <div
                    className='modal fade'
                    id='modalShowEvidenceFiles'
                    tabIndex='-1'
                    aria-labelledby='modalShowEvidenceFilesLabel'
                    aria-hidden='true'
                    ref={modalShowEvRef}
                >
                    <div className='modal-dialog modal-lg' style={{ marginTop: "70px" }}>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='modalShowEvidenceFilesLabel'>
                                    📂 หลักฐานที่อัปโหลดแล้ว
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className='modal-body'>
                                {fileEvidences && (
                                    <>
                                        <div className='d-flex flex-wrap justify-content-between align-items-center mb-3'>
                                            <div>
                                                <strong>📄 ชื่อไฟล์:</strong> {fileEvidences[0]?.file_ev}
                                            </div>
                                            <button
                                                type='button'
                                                className='btn btn-sm btn-outline-danger'
                                                onClick={() => handleRemoveEvidence(fileEvidences[0]?.id)}
                                            >
                                                <Trash2 size={16} /> ลบไฟล์
                                            </button>
                                        </div>

                                        <div className='mb-3'>
                                            {
                                                fileEvidences.length > 0 && (
                                                    <iframe
                                                        src={`${import.meta.env.VITE_APP_API}/evidence_files/${fileEvidences[0]?.file_ev}`}
                                                        title="Preview PDF"
                                                        width="100%"
                                                        height="500px"
                                                    />
                                                )
                                            }
                                        </div>
                                    </>
                                )}
                                <div className='modal-footer'>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        ปิด
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal confirm remove */}
                <div
                    className="modal fade"
                    id="confirmModal"
                    tabIndex="-1"
                    aria-labelledby="confitmModalLabel"
                    aria-hidden="true"
                    ref={modalConfirmDel}
                >
                    <div className="modal-dialog" style={{ marginTop: '100px' }}>
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title" id="confitmModalLabel">
                                    ⚠️ ยืนยันการลบหลักฐาน
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center">
                                คุณต้องการลบหลักฐานหรือไม่?
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    ยกเลิกการลบหลักฐาน
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={handleConfirmSubmit}
                                >
                                    ยืนยันการลบหลักฐาน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal confirm send evaluation */}
                <div
                    className="modal fade"
                    id="confirmSendModal"
                    tabIndex="-1"
                    aria-labelledby="confirmSendModalLabel"
                    aria-hidden="true"
                    ref={modalConfirmSend}
                >
                    <div className="modal-dialog" style={{ marginTop: '100px' }}>
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title" id="confirmSendModalLabel">
                                    ⚠️ ยืนยันการส่งการประเมิน
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center fw-bold">
                                คุณต้องการส่งการประเมินหรือไม่?
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    ยกเลิกการส่งการประเมิน
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    disabled={isLoading}
                                    onClick={async () => {
                                        setIsLoading(true);
                                        await saveEvaluate(new Event('submit'), true);
                                        modalConfirmSendInstance.hide();
                                        setIsLoading(false);
                                    }}
                                >
                                    ยืนยันการส่งการประเมิน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default FormEvaluateInfra