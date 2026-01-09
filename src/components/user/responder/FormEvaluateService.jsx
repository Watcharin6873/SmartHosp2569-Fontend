import { Fragment, useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListQuestionByCatId } from '../../../api/Queation';
import { getListSubQuestionByCatId } from '../../../api/SubQuestion';
import { getListChoicesByCatId } from '../../../api/Choices';
import { Modal } from 'bootstrap';
import { FolderOpenIcon, UploadIcon } from 'lucide-react';

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
  const [modalUploadInstance, setModalUploadInstance] = useState(null);
  const [modalShowEvInstance, setModalShowEvInstance] = useState(null);
  const [modalConfirmDelInstance, setModalConfirmDelInstance] = useState(null);
  const [modalConfirmSendInstance, setModalConfirmSendInstance] = useState(null);
  const [answers, setAnswers] = useState({}); // key=sub_question_id
  const [draftData, setDraftData] = useState(null);

  const topic_id = 2;
  const category_id = 4;
  const hcode9 = user?.hcode9;
  const user_id = user?.id;

  const modalUploadRef = useRef(null);
  const modalShowEvRef = useRef(null);
  const modalConfirmDelEvRef = useRef(null);
  const modalConfirmSendRef = useRef(null);

  useEffect(() => {
    loadListQuestion(token);
    loadListSubQuestion(token);
    loadListChoice(token);
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
  }, []);

  // Load list questions
  const loadListQuestion = async () => {
    try {
      setIsLoading(true);
      const res = await getListQuestionByCatId(token, category_id);
      setListQuestions(res.data);
      console.log("Q: ", res.data);
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
      console.log("SQ: ", res.data);
    } catch (err) {
      console.log(err);
    }
  }

  // Load list choices
  const loadListChoice = async () => {
    try {
      const res = await getListChoicesByCatId(token, category_id);
      setListChoices(res.data);
      console.log("C: ", res.data);
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
    // loadDraft(question_id);
  }

  const showEvidenceFiles = () => {
    modalShowEvInstance.show();
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

  // Handle checkbo change
  const handleCheckboxChange = ({
    sub_question_id,
    choice_id,
    answer_id,
    choice_value,
    choice_required
  }) => {
    // Logic for checkbox (if any)
    setAnswers(prev => {
      const current = prev[sub_question_id] || [];

      const exists = current.find(a => a.answer_id === answer_id);
      let updated;

      if (exists) {
        // Remove answer
        updated = current.filter(a => a.answer_id !== answer_id);
      } else {
        // Add answer
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
      }

      return {
        ...prev,
        [sub_question_id]: updated
      };
    });
  }

  // Save evaluate
  const saveEvaluate = async (e, submit = false) => {
    e.preventDefault();
    // Logic to save evaluation
  }


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
        <div className="alert alert-success mb-3" role="alert">
          📌 กรุณาเลือกคำตอบให้ครบทุกข้อ หากยังไม่สามารถประเมินได้ สามารถบันทึกร่างไว้ก่อน แล้วกลับมาทำต่อภายหลังได้ <br />
          📌 เมื่อแนบไฟล์หลักฐานแล้ว หากต้องการเปลี่ยนไฟล์ใหม่ กรุณาลบไฟล์เดิมก่อน แล้วจึงอัปโหลดไฟล์ใหม่ <br />
          📌 เมื่อส่งประเมินแล้ว จะไม่สามารถแก้ไขข้อมูลได้อีก
        </div>

        {/* แบบประเมิน */}
        <form onSubmit={(e) => saveEvaluate(e, true)}>
          <div className="table-responsive mb-3">
            <table className="table table-bordered">
              <thead>
                <tr className="table-success">
                  <th className="text-center">แบบประเมินด้านการบริการ</th>
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
                        <td className="fw-bold">
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
                                                  checked={answers[subItem.id]?.answer_id === answer.id}
                                                  disabled={draftData?.is_draft === false}
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
                                            const isChecked = answers[subItem.id]?.some(a => a.answer_id === answer.id);

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
                                                  disabled={draftData?.is_draft === false}
                                                  onChange={() =>
                                                    handleCheckboxChange({
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
            selectedQuestion && (
              <>
                <div className="d-flex justify-content-end gap-2 mt-3 mb-3">
                  {/* Save Draft */}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isLoading || draftData?.is_draft === false}
                    onClick={(e) => saveEvaluate(e, false)}
                  >
                    💾 บันทึกร่าง
                  </button>

                  {/* Submit */}
                  <button
                    type="button"
                    className="btn btn-success"
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

      </div>
    </>
  )
}

export default FormEvaluateService
