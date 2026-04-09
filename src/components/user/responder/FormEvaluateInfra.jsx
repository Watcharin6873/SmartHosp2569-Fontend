import { Fragment, useEffect, useRef, useState } from 'react'
import useGlobalStore from '../../../store/global-store'
import { getListQuestionByCatId } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getListChoices } from '../../../api/Choices';
import { Eye, FolderOpenIcon, Trash2, UploadIcon } from 'lucide-react';
import { Modal } from 'bootstrap';
import {
    getEvidenceFiles,
    uploadEvidenceFile,
    removeEvidenceFileById,
    getListEvidence,
    getListEvidenceByHcode9
} from '../../../api/Uploadfile';
import Swal from 'sweetalert2';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    createEvaluation,
    getDraftEvaluation,
    requestForEditEvaluation,
    getScoreHospitalForSubQuestion2
} from '../../../api/Evaluate';
import { getProvApproveEvaluation } from '../../../api/Approve';
import FormUploadEvidence from './FormUploadEvidence';
import FormReviewEvidence from './FormReviewEvidence';
import ChatPanel from '../province/ChatPanel';

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
    const [listEvidenceSubId, setListEvidenceSubId] = useState([]);
    const [evaluateId, setEvaluateId] = useState(null);
    const [isDraft, setIsDraft] = useState(true);
    const [answers, setAnswers] = useState({}); // key=sub_question_id
    const [draftData, setDraftData] = useState(null);
    const [answersBySubId, setAnswersBySubId] = useState(null);
    const [evidenceBySubId, setEvidenceBySubId] = useState(null);
    const [hcode9, setHcode9] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [scoreForSubQuestion, setScoreForSubQuestion] = useState([]);
    const [listProvApprove, setListProvApprove] = useState([]);

    useEffect(() => {
        if (user?.hcode9) {
            setHcode9(user.hcode9);
        }
    }, [user]);

    // console.log('HCODE9: ', hcode9);

    const topic_id = 2;
    const category_id = 2;
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
        if (!token) return;

        loadListQuestion(token);
        loadListSubQuestion(token);
        loadListChoices(token);
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
    }, [token]);

    useEffect(() => {
        if (!hcode9) return;

        loadScoreForSubQuestion(token);
        loadEvidenceSubId(token);
        loadFileUpload(token);
        loadListProvApprove(token);
    }, [hcode9]);

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

    // Handle get scores for sub question
    const loadScoreForSubQuestion = async () => {
        try {
            const res = await getScoreHospitalForSubQuestion2(token, user?.hcode9)
            // console.log('R: ', res.data);
            setScoreForSubQuestion(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const scoreByCatId = scoreForSubQuestion.filter(f => f.category_id === category_id);

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

    // Load evidence_sub_id 
    const loadEvidenceSubId = async () => {
        try {
            // Code
            const res = await getListEvidenceByHcode9(token, hcode9);
            setListEvidenceSubId(res.data)
        } catch (err) {
            console.log(err)
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

    // Load province approve evaluation
    const loadListProvApprove = async () => {
        try {
            const res = await getProvApproveEvaluation(token, category_id, hcode9);
            // console.log('Data:', res.data);
            setListProvApprove(res.data)
        } catch (err) {
            console.log(err)
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

        if (!user?.id || !user?.hcode9) {
            toast.error("ข้อมูลผู้ใช้ยังไม่พร้อม");
            return;
        }

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
        // console.log('data: ', res.data);
        setDraftData(res.data);

        if (!res.data) {
            setEvaluateId(null);
            setAnswers({});
            return;
        }

        const map = {};
        res.data.evaluateAnswers.forEach(a => {
            // 🔑 ถ้าเป็น checkbox → เก็บเป็น array
            if (a.subQuestions.question_type === "checkbox") {
                if (!Array.isArray(map[a.sub_question_id])) {
                    map[a.sub_question_id] = [];
                }

                map[a.sub_question_id].push({
                    id: a.id,
                    evaluate_id: a.evaluate_id,
                    sub_question_id: a.sub_question_id,
                    choice_id: a.choice_id,
                    answer_id: a.answer_id,
                    answer_value: a.answer_value,
                    answer_required: a.answer_required,
                    answer_text: a.answer_text || null
                });
            } else {
                // 🔑 radio → object เดี่ยว
                map[a.sub_question_id] = {
                    id: a.id,
                    evaluate_id: a.evaluate_id,
                    sub_question_id: a.sub_question_id,
                    choice_id: a.choice_id,
                    answer_id: a.answer_id,
                    answer_value: a.answer_value,
                    answer_required: a.answer_required
                };
            }
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
            loadScoreForSubQuestion(token)

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

    // Upload evidence file by sub question id
    const handleUploadEvidence = (subQuestId) => {
        // 🔑 ถ้าเป็น array (checkbox)
        if (Array.isArray(subQuestId)) {
            const first = subQuestId[0]; // เอาแค่ตัวเดียว
            if (!first) return;

            setAnswersBySubId({
                oneAnswer: first,
                answers: subQuestId
            });
            return;
        }

        // 🔑 radio / single
        setAnswersBySubId({
            oneAnswer: subQuestId,
            answers: [subQuestId]
        });
    }

    // Review evidence by subItemId
    const handleReviewEvidence = (subQuestId) => {
        const evidenceData = listEvidenceSubId.find(f => f.sub_question_id === subQuestId);

        if (evidenceData) {
            setEvidenceBySubId({ ...evidenceData })
        }
    }

    const requestEdit = async (e, isDraft = true) => {
        e.preventDefault();

        if (!selectQuestion || !hcode9 || !user_id) {
            console.warn("ข้อมูลไม่ครบ", { selectQuestion, hcode9, user_id });
            return;
        }

        const values = {
            question_id: selectQuestion,
            hcode9,
            user_id,
            is_draft: isDraft
        };

        try {
            const res = await requestForEditEvaluation(token, values)
            loadDraft(res.data.question_id, hcode9);

            Swal.fire({
                title: "📢 แจ้งผลการขอแก้ไขแบบประเมิน!",
                text: `✅ ${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

        } catch (err) {
            console.log(err);
        }
    };

    const EDIT_DEADLINE = new Date("2026-07-31T23:59:59");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = EDIT_DEADLINE - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                clearInterval(timer);
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    const renderHighlightText = (text) => {
        const regex = /(คะแนนเต็ม\[\d+\])\s*(คะแนนจำเป็น\[\d+\])/;
        const match = text.match(regex);

        if (!match) return text;

        const before = text.split(match[0])[0];

        return (
            <>
                {before}
                <span className="text-primary fw-bold">{match[1]}</span>{" "}
                <span className="text-danger fw-bold">{match[2]}</span>
                {")"}
            </>
        );
    };


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
                                    className='btn btn-outline-primary btn-sm'
                                    onClick={showEvidenceFiles}
                                >
                                    <FolderOpenIcon className="me-2" size={16} /> ดูหลักฐานรวม
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className='btn btn-outline-success btn-sm'
                                    onClick={() => modalUploadInstance.show()}
                                >
                                    <UploadIcon className="me-2" size={16} /> แนบหลักฐานรวม
                                </button>
                            </>
                        )
                    }
                </div>
                {/* คำอธิบาย */}
                <div className='alert alert-success mt-3' role='alert'>
                    📌 กรุณาเลือกคำตอบให้ครบทุกข้อ หากยังไม่สามารถส่งประเมินได้ สามารถกดปุ่ม "บันทึกร่าง" ไว้ก่อน แล้วกลับมาทำต่อภายหลังได้ <br />
                    📌 ในระหว่างที่ยังไม่ประเมิน หรือ ระหว่างบันทึกร่าง ปุ่ม "แก้ไขแบบประเมิน" จะถูกปิดไว้ <br />
                    📌 เมื่อกดปุ่ม "ส่งแบบประเมิน" แล้ว ปุ่ม "แก้ไขแบบประเมิน" จะเปิดให้สามารถแก้ไขแบบประเมินได้จนถึง 31 กรกฎาคม 2569 (รอบส่งแบบประเมินรอบที่ 2) <br />
                    📌 เมื่อแนบไฟล์หลักฐานแล้ว หากต้องการเปลี่ยนไฟล์ใหม่ กรุณาลบไฟล์เดิมก่อน แล้วจึงอัปโหลดไฟล์ใหม่ <br />
                    📌 คะแนนที่แสดงจะเป็นคะแนนตามเกณฑ์ประเมินฯ หลังจาก คกก.ระดับจังหวัด อนุมัติเรียบร้อยแล้ว (หากสถานะ "ไม่ผ่าน" หรือยังไม่อนุมัติ คะแนนจะเป็น 0)
                </div>

                {/* แบบสอบถาม */}
                <form onSubmit={(e) => saveEvaluate(e, true)}>
                    <div className='table-responsive mt-3'>
                        <table className="table table-bordered">
                            <thead>
                                {/* tr แรก : หัวข้อหลัก */}
                                <tr className="table-success">
                                    <th className="text-center align-middle">แบบประเมินด้านการบริการ</th>
                                    <th className="text-center align-middle" style={{ width: "100px" }}>คะแนนเต็ม</th>
                                    <th className="text-center align-middle" style={{ width: "100px" }}>คะแนนจำเป็น</th>
                                    <th className="text-center align-middle" style={{ width: "20%" }}>ความคิดเห็น</th>
                                    <th className="text-center align-middle" style={{ width: "10%" }}>คกก.ระดับจังหวัด</th>
                                    <th className="text-center align-middle" style={{ width: "10%" }}>คกก.ระดับเขตฯ</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    searchQuery.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center">
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
                                                <td colSpan={6} className="fw-bold">
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
                                                                <div className="mb-2 gap-2">
                                                                    <span>
                                                                        {item2.sub_quest_name
                                                                            ?.split("\n")
                                                                            .map((line, index) => (
                                                                                <span key={index}>
                                                                                    {index > 0 && <br />}
                                                                                    <span
                                                                                        style={{
                                                                                            marginLeft: index === 0 ? 0 : 40,
                                                                                            display: "inline-block",
                                                                                            whiteSpace: "pre-line"
                                                                                        }}
                                                                                    >
                                                                                        {renderHighlightText(line)}
                                                                                    </span>
                                                                                </span>
                                                                            ))}
                                                                        {item2.is_required === true && (
                                                                            <span className="text-danger fw-bold ms-2">
                                                                                (*จำเป็น)
                                                                            </span>
                                                                        )}
                                                                        {(() => {
                                                                            const curAnswer = answers[item2.id];

                                                                            // มีคำตอบหรือไม่ (รองรับ radio / checkbox)
                                                                            const hasAnswer = Array.isArray(curAnswer)
                                                                                ? curAnswer.length > 0
                                                                                : curAnswer?.sub_question_id === item2.id;

                                                                            // มีหลักฐานแล้วหรือยัง
                                                                            const hasEvidence = listEvidenceSubId?.some(ev => parseInt(ev.sub_question_id) === parseInt(item2.id))


                                                                            if (!hasAnswer) return null;

                                                                            return !hasEvidence ? (
                                                                                <span
                                                                                    className='btn btn-warning btn-sm px-1 py-0 ms-2'
                                                                                    onClick={() => handleUploadEvidence(answers[item2.id])} // ✅ ส่งค่าเดียว
                                                                                >
                                                                                    แนบหลักฐาน
                                                                                </span>
                                                                            ) : (
                                                                                <span
                                                                                    className='btn btn-primary btn-sm px-1 py-0 ms-2'
                                                                                    onClick={() => handleReviewEvidence(item2.id)}
                                                                                >
                                                                                    ดูหลักฐาน
                                                                                </span>
                                                                            );
                                                                        })()}

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
                                                            <td className='text-center align-middle'>
                                                                {
                                                                    scoreByCatId && scoreByCatId
                                                                        .filter(f =>
                                                                            f.question_id === item2.question_id &&
                                                                            f.sub_question_id === item2.id
                                                                        )
                                                                        .map((score, sIdx) => (
                                                                            <p
                                                                                key={sIdx}
                                                                                className='fw-bold text-primary'
                                                                            >
                                                                                {score.answer_value}
                                                                            </p>
                                                                        ))
                                                                }
                                                            </td>
                                                            <td className='text-center align-middle'>
                                                                {
                                                                    scoreByCatId && scoreByCatId
                                                                        .filter(f =>
                                                                            f.question_id === item2.question_id &&
                                                                            f.sub_question_id === item2.id
                                                                        )
                                                                        .map((score, sIdx) => (
                                                                            <p
                                                                                key={sIdx}
                                                                                className='fw-bold text-secondary'
                                                                            >
                                                                                {score.answer_required}
                                                                            </p>
                                                                        ))
                                                                }
                                                            </td>
                                                            <td>
                                                                <ChatPanel
                                                                    key={`${selectQuestion}-${item2.id}-${hcode9}`}
                                                                    categoryId={category_id}
                                                                    questionId={item2.question_id}
                                                                    subQuestionId={item2.id}
                                                                    hospitalCode={hcode9}
                                                                    role="HOSPITAL" // หรือ "PROVINCE"
                                                                />
                                                            </td>
                                                            <td className='text-center align-middle'>
                                                                {listProvApprove && (listProvApprove
                                                                    .filter(f =>
                                                                        f.question_id === item2.question_id &&
                                                                        f.sub_question_id === item2.id
                                                                    )
                                                                    .map((proof, idx) =>
                                                                        <div key={idx} className="d-flex justify-content-center">
                                                                            {
                                                                                proof.prov_status === "PASS"
                                                                                    ? (
                                                                                        <label
                                                                                            className="form-check-label text-success fw-semibold"
                                                                                        >
                                                                                            อนุมัติแล้ว "ผ่าน"
                                                                                        </label>
                                                                                    )
                                                                                    : proof.prov_status === "FAIL"
                                                                                        ? (
                                                                                            <label
                                                                                                className="form-check-label text-danger fw-semibold"
                                                                                            >
                                                                                                อนุมัติแล้ว "ไม่ผ่าน"
                                                                                            </label>
                                                                                        )
                                                                                        : (
                                                                                            <label
                                                                                                className="form-check-label text-secondary fw-semibold"
                                                                                            >
                                                                                                ยังไม่อนุมัติ
                                                                                            </label>
                                                                                        )
                                                                            }
                                                                        </div>
                                                                    ))
                                                                }
                                                            </td>
                                                            <td className='text-center align-middle'>
                                                                {listProvApprove && (listProvApprove
                                                                    .filter(f =>
                                                                        f.question_id === item2.question_id &&
                                                                        f.sub_question_id === item2.id
                                                                    )
                                                                    .map((proof2, idx) =>
                                                                        <div key={idx} className="d-flex justify-content-center">
                                                                            {
                                                                                proof2.zone_status === "PASS"
                                                                                    ? (
                                                                                        <label
                                                                                            className="form-check-label text-success fw-semibold"
                                                                                        >
                                                                                            อนุมัติแล้ว "ผ่าน"
                                                                                        </label>
                                                                                    )
                                                                                    : proof2.zone_status === "FAIL"
                                                                                        ? (
                                                                                            <label
                                                                                                className="form-check-label text-danger fw-semibold"
                                                                                            >
                                                                                                อนุมัติแล้ว "ไม่ผ่าน"
                                                                                            </label>
                                                                                        )
                                                                                        : (
                                                                                            <label
                                                                                                className="form-check-label text-secondary fw-semibold"
                                                                                            >
                                                                                                ยังไม่อนุมัติ
                                                                                            </label>
                                                                                        )
                                                                            }
                                                                        </div>
                                                                    ))
                                                                }
                                                            </td>
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

                                    <div className="d-flex align-items-center gap-3">
                                        {!isExpired && timeLeft && (
                                            <span className="badge text-dark px-3 py-2">
                                                ⏳ ปุ่มแก้ไขจะปิดในวันที่ 31 ก.ค. 69 เหลืออีก {timeLeft.days} วัน {timeLeft.hours} ชม. {timeLeft.minutes} นาที {timeLeft.seconds} วินาที
                                            </span>
                                            // <span className="badge text-dark px-3 py-2">
                                            //     ⏳ ปุ่มต่างๆ จะปิดในวันที่ 31 มี.ค. 69 เหลืออีก {timeLeft.days} วัน {timeLeft.hours} ชม. {timeLeft.minutes} นาที {timeLeft.seconds} วินาที
                                            // </span>
                                        )}
                                    </div>

                                    {/* Save Draft */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning"
                                        // disabled={isExpired || isLoading || draftData?.is_draft === false}
                                        disabled={isLoading || draftData?.is_draft === false}
                                        onClick={(e) => saveEvaluate(e, false)}
                                    >
                                        💾 บันทึกร่าง
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={isExpired || isLoading || draftData?.is_draft === true}
                                        onClick={(e) => requestEdit(e, true)}
                                    >
                                        📝 แก้ไขแบบประเมิน
                                    </button>

                                    {/* Submit */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        // disabled={isExpired || isLoading || draftData?.is_draft === false}
                                        disabled={isLoading || draftData?.is_draft === false}
                                        onClick={() => modalConfirmSendInstance.show()}
                                    >
                                        📤 ส่งแบบประเมิน
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

                {/* Modal upload evidence */}
                <FormUploadEvidence answersBySubId={answersBySubId} loadEvidenceSubId={loadEvidenceSubId} />
                {/* Modal review evidence file by sub_question_id */}
                <FormReviewEvidence evidenceBySubId={evidenceBySubId} loadEvidenceSubId={loadEvidenceSubId} />
            </div>
        </>
    )
}

export default FormEvaluateInfra