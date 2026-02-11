import { Fragment, useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListQuestionByCatId } from '../../../api/Queation';
import { getListSubQuestionByCatId } from '../../../api/SubQuestion';
import { getListChoicesByCatId } from '../../../api/Choices';
import { getListEvidence, getListEvidenceByHcode9, removeEvidenceFileById, uploadEvidenceFile } from '../../../api/Uploadfile';
import { Modal } from 'bootstrap';
import { FolderOpenIcon, Trash2, UploadIcon } from 'lucide-react';
import { createEvaluation, getDraftEvaluation, getScoreHospitalForSubQuestion, requestForEditEvaluation } from '../../../api/Evaluate';
import Swal from 'sweetalert2';
import FormUploadEvidence from './FormUploadEvidence';
import FormReviewEvidence from './FormReviewEvidence';
import ChatPanel from '../province/ChatPanel';

const FormEvaluateService = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listQuestions, setListQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState([]);
  const [listSubQuestions, setListSubQuestions] = useState([]);
  const [listChoices, setListChoices] = useState([]);
  const [evidenceId, setEvidenceId] = useState('');
  const [fileEvidences, setFileEvidences] = useState('');
  const [listEvidenceSubId, setListEvidenceSubId] = useState([]);
  const [modalUploadInstance, setModalUploadInstance] = useState(null);
  const [modalShowEvInstance, setModalShowEvInstance] = useState(null);
  const [modalConfirmDelInstance, setModalConfirmDelInstance] = useState(null);
  const [modalConfirmSendInstance, setModalConfirmSendInstance] = useState(null);
  const [answers, setAnswers] = useState({}); // key=sub_question_id
  const [evaluateData, setEvaluateData] = useState(null);
  const [evaluateId, setEvaluateId] = useState(null);
  const [answersBySubId, setAnswersBySubId] = useState(null);
  const [evidenceBySubId, setEvidenceBySubId] = useState(null);
  const [hcode9, setHcode9] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [scoreForSubQuestion, setScoreForSubQuestion] = useState([]);

  useEffect(() => {
    if (user?.hcode9) {
      setHcode9(user.hcode9);
    }
  }, [user]);

  const topic_id = 2;
  const category_id = 4;
  const user_id = user?.id;

  const modalUploadRef = useRef(null);
  const modalShowEvRef = useRef(null);
  const modalConfirmDelEvRef = useRef(null);
  const modalConfirmSendRef = useRef(null);

  // File upload sector
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!token) return;

    loadListQuestion(token);
    loadListSubQuestion(token);
    loadListChoice(token);
    loadScoreForSubQuestion(token);
    // สร้าง instance ของ Modal จาก ref
    if (modalUploadRef.current) {
      setModalUploadInstance(new Modal(modalUploadRef.current));
    }
    if (modalShowEvRef.current) {
      setModalShowEvInstance(new Modal(modalShowEvRef.current));
    }
    if (modalConfirmDelEvRef.current) {
      setModalConfirmDelInstance(new Modal(modalConfirmDelEvRef.current));
    }
    if (modalConfirmSendRef.current) {
      setModalConfirmSendInstance(new Modal(modalConfirmSendRef.current));
    }
  }, [token]);


  useEffect(() => {
    if (!hcode9) return;

    loadEvidenceSubId(token);
    loadFileUpload(token);
  }, [hcode9]);

  // Load list questions
  const loadListQuestion = async () => {
    try {
      setIsLoading(true);
      const res = await getListQuestionByCatId(token, category_id);
      setListQuestions(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Load list sub questions
  const loadListSubQuestion = async () => {
    try {
      const res = await getListSubQuestionByCatId(token, category_id);
      setListSubQuestions(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  // Load list choices
  const loadListChoice = async () => {
    try {
      const res = await getListChoicesByCatId(token, category_id);
      setListChoices(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadFileEvidences = async () => {
    try {
      const res = await getListEvidence(token);
      const filtered = res.data.filter(f => f.hcode9 === hcode9 && f.category_id === category_id);
      setFileEvidences(filtered);
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
    }
    catch (err) {
      console.log(err);
    }
  }

  // === Handle events === //
  const handleFilterChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');

    if (!selectedFile) return;

    // ตรวจสอบ File type
    if (selectedFile.type !== 'application/pdf') {
      setFileError('❌ รองรับเฉพาะไฟล์ PDF เท่านั้น');
      e.target.value = "";
      return;
    }

    // ตรวจสอบ file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError('❌ ขนาดไฟล์เกิน 15 MB กรุณาเลือกไฟล์ใหม่');
      e.target.value = "";
      return;
    }

    // สร้าง preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  }

  // ลบไฟล์ ก่อน upload ใหม่
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileError('');
    document.getElementById('file_ev').value = "";
  }

  // Handle file upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || !user?.hcode9) {
      toast.error("ข้อมูลผู้ใช้ยังไม่พร้อม");
      return;
    }

    if (!file) {
      setFileError("❌ กรุณาเลือกไฟล์ก่อนอัปโหลด");
      return;
    }

    // สร้าง FormData สำหรับอัปโหลดไฟล์
    const formData = new FormData();
    formData.append('file_ev', file);
    formData.append('user_id', user.id);
    formData.append('category_id', category_id);
    formData.append('hcode9', user.hcode9);

    // ทำการส่งข้อมูลไปยัง API
    try {
      setIsLoading(true);
      const res = await uploadEvidenceFile(token, formData);
      modalUploadInstance.hide();

      Swal.fire({
        title: "📢 แจ้งผลการแนบไฟล์หลักฐาน!",
        text: `${res.data.message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      });
      handleRemoveFile();
      loadFileEvidences(token);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const showEvidenceFiles = () => {
    modalShowEvInstance.show();
  }

  const handleRemoveEvidence = (id) => {
    setEvidenceId(id);
    modalConfirmDelInstance.show();
  }

  const handleConfirmRemoveSubmit = async () => {
    try {
      const res = await removeEvidenceFileById(token, evidenceId);
      modalConfirmDelInstance.hide();
      modalShowEvInstance.hide();
      loadFileEvidences(token);

      Swal.fire({
        title: "📢 แจ้งผลการลบไฟล์หลักฐาน!",
        text: `${res.data.message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Option select change
  const questOption = listQuestions.map(item => ({
    value: item.id,
    label: item.question_name
  }));

  // Handle select question
  const handleSelectQuestion = (e) => {
    const selectedValue = e.target.value;
    setSelectedQuestion(selectedValue);

    if (selectedValue === "") {
      setSearchQuery([]);
      return;
    }

    const question_id = Number(selectedValue);

    const filteredQuestions = listQuestions.filter(
      (question) => question.id === question_id
    );

    setSearchQuery(filteredQuestions);

    // ✅ ใช้ค่าที่เลือกจริง
    loadEvaluateData(question_id);
  }

  // Handle get scores for sub question
  const loadScoreForSubQuestion = async () => {
    try {
      const res = await getScoreHospitalForSubQuestion(token, user?.hcode9)
      // console.log('R: ', res.data);
      setScoreForSubQuestion(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const scoreByCatId = scoreForSubQuestion.filter(f => f.category_id === category_id);

  const loadEvaluateData = async (question_id) => {
    const res = await getDraftEvaluation(token, question_id, hcode9);
    setEvaluateData(res.data);

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
  }

  // Handle radio change
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

  /// Handle checkbox change
  const handleCheckboxChange = ({
    checked,
    sub_question_id,
    choice_id,
    answer_id,
    choice_value,
    choice_required
  }) => {
    setAnswers(prev => {
      // 🔑 FORCE เป็น array ทุกครั้ง
      const current = Array.isArray(prev[sub_question_id])
        ? prev[sub_question_id]
        : [];

      let updated;

      if (checked) {
        updated = [
          ...current,
          {
            sub_question_id,
            choice_id,
            answer_id,
            choice_value,
            choice_required
          }
        ];
      } else {
        updated = current.filter(a => a.answer_id !== answer_id);
      }

      return {
        ...prev,
        [sub_question_id]: updated
      };
    });
  };

  const handleOtherTextChange = ({
    sub_question_id,
    answer_id,
    value
  }) => {
    setAnswers(prev => {
      const current = prev[sub_question_id] || [];

      const updated = current.map(a =>
        a.answer_id === answer_id
          ? { ...a, answer_text: value }
          : a
      );

      return {
        ...prev,
        [sub_question_id]: updated
      };
    });
  };


  // Save evaluate
  const saveEvaluate = async (e, submit = false) => {
    e.preventDefault();

    if (Object.keys(answers).length === 0) {
      toast.warning("กรุณาเลือกคำตอบอย่างน้อย 1 ข้อ");
      return;
    }

    //🔥 flatten radio + checkbox
    const flatAnswers = Object.values(answers).flatMap(a => Array.isArray(a) ? a : [a]);

    if (flatAnswers.length === 0) {
      toast.warning("กรุณาเลือกคำตอบอย่างน้อย 1 ข้อ");
      return;
    }

    const payload = {
      evaluate_id: evaluateId,
      topic_id,
      category_id,
      question_id: selectedQuestion,
      hcode9,
      user_id,
      is_draft: !submit,
      answers: flatAnswers.map(a => ({
        topic_id,
        category_id,
        question_id: selectedQuestion,
        sub_question_id: a.sub_question_id,
        choice_id: a.choice_id,
        answer_id: a.answer_id,
        choice_value: a.choice_value,
        choice_required: a.choice_required,
        answer_text: a.answer_text || null
      }))
    };

    // console.log("Payload: ", payload);

    try {
      setIsLoading(true);
      const res = await createEvaluation(token, payload);
      loadEvaluateData(res.data.question_id, hcode9);

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
      setEvidenceBySubId({...evidenceData})
    }
  
  }

  const requestEdit = async (e, isDraft = true) => {
    e.preventDefault();

    if (!selectedQuestion || !hcode9 || !user_id) {
      console.warn("ข้อมูลไม่ครบ", { selectedQuestion, hcode9, user_id });
      return;
    }

    const values = {
      question_id: selectedQuestion,
      hcode9,
      user_id,
      is_draft: isDraft
    };

    try {
      const res = await requestForEditEvaluation(token, values)
      loadEvaluateData(res.data.question_id, hcode9);

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

  const EDIT_DEADLINE = new Date("2026-03-31T23:59:59");

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
      <div style={{ fontFamily: "Sarabun, sans-serif" }}>
        <div className='d-flex justify-content-center'>
          <h3 className='p-3'>แบบประเมินด้านการบริการ (Service)</h3>
        </div>

        {/* Question selection dropdown */}
        <div className="d-flex justify-content-center mb-3 gap-3">
          <select
            className="form-select w-50"
            aria-label="Select question to search"
            value={selectedQuestion ?? ""}
            onChange={handleSelectQuestion}
          >
            <option value="">-- เลือกหัวข้อเพื่อตอบแบบประเมิน --</option>
            {
              questOption.map((option) => (
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
          📌 เมื่อกดปุ่ม "ส่งแบบประเมิน" แล้ว ปุ่ม "แก้ไขแบบประเมิน" จะเปิดให้สามารถแก้ไขแบบประเมินได้จนถึง 31 มีนาคม 2569 (รอบส่งแบบประเมินรอบที่ 1) <br />
          📌 เมื่อแนบไฟล์หลักฐานแล้ว หากต้องการเปลี่ยนไฟล์ใหม่ กรุณาลบไฟล์เดิมก่อน แล้วจึงอัปโหลดไฟล์ใหม่
        </div>

        {/* แบบประเมิน */}
        <form onSubmit={(e) => saveEvaluate(e, true)}>
          <div className="table-responsive mb-3">
            <table className="table table-bordered">
              <thead>
                <tr className="table-success">
                  <th className="text-center">แบบประเมินด้านการบริการ</th>
                  <th className="text-center" style={{ width: "100px" }}>คะแนนเต็ม</th>
                  <th className="text-center" style={{ width: "100px" }}>คะแนนจำเป็น</th>
                  <th className="text-center" style={{ width: "20%" }}>ความคิดเห็น</th>
                </tr>
              </thead>
              <tbody>
                {
                  searchQuery.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
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
                        <td colSpan={4} className="fw-bold">
                          {item.question_name}
                        </td>
                      </tr>
                      {/* Children rows */}
                      {
                        listSubQuestions.length > 0 && listSubQuestions
                          .filter(f => f.question_id === item.id)
                          .map((subItem, subIdx) => (
                            <tr key={subIdx}>
                              <td
                                style={{
                                  paddingLeft: "30px"
                                }}
                                className="fw-bold"
                              >
                                <div className="mb-2">
                                  <span>
                                    {subItem.sub_quest_name
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
                                    {subItem.is_required === true && (
                                      <span className="text-danger fw-bold ms-2">
                                        (*จำเป็น)
                                      </span>
                                    )}
                                    {(() => {
                                      const curAnswer = answers[subItem.id];

                                      // มีคำตอบหรือไม่ (รองรับ radio / checkbox)
                                      const hasAnswer = Array.isArray(curAnswer)
                                        ? curAnswer.length > 0
                                        : curAnswer?.sub_question_id === subItem.id;

                                      // มีหลักฐานแล้วหรือยัง
                                      const hasEvidence = listEvidenceSubId?.some(ev => parseInt(ev.sub_question_id) === parseInt(subItem.id))


                                      if (!hasAnswer) return null;

                                      return !hasEvidence ? (
                                        <span
                                          className='btn btn-warning btn-sm px-1 py-0 ms-2'
                                          onClick={() => handleUploadEvidence(answers[subItem.id])} // ✅ ส่งค่าเดียว
                                        >
                                          แนบหลักฐาน
                                        </span>
                                      ) : (
                                        <span
                                          className='btn btn-primary btn-sm px-1 py-0 ms-2'
                                          onClick={() => handleReviewEvidence(subItem.id)}
                                        >
                                          ดูหลักฐาน
                                        </span>
                                      );
                                    })()}

                                  </span>
                                </div>
                                {
                                  listChoices.length > 0 && listChoices
                                    .filter(c => c.sub_question_id === subItem.id)
                                    .map((choice, choiceIdx) => (
                                      <div
                                        key={choiceIdx}
                                        className="flex flex-lg-column gap-1"
                                      >
                                        {/* Radio button */}
                                        {
                                          subItem.question_type === 'radio' && choice.answers.map((answer, answerIdx) => {
                                            const isNegative = answer.choice_text.trim().startsWith("ไม่มี");
                                            const isChecked = answers[subItem.id]?.answer_id === answer.id
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
                                                  name={`subquestion_${subItem.id}`}
                                                  checked={isChecked}
                                                  disabled={evaluateData?.is_draft === false}
                                                  onChange={() =>
                                                    handleRadioChange({
                                                      sub_question_id: subItem.id,
                                                      choice_id: choice.id,
                                                      answer_id: answer.id,
                                                      choice_value: answer.choice_value,
                                                      choice_required: answer.choice_required
                                                    })
                                                  }
                                                />
                                                <label
                                                  className={`form-check-label fw-semibold ${isNegative ? "text-danger" : "text-success"
                                                    }`}
                                                  htmlFor={`choice_${choice.id}_answer_${answerIdx}`}
                                                >
                                                  {answer.choice_text}
                                                </label>
                                              </div>
                                            )
                                          })
                                        }

                                        {/* Checkbox */}
                                        {
                                          subItem.question_type === 'checkbox' && choice.answers.map((answer, answerIdx) => {
                                            const isNegative = answer.choice_text.trim().startsWith("ไม่มี");
                                            const isOtherText = answer.choice_text?.includes("โปรดระบุ");
                                            const currentAnswer = answers[subItem.id] || [];

                                            const isChecked = Array.isArray(currentAnswer) && currentAnswer.some(a => a.answer_id === answer.id);

                                            const selectedItem = currentAnswer.find(a => a.answer_id === answer.id);

                                            return (
                                              <div
                                                key={answer.id ?? answerIdx}
                                                className="form-check"
                                                style={{ marginLeft: 40 }}
                                              >
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  disabled={evaluateData?.is_draft === false}
                                                  onChange={(e) =>
                                                    handleCheckboxChange({
                                                      checked: e.target.checked,   // ⭐ สำคัญมาก
                                                      sub_question_id: subItem.id,
                                                      choice_id: choice.id,
                                                      answer_id: answer.id,
                                                      choice_value: answer.choice_value,
                                                      choice_required: answer.choice_required,
                                                      has_text: isOtherText
                                                    })
                                                  }
                                                />

                                                <label
                                                  className={`form-check-label fw-semibold ${isNegative ? "text-danger" : "text-success"
                                                    }`}
                                                  htmlFor={`choice_${choice.id}_answer_${answerIdx}`}
                                                >
                                                  {answer.choice_text}
                                                </label>
                                                {/* ✅ Textbox (เฉพาะ อื่นๆ) */}
                                                {isChecked && isOtherText && (
                                                  <input
                                                    type="text"
                                                    className="form-control mt-2"
                                                    placeholder="โปรดระบุ"
                                                    value={selectedItem?.answer_text || ""}
                                                    disabled={evaluateData?.is_draft === false}
                                                    onChange={(e) =>
                                                      handleOtherTextChange({
                                                        sub_question_id: subItem.id,
                                                        answer_id: answer.id,
                                                        value: e.target.value
                                                      })
                                                    }
                                                  />
                                                )}
                                              </div>
                                            )
                                          })
                                        }
                                      </div>
                                    ))
                                }
                              </td>
                              <td className='text-center'>
                                {
                                  scoreByCatId && scoreByCatId
                                    .filter(f =>
                                      f.question_id === subItem.question_id &&
                                      f.sub_question_id === subItem.id
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
                              <td className='text-center'>
                                {
                                  scoreByCatId && scoreByCatId
                                    .filter(f =>
                                      f.question_id === subItem.question_id &&
                                      f.sub_question_id === subItem.id
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
                                  key={`${selectedQuestion}-${subItem.id}-${user?.hcode9}`}
                                  categoryId={category_id}
                                  questionId={subItem.question_id}
                                  subQuestionId={subItem.id}
                                  hospitalCode={user?.hcode9}
                                  role="HOSPITAL" // หรือ "PROVINCE"
                                />
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
            selectedQuestion && (
              <>
                <div className="d-flex justify-content-end gap-2 mt-3 mb-3">

                  <div className="d-flex align-items-center gap-3">
                    {!isExpired && timeLeft && (
                      <span className="badge text-dark px-3 py-2">
                        ⏳ ปุ่มแก้ไขจะปิดในวันที่ 31 มี.ค. 69 เหลืออีก {timeLeft.days} วัน {timeLeft.hours} ชม. {timeLeft.minutes} นาที {timeLeft.seconds} วินาที
                      </span>
                    )}
                  </div>

                  {/* Save Draft */}
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    disabled={isLoading || evaluateData?.is_draft === false}
                    onClick={(e) => saveEvaluate(e, false)}
                  >
                    💾 บันทึกร่าง
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={isExpired || isLoading || evaluateData?.is_draft === true}
                    onClick={(e) => requestEdit(e, true)}
                  >
                    📝 แก้ไขแบบประเมิน
                  </button>

                  {/* Submit */}
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    disabled={isLoading || evaluateData?.is_draft === false}
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
                  📋 แนบไฟล์หลักฐานด้านการบริการ (Service)
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
          ref={modalConfirmDelEvRef}
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
                  onClick={handleConfirmRemoveSubmit}
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
          ref={modalConfirmSendRef}
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

export default FormEvaluateService
