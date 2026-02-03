import { useEffect, useState, Fragment } from 'react'
import useGlobalStore from '../../../store/global-store'
import { getEvaluationByCatId, getListHospitalsInEvaluation } from '../../../api/Evaluate';
import FormReviewEvidenceOnly from '../responder/FormReviewEvidenceOnly';
import { getListCategory } from '../../../api/Category';
import { getListQuestion } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getEvidenceFiles, getListEvidenceByHcode9 } from '../../../api/Uploadfile';
import { getProvApproveEvaluation } from '../../../api/Approve';
import { getListChoices } from '../../../api/Choices';
import { FolderOpenIcon } from 'lucide-react';

const FormZonePeople = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospitalInEvaluation, setListHospitalInEvaluation] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
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

  const zone = user?.zone;
  const isUAT = import.meta.env.VITE_IS_UAT === 'true';
  const category_id = 5;

  useEffect(() => {
    loadListHospitalInEvaluation(token);
    loadListProvApprove(token);
  }, []);

  const loadListHospitalInEvaluation = async () => {
    try {
      setIsLoading(true);
      const res = await getListHospitalsInEvaluation(token)
      const data = res.data;
      const filtered = isUAT
        ? data.filter(f => Number(f.zone) === Number(zone))
        : data.filter(f => Number(f.zone) === Number(zone) && f.hospital_type !== 'หน่วยงานทดสอบ');
      setListHospitalInEvaluation(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredHospitals = listHospitalInEvaluation.filter(f => f.category_id === category_id);

  const provOption = [...new Map(
    filteredHospitals.map((item) => [
      item.province_code,
      { value: item.province_code, label: item.province }
    ])
  ).values()]

  const hospOption = filteredHospitals.filter(f => f.province_code === selectedProvince).map((item) => ({
    value: item.hospital_code,
    label: item.hospital_name
  }));

  useEffect(() => {
    if (!selectedHospital) return;

    // 🔥 Clear ข้อมูลเก่าก่อน
    setEvaluationData([]);
    setListEvidenceSubId([]);
    setFileEvidences([]);

    loadEvaluationCat1(selectedHospital);
    loadEvidenceSubId(selectedHospital);
    loadEvidenceFile(selectedHospital);

    loadListCategories(token);
    loadListQuestions(token);
    loadListSubQuestions(token);
    loadListChoices(token);

  }, [selectedHospital]);

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
      const res = await getProvApproveEvaluation(token);
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
    setEvidenceBySubId(evidenceData)
  }

  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='fw-bold text-success'>ดูข้อมูลด้านบุคลาการ (People)</h4>
      </div>

      <div className='d-flex justify-content-center gap-3 mb-3'>
        {/* Select จังหวัด */}
        <div className='col-md-3'>
          <select
            className="form-select"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            <option value="">-- เลือกจังหวัด --</option>
            {provOption.map((prov, idx) => (
              <option key={idx} value={prov.value}>
                {prov.label}
              </option>
            ))}
          </select>
        </div>

        {/* Select โรงพยาบาล */}
        <div className='col-md-3'>
          <select
            className="form-select"
            value={selectedHospital}
            disabled={!selectedProvince}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            <option value="">-- เลือกโรงพยาบาล --</option>
            {hospOption.map((hosp, idx) => (
              <option key={idx} value={hosp.value}>
                {hosp.label}
              </option>
            ))}
          </select>
        </div>

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
                style={{ width: '100px' }}
              >
                สสจ.อนุมัติ
              </th>
            </tr>
          </thead>
          <tbody>
            {
              isLoading ? (
                <>
                  <div className='d-flex justify-content-center m-2'>
                    <div className='spinner-border text-success' role='status'>
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {
                    evaluationData && evaluationData.length > 0 ? (
                      filterQuestion.map((item, idx) => (
                        <Fragment key={idx}>
                          {/* Parent row */}
                          <tr className='table-secondary'>
                            <td colSpan={2} className='fw-bold'>{item.question_name}</td>
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
                                                {line}
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
                                                      disabled={true}
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
                                                      disabled={true}
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
                                  <td className="text-center align-middle">
                                    {(() => {
                                      const appItem = listProvApprove.find(f => f.sub_question_id === subItem.id)

                                      return (
                                        <div className="form-check form-switch d-flex justify-content-center">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            checked={Boolean(appItem?.prov_approve)}
                                            disabled={true}
                                          />
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
                </>
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

export default FormZonePeople