import { useState, useEffect, Fragment } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListHospitals } from '../../../api/Hospitals';
import { getEvaluationByCatId, getListHospitalsInEvaluation } from '../../../api/Evaluate';
import { getListCategory } from '../../../api/Category';
import { getListQuestion } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getListChoices } from '../../../api/Choices';
import { getEvidenceFiles, getListEvidenceByHcode9 } from '../../../api/Uploadfile';
import { getProvApproveEvaluation, provAproveEvaluation } from '../../../api/Approve';
import { FolderOpenIcon } from 'lucide-react';
import FormReviewEvidenceOnly from '../responder/FormReviewEvidenceOnly';
import Swal from 'sweetalert2';
import ChatPanel from './ChatPanel';

const FormApproveService = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospitals, setListHospitals] = useState([]);
  const [listCategories, setListCategories] = useState([]);
  const [listQuestions, setListQuestions] = useState([]);
  const [listSubQuestions, setListSubQuestions] = useState([]);
  const [listChoices, setListChoices] = useState([]);
  const [evaluationData, setEvaluationData] = useState([]);
  const [valueHcode9, setValueHcode9] = useState(null);
  const [answers, setAnswers] = useState({});
  const [fileEvidences, setFileEvidences] = useState(null);
  const [listEvidenceSubId, setListEvidenceSubId] = useState([]);
  const [evidenceBySubId, setEvidenceBySubId] = useState(null);
  const [listProvApprove, setListProvApprove] = useState([]);

  const user_id = user?.id;
  const province = user?.province;
  const isUAT = import.meta.env.VITE_IS_UAT === 'true';
  const category_id = 4;

  useEffect(() => {
    if (!token) return;

    loadLIstHospitals(token);
    loadListProvApprove(token);
  }, [token]);

  const loadLIstHospitals = async () => {
    try {
      const res = await getListHospitalsInEvaluation(token);
      const data = res?.data;
      const filtered = isUAT ? data : data?.filter(f => f.hospital_type !== 'หน่วยงานทดสอบ');
      setListHospitals(filtered);
    } catch (err) {
      console.log(err)
    }
  };

  const filteredHospitals = listHospitals.filter(f => f.province === province && f.category_id === category_id);

  const hospOption = filteredHospitals.map((item) => ({
    value: item.hospital_code,
    label: item.hospital_name
  }));

  const handleSelectHosp = (e) => {
    const hospital_code = e.target.value;

    if (!hospital_code) {
      setValueHcode9(null);
      return;
    }
    setValueHcode9(hospital_code);
  }

  useEffect(() => {
    if (!valueHcode9 || !token) return;

    // 🔥 Clear ข้อมูลเก่าก่อน
    setEvaluationData([]);
    setListEvidenceSubId([]);
    setFileEvidences([]);

    loadEvaluationCat1(valueHcode9);
    loadEvidenceSubId(valueHcode9);
    loadEvidenceFile(valueHcode9);

    loadListCategories(token);
    loadListQuestions(token);
    loadListSubQuestions(token);
    loadListChoices(token);
    loadListProvApprove(token)

  }, [valueHcode9, token]);

  const loadListCategories = async () => {
    try {
      const res = await getListCategory(token);
      setListCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadListQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await getListQuestion(token);
      setListQuestions(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const loadListSubQuestions = async () => {
    try {
      const res = await getListSubQuestion(token);
      setListSubQuestions(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadListChoices = async () => {
    try {
      const res = await getListChoices(token);
      setListChoices(res.data);
    } catch (err) {
      console.log(err)
    }
  }

  // Load evidence_sub_id 
  const loadEvidenceSubId = async (hospital_code) => {
    try {
      // Code
      const res = await getListEvidenceByHcode9(token, hospital_code);
      setListEvidenceSubId(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const loadListProvApprove = async () => {
    try {
      const res = await getProvApproveEvaluation(token, category_id, valueHcode9);
      setListProvApprove(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const loadEvaluationCat1 = async (hospital_code) => {
    const res = await getEvaluationByCatId(token, category_id, hospital_code);
    const data = res?.data;

    if (!Array.isArray(data)) {
      setEvaluationData([]);
      setAnswers({});
    }

    setEvaluationData(data);

    const map = {};

    data.forEach(item => {
      // แต่ละ item มี evaluateAnswers
      if (!Array.isArray(item.evaluateAnswers)) return;

      item.evaluateAnswers.forEach(a => {
        if (!a.subQuestions) return;

        const subId = Number(a.sub_question_id);
        const qType = a.subQuestions.question_type;

        if (qType === "checkbox") {
          if (!Array.isArray(map[subId])) {
            map[subId] = [];
          }

          map[subId].push({
            id: a.id,
            evaluate_id: a.evaluate_id,
            sub_question_id: subId,
            choice_id: Number(a.choice_id),
            answer_id: Number(a.answer_id),
            choice_value: Number(a.answer_value),
            choice_required: Number(a.answer_required),
            answer_text: a.answer_text || null
          });
        } else {
          // radio / text / textarea
          map[subId] = {
            id: a.id,
            evaluate_id: a.evaluate_id,
            sub_question_id: subId,
            choice_id: Number(a.choice_id),
            answer_id: Number(a.answer_id),
            choice_value: Number(a.answer_value),
            choice_required: Number(a.answer_required)
          };
        }
      });
    });

    // console.log('Mapped answers:', map);
    setAnswers(map);
  };

  const filterQuestion = listQuestions.filter(f => f.category_id === category_id);
  const filterSubQuestion = listSubQuestions.filter(f => f.category_id === category_id);
  const filterChoice = listChoices.filter(f => f.category_id === category_id);

  const loadEvidenceFile = async (hospital_code) => {
    try {
      setFileEvidences(null);        // ✅ เคลียร์ก่อน

      const res = await getEvidenceFiles(token, hospital_code, category_id);

      if (res?.data) {
        setFileEvidences(res.data);
      } else {
        setFileEvidences(null);
      }
    } catch (err) {
      console.error(err);
      setFileEvidences(null);
    }
  };

  const showEvidenceFiles = () => {
    window.open(`https://bdh-service.moph.go.th/api/questionnaire/evidence_files/${fileEvidences?.file_ev}`, "_blank", "noreferer")
  }

  // Review evidence by subItemId
  const handleReviewEvidence = (subQuestId) => {
    const evidenceData = listEvidenceSubId.find(f => f.sub_question_id === subQuestId);

    if (evidenceData) {
      setEvidenceBySubId({ ...evidenceData });
    }
  }

  const handleApproveAnswer = async (approveValue, approveId, subId) => {
    const sub_question_id = subId;

    const subQuestData = listSubQuestions.find(f => f.id === sub_question_id);
    const evaluateData = evaluationData.find(f =>
      f.question_id === subQuestData?.question_id &&
      f.hospital_code === valueHcode9
    );
    const answerData = evaluateData?.evaluateAnswers;
    const data = answerData?.find(f => f.sub_question_id === sub_question_id);

    const payload = {
      id: approveId,
      evaluate_id: data.evaluate_id,
      category_id: data.category_id,
      question_id: data.question_id,
      sub_question_id: sub_question_id,
      hospital_code: valueHcode9,
      prov_status: approveValue,
      user_id: user_id
    }

    // console.log('payload: ', payload)
    try {
      await provAproveEvaluation(token, payload);

      loadListProvApprove(token)

    } catch (err) {
      console.log(err)
    }
  }

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
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='text-success fw-bold'>อนุมัติการประเมินโรงพยาบาลอัจฉริยะ ด้านการบริการ (Service)</h4>
      </div>

      {/* Category selection */}
      <div className='d-flex justify-content-center mb-3 gap-3'>
        <select
          className='form-select w-25'
          aria-label='Hospital select to search'
          value={valueHcode9 ?? ""}
          onChange={handleSelectHosp}
        >
          <option value="">--- เลือกโรงพยาบาลเพื่ออนุมัติ ---</option>
          {[...hospOption]
            .map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
        </select>
        {
          fileEvidences !== null && (
            <button
              className='btn btn-outline-success btn-sm'
              onClick={showEvidenceFiles}
            >
              <FolderOpenIcon className="me-2" size={16} /> ดูหลักฐานที่แนบ
            </button>
          )
        }
      </div>

      {/* Table */}
      <div className='table-responsive'>
        <table className='table table-bordered' id='report-table'>
          <thead>
            <tr className='table-success align-middle'>
              <th className="text-center h5">
                แบบประเมินโรงพยาบาลอัจฉริยะ{" "}
                {
                  listCategories.find(c => c.id === category_id)
                    ?.category_name_th || "ปีงบประมาณ พ.ศ. 2569"
                }
              </th>
              <th
                className='text-center'
                style={{ width: '20%' }}
              >
                ความคิดเห็น
              </th>
              <th
                className='text-center'
                style={{ width: '180px' }}
              >
                การอนุมัติ
              </th>
            </tr>
          </thead>
          <tbody>
            {
              evaluationData && evaluationData.length > 0 ? (
                filterQuestion.map((item, idx) => (
                  <Fragment key={idx}>
                    {/* Parent row */}
                    <tr className='table-secondary'>
                      <td colSpan={3} className='fw-bold'>{item.question_name}</td>
                    </tr>
                    {/* Children row */}
                    {
                      filterSubQuestion.length > 0 && filterSubQuestion
                        .filter(f => f.question_id === item.id)
                        .map((subItem, subIdx) => (
                          <tr key={subIdx}>
                            <td
                              style={{ paddingLeft: '30px' }}
                            >
                              <div className='mb-2'>
                                <span className='fw-bold'>
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

                                    return hasEvidence && (
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
                                filterChoice.length > 0 && filterChoice
                                  .filter(c => c.sub_question_id === subItem.id)
                                  .map((choice, choiceIDX) => (
                                    <div
                                      key={choiceIDX}
                                      className='flex flex-lg-column gap-1'
                                    >
                                      {/* Radio */}
                                      {
                                        subItem.question_type === 'radio' && choice.answers.map((answer, answerIdx) => {
                                          const isNegative = answer.choice_text.trim().startsWith("ไม่มี");
                                          const selected = answers?.[subItem.id];

                                          const isChecked = selected && parseInt(selected?.answer_id) === parseInt(answer.id);

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
                                                readOnly
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
                                                readOnly
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
                                                  readOnly
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
                            <td>
                              <ChatPanel
                                categoryId={category_id}
                                questionId={item.id}
                                subQuestionId={subItem.id}
                                hospitalCode={valueHcode9}
                                role="PROVINCE" // หรือ HOSPITAL
                              />
                            </td>
                            <td className="text-center align-middle">
                              {(() => {
                                const appItem = listProvApprove.find(f =>
                                  f.sub_question_id === subItem.id &&
                                  f.hospital_code === valueHcode9
                                )

                                return (
                                  <div className="d-flex flex-column justify-content-center">

                                    {/* ผ่าน */}
                                    <div className="form-check d-flex align-items-start gap-1">
                                      <input
                                        className="form-check-input m-0 mt-1"
                                        type="radio"
                                        name={`approve_${subItem.id}`}
                                        id={`approve_pass_${subItem.id}`}
                                        checked={appItem?.prov_status === "PASS"}
                                        onChange={() =>
                                          handleApproveAnswer("PASS", appItem?.id || null, subItem.id)
                                        }
                                      />
                                      <label
                                        className="form-check-label text-success fw-semibold m-0"
                                        htmlFor={`approve_pass_${subItem.id}`}
                                      >
                                        {appItem?.prov_status === "PASS"
                                          ? <p style={{ fontSize: "13px" }}>ตรวจสอบแล้ว "ผ่าน"</p>
                                          : <p style={{ fontSize: "13px" }}>ผ่าน</p>
                                        }
                                      </label>
                                    </div>

                                    {/* ไม่ผ่าน */}
                                    <div className="form-check d-flex align-items-start gap-1">
                                      <input
                                        className="form-check-input m-0 mt-1"
                                        type="radio"
                                        name={`approve_${subItem.id}`}
                                        id={`approve_fail_${subItem.id}`}
                                        checked={appItem?.prov_status === "FAIL"}
                                        onChange={() =>
                                          handleApproveAnswer("FAIL", appItem?.id || null, subItem.id)
                                        }
                                      />
                                      <label
                                        className="form-check-label text-danger fw-semibold m-0"
                                        htmlFor={`approve_fail_${subItem.id}`}
                                      >
                                        {
                                          appItem?.prov_status === "FAIL"
                                            ? <p style={{ fontSize: "13px" }}>ตรวจสอบแล้ว "ไม่ผ่าน"</p>
                                            : <p style={{ fontSize: "13px" }}>ไม่ผ่าน</p>
                                        }

                                      </label>
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>

                          </tr>
                        ))
                    }
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className='text-center'>
                    -- ไม่พบข้อมูล --
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      {/* Modal review evidence file by sub_question_id */}
      <FormReviewEvidenceOnly evidenceBySubId={evidenceBySubId} />


    </div>
  )
}

export default FormApproveService