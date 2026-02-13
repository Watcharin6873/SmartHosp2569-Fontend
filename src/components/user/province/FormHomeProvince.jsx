import { useState, useEffect } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListHospitals } from '../../../api/Hospitals';
import { getListHospitalsInEvaluation } from '../../../api/Evaluate';
import { getCyberLevel, getReportAllCat } from '../../../api/Report';
import RadarChartProvince from './RadarChartProvince';
import ProgressEvaluation from './ProgressEvaluation';
import TableForHome from './TableForHome';

const FormHomeProvince = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listHospitals, setListHospitals] = useState([]);
  const [listHospInEvaluate, setListHospInEvaluate] = useState([]);
  const [listScoreEvaluate, setListScoreEvaluate] = useState([]);
  const [listCyberLevel, setListCyberLevel] = useState([]);

  const province = user?.province;
  const isUAT = import.meta.env.VITE_IS_UAT === 'true';

  useEffect(() => {
    if (!token) return;

    loadLiastHospitals(token);
    loadListHospInEvaluate(token);
    loadScoreEvaluation(token);
    loadListCyberLevel(token);
  }, [token]);

  const loadLiastHospitals = async () => {
    try {
      const res = await getListHospitals(token);
      const data = res.data;
      const filtered = isUAT ? data : data?.filter(f => f.dept_type !== 'หน่วยงานทดสอบ');
      setListHospitals(filtered);
    } catch (err) {
      console.log(err);
    }
  }

  const filteredHospitals = listHospitals.filter(f => f.province === province);

  const loadListHospInEvaluate = async () => {
    try {
      const res = await getListHospitalsInEvaluation(token);
      const data = res.data;
      const filtered = isUAT ? data : data?.filter(f => f.hospital_type !== 'หน่วยงานทดสอบ');
      setListHospInEvaluate(filtered);
    } catch (err) {
      console.log(err);
    }
  }

  const loadScoreEvaluation = async () => {
    try {
      setIsLoading(true);
      const res = await getReportAllCat(token);
      const data = res.data;
      setListScoreEvaluate(data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const loadListCyberLevel = async () => {
    try {
      setIsLoading(true);
      const res = await getCyberLevel(token);
      const data = res.data;
      setListCyberLevel(data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }


  const filteredListEvaluate = listHospInEvaluate.filter(f => f.province === province);

  const originalData = filteredHospitals.flatMap((item1) => {
    return listScoreEvaluate
      .filter(item2 => item2.hospital_code === item1.hcode9)
      .map(item2 => {
        const cyber = listCyberLevel.find(
          item3 => item3.hcode9 === item2.hospital_code
        );

        return {
          zone: item1.zone,
          zone_name: item1.zone_name,
          province: item1.province,
          hospital_code: item2.hospital_code,
          hospital_name: item2.hospital_name,
          hospital_type: item1.dept_type,
          category_id: item2.category_id,
          answer_value: item2.answer_value,
          answer_required: item2.answer_required,
          cyber_level: cyber?.cyber_level || null,
          cyber_levelname: cyber?.cyber_levelname || null
        };
      });
  });

  const groupedData = originalData.reduce((acc, item) => {
    const key = [
      item.hospital_code,
      item.hospital_name,
      item.hospital_type,
      item.cyber_level
    ].join("|");

    if (!acc[key]) {
      acc[key] = {
        hospital_code: item.hospital_code,
        hospital_name: item.hospital_name,
        hospital_type: item.hospital_type,
        cyber_level: item.cyber_level,
        cyber_levelname: item.cyber_levelname,
        total_answer_value: 0,
        total_answer_required: 0
      };
    }

    acc[key].total_answer_value += Number(item.answer_value || 0);
    acc[key].total_answer_required += Number(item.answer_required || 0);

    return acc;
  }, {});

  // แปลง Object → Array
  const resultGroupData = Object.values(groupedData);

  const withLevel = resultGroupData.map(item => {
    let level = "";

    if (item.total_answer_value < 600) level = "ไม่ผ่าน";
    else if ((item.total_answer_value >= 600 && item.total_answer_value < 700) ||
      (item.total_answer_value >= 700 && item.total_answer_value < 800 && item.total_answer_required < 510) ||
      (item.total_answer_value >= 800 && item.total_answer_required < 510)) level = "ระดับเงิน";
    else if ((item.total_answer_value >= 700 && item.total_answer_value < 800 && item.total_answer_required === 510) ||
      (item.total_answer_value >= 800 && item.total_answer_required === 510 && item.cyber_level !== 'GREEN')) level = "ระดับทอง";
    else if (item.total_answer_value >= 800 && item.total_answer_required === 510 && item.cyber_level === 'GREEN') level = "ระดับเพชร";

    return {
      ...item,
      score_level: level
    };
  });

  const topTrendHospEvaluate = [...withLevel]
    .sort((a, b) => {
      if (b.total_answer_value !== a.total_answer_value) {
        return b.total_answer_value - a.total_answer_value;
      }
      return b.total_answer_required - a.total_answer_required
    })
    .slice(0, 10);

  const getScoreColor = (value, required = 510, cyberLevel = null) => {
    if (value < 600) return 'text-danger';     // 🔴 ไม่ผ่าน
    if (value >= 600 && value < 700) return 'text-secondary';  // ⚪ เงิน
    if (value >= 700 && value < 800 && required < 510) return 'text-secondary';  // ⚪ เงิน
    if (value >= 800 && required < 510) return 'text-secondary';  // ⚪ เงิน

    // 🟡 ทอง ต้องผ่าน required
    if (value >= 700 && value < 800 && required === 510) return 'text-warning';
    if (value >= 800 && value && required === 510 && cyberLevel !== 'GREEN') return 'text-warning';

    // 💎 เพชร ต้องผ่าน required + cyber_level = GREEN
    if (value >= 800 && required === 510 && cyberLevel === 'GREEN')
      return 'text-primary';

    return 'text-dark'; // fallback
  };


  return (
    <div
      style={{
        fontFamily: 'Sarabun, sans-serif'
      }}
    >
      <ProgressEvaluation
        filteredListEvaluate={filteredListEvaluate}
        filteredHospitals={filteredHospitals}
      />

      <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-2 g-3 mb-3'>
        <div className='col'>
          <div
            className='p-3 border bg-light rounded-3 shadow h-100 position-relative overflow-hidden'
          >
            <RadarChartProvince withLevel={withLevel} />
          </div>
        </div>

        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            {/* content อีกฝั่ง */}
            <div className='table-responsive'>
              <table className='table' style={{ fontSize: '13px' }}>
                <thead>
                  <tr className='table-success'>
                    <th colSpan={4} className='text-center'>Top 10 โรงพยาบาลที่ได้คะแนนสูงสุด</th>
                  </tr>
                  <tr>
                    <th className='text-center'>โรงพยาบาล</th>
                    <th className='text-center'>คะแนนที่ได้</th>
                    <th className='text-center'>คะแนนจำเป็น</th>
                    <th className='text-center'>ระดับที่ได้</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    topTrendHospEvaluate && topTrendHospEvaluate.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.hospital_name} ({item.hospital_code})</td>
                        <td className='text-center'>{item.total_answer_value}</td>
                        <td className='text-center'>{item.total_answer_required}</td>
                        <td
                          className={`text-center ${getScoreColor(
                            item.total_answer_value,
                            item.total_answer_required,
                            item.cyber_level
                          )}`}
                        >
                          {item.score_level}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <TableForHome
        originalData={originalData}
        withLevel={withLevel}
      />

    </div>
  )
}

export default FormHomeProvince