import { useEffect, useState, Fragment } from 'react';
import useGlobalStore from '../../store/global-store';
import {
  getEvaluationByCatId,
  getListHospitalsInEvaluation2,
  getScoreHospitalForSubQuestion2
} from '../../api/Evaluate';
import FormReviewEvidenceOnly from '../user/responder/FormReviewEvidenceOnly';
import { getListCategory } from '../../api/Category';
import { getListQuestion } from '../../api/Queation';
import { getListSubQuestion } from '../../api/SubQuestion';
import { getEvidenceFiles, getListEvidenceByHcode9 } from '../../api/Uploadfile';
import { getProvApproveEvaluation } from '../../api/Approve';
import { getListChoices } from '../../api/Choices';
import { getReportAllCatByHcode9 } from '../../api/Report';
import { FolderOpenIcon } from 'lucide-react';
import { Select } from 'antd';

const FormAdminInfra = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospitals, setListHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [listCategories, setListCategories] = useState([]);
  const [listQuestions, setListQuestions] = useState([]);
  const [listSubQuestions, setListSubQuestions] = useState([]);
  const [listChoices, setListChoices] = useState([]);
  const [evaluationData, setEvaluationData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [fileEvidences, setFileEvidences] = useState(null);
  const [listEvidenceSubId, setListEvidenceSubId] = useState([]);
  const [evidenceBySubId, setEvidenceBySubId] = useState(null);
  const [listProvApprove, setListProvApprove] = useState([]);
  const [scoreForSubQuestion, setScoreForSubQuestion] = useState([]);
  const [resultSumScore, setResultSumScore] = useState(null);

  const isUAT = import.meta.env.VITE_IS_UAT === 'true';
  const category_id = 2;

  useEffect(() => {
    if (!token) return;

    loadListHospitalsInList(token);
  }, [token]);

  const loadListHospitalsInList = async (token) => {
    try {
      const res = await getListHospitalsInEvaluation2(token);
      const data = res.data;
      const filtered = isUAT
        ? data
        : data.filter(f => f.hospital_code !== 'IA0043790')
      setListHospitals(filtered)
    } catch (err) {
      console.log(err);
    }
  }

  const hospitalsOptions = [...new Map(
    listHospitals.map((item) => [
      item.hospital_code,
      { value: item.hospital_code, label: item.hospital_name + ' (' + item.hospital_code + ')' }
    ])
  ).values()]

  useEffect(() => {
    if (!selectedHospital || !token) return;

    // 🔥 Clear ข้อมูลเก่าก่อน
    setEvaluationData([]);
    setListEvidenceSubId([]);
    setFileEvidences([]);

    loadEvaluationCat1(selectedHospital);
    loadEvidenceSubId(selectedHospital);
    loadEvidenceFile(selectedHospital);
    loadScoreForSubQuestion(selectedHospital);
    loadScorebyHcode9(selectedHospital)

    loadListCategories(token);
    loadListQuestions(token);
    loadListSubQuestions(token);
    loadListChoices(token);
    loadListProvApprove(token);
  }, [selectedHospital, token]);

  const loadListCategories = async (token) => {
    try {
      const res = await getListCategory(token);
      const data = res.data;
      setListCategories(data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadListQuestions = async (token) => {
    try {
      const res = await getListQuestion(token);
      const data = res.data;
      setListQuestions(data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadListSubQuestions = async (token) => {
    try {
      const res = await getListSubQuestion(token);
      const data = res.data;
      setListSubQuestions(data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadListChoices = async (token) => {
    try {
      const res = await getListChoices(token);
      const data = res.data;
      setListChoices(data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadEvidenceSubId = async (selectedHospital) => {
    try {
      // Code
      const res = await getListEvidenceByHcode9(token, selectedHospital);
      setListEvidenceSubId(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const loadListProvApprove = async () => {
    try {
      const res = await getProvApproveEvaluation(token, category_id, selectedHospital);
      setListProvApprove(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSelected = async (valueSelected) => {
    setSelectedHospital(valueSelected);
  }

  const loadEvaluationCat1 = async (selectedHospital) => {
    const res = await getEvaluationByCatId(token, category_id, selectedHospital);
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

  // Handle get scores for sub question
  const loadScoreForSubQuestion = async (selectedHospital) => {
    try {
      const res = await getScoreHospitalForSubQuestion2(token, selectedHospital)
      // console.log('R: ', res.data.filter(f => f.category_id === category_id));
      setScoreForSubQuestion(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const loadScorebyHcode9 = async (selectedHospital) => {
    try {
      const res = await getReportAllCatByHcode9(token, selectedHospital);
      const data = res.data;
      const filtered = data.find(f => f.category_id === category_id);
      // console.log('R: ', filtered);
      setResultSumScore(filtered);
    } catch (err) {
      console.log(err);
    }
  }

  const scoreByCatId = scoreForSubQuestion.filter(f => f.category_id === category_id);

  const filterQuestion = listQuestions.filter(f => f.category_id === category_id);
  const filterSubQuestion = listSubQuestions.filter(f => f.category_id === category_id);
  const filterChoice = listChoices.filter(f => f.category_id === category_id);

  const loadEvidenceFile = async (hospital_code) => {
    try {
      setFileEvidences(null);        // ✅ เคลียร์ก่อน

      const res = await getEvidenceFiles(token, hospital_code, category_id);

      if (res.data) {
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
      setEvidenceBySubId({ ...evidenceData })
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

  const category = listCategories.find(c => c.id === category_id);
  const hospital = listHospitals?.find(f => f.hospital_code === selectedHospital);


  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='fw-bold text-success'>ดูข้อมูลด้านโครงสร้าง (InfraStructure)</h4>
      </div>

      <div className='d-flex justify-content-center gap-3 mb-3'>
        <Select
          showSearch={{
            filterOption: (input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          }}
          placeholder="กรุณาเลือกหน่วยบริการ..."
          options={hospitalsOptions}
          onChange={handleSelected}
          style={{ minWidth: 250 }}
        />

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
                {category?.category_name_th
                  ? `${category.category_name_th} ของ`
                  : "ปีงบประมาณ พ.ศ. 2569"
                }

                {hospital ? `${hospital.hospital_name} (${selectedHospital})` : ""}
              </th>
              <th className="text-center" style={{ width: "100px" }}>
                <label>คะแนนที่ได้</label>
                {
                  resultSumScore ? <span className="fw-bold text-primary">({resultSumScore?.answer_value})</span> : null
                }
              </th>
              <th className="text-center" style={{ width: "100px" }}>
                <label>คะแนนจำเป็น</label>
                {
                  resultSumScore ? <span className="fw-bold text-primary">({resultSumScore?.answer_required})</span>: null
                }
              </th>
              <th
                className='text-center'
                style={{ width: '180px' }}
              >
                คกก.จังหวัดอนุมัติ
              </th>
              <th
                className='text-center'
                style={{ width: '180px' }}
              >
                คกก.เขตฯอนุมัติ
              </th>
            </tr>
          </thead>
          <tbody>
            {
              isLoading ? (
                <tr>
                  <td colSpan={3}>
                    <div className='d-flex justify-content-center m-2'>
                      <div className='spinner-border text-success' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {
                    evaluationData && evaluationData.length > 0 ? (
                      filterQuestion.map((item, idx) => (
                        <Fragment key={idx}>
                          {/* Parent row */}
                          <tr className='table-secondary'>
                            <td colSpan={5} className='fw-bold'>{item.question_name}</td>
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
                                  <td className="text-center align-middle">
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
                                  <td className="text-center align-middle">
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
                                            {score.answer_required}
                                          </p>
                                        ))
                                    }
                                  </td>
                                  <td className="text-center align-middle">
                                    {(() => {
                                      const appItem = listProvApprove.find(f => f.sub_question_id === subItem.id)

                                      const status = appItem?.prov_status ?? "";

                                      return (
                                        <div className="d-flex flex-column justify-content-center">

                                          {/* ผ่าน */}
                                          <div className="form-check d-flex align-items-start gap-1">
                                            <input
                                              className="form-check-input m-0 mt-1"
                                              type="radio"
                                              name={`approve_${subItem.id}`}
                                              id={`approve_pass_${subItem.id}`}
                                              value={status}
                                              checked={status === "PASS"}
                                              readOnly
                                            />
                                            <label
                                              className="form-check-label text-success fw-semibold m-0"
                                              htmlFor={`approve_pass_${subItem.id}`}
                                            >
                                              {status === "PASS"
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
                                              value={status}
                                              checked={status === "FAIL"}
                                              readOnly
                                            />
                                            <label
                                              className="form-check-label text-danger fw-semibold m-0"
                                              htmlFor={`approve_fail_${subItem.id}`}
                                            >
                                              {
                                                status === "FAIL"
                                                  ? <p style={{ fontSize: "13px" }}>ตรวจสอบแล้ว "ไม่ผ่าน"</p>
                                                  : <p style={{ fontSize: "13px" }}>ไม่ผ่าน</p>
                                              }

                                            </label>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </td>
                                  <td className="text-center align-middle">
                                    {(() => {
                                      const appItem = listProvApprove.find(f => f.sub_question_id === subItem.id)

                                      const status = appItem?.zone_status ?? "";

                                      return (
                                        <div className="d-flex flex-column justify-content-center">

                                          {/* ผ่าน */}
                                          <div className="form-check d-flex align-items-start gap-1">
                                            <input
                                              className="form-check-input m-0 mt-1"
                                              type="radio"
                                              name={`zone_approve_${subItem.id}`}
                                              id={`zone_approve_pass_${subItem.id}`}
                                              value={status}
                                              checked={status === "PASS"}
                                              readOnly
                                            />
                                            <label
                                              className="form-check-label text-success fw-semibold m-0"
                                              htmlFor={`zone_approve_pass_${subItem.id}`}
                                            >
                                              {status === "PASS"
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
                                              name={`zone_approve_${subItem.id}`}
                                              id={`zone_approve_fail_${subItem.id}`}
                                              value={status}
                                              checked={status === "FAIL"}
                                              readOnly
                                            />
                                            <label
                                              className="form-check-label text-danger fw-semibold m-0"
                                              htmlFor={`zone_approve_fail_${subItem.id}`}
                                            >
                                              {
                                                status === "FAIL"
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
                        <td colSpan={5} className='text-center'>
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

export default FormAdminInfra