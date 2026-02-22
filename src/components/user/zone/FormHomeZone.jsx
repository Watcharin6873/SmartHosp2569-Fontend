import { useEffect, useState, useMemo } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListHospitals } from '../../../api/Hospitals';
import { getListHospitalsInEvaluation } from '../../../api/Evaluate';
import { getCyberLevel, getReportAllCat, getExportExcelMulti_v2 } from '../../../api/Report';
import ProgressZoneEvaluation from './ProgressZoneEvaluation';
import RadarChartZone from './RadarChartZone';
import TableListHospitalScore from './TableListHospitalScore';
import LoadingModal from '../../LoadingModal';

const FormHomeZone = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [listHospitals, setListHospitals] = useState([]);
  const [listHospInEvaluate, setListHospInEvaluate] = useState([]);
  const [listScoreEvaluate, setListScoreEvaluate] = useState([]);
  const [listCyberLevel, setListCyberLevel] = useState([]);


  const zone = user?.zone;
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

  const filteredHospitals = listHospitals.filter(f => Number(f.zone) === Number(zone));

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


  const filteredListEvaluate = listHospInEvaluate.filter(f => Number(f.zone) === Number(zone));

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
      item.zone,
      item.zone_name,
      item.province,
      item.hospital_code,
      item.hospital_name,
      item.hospital_type,
      item.cyber_level
    ].join("|");

    if (!acc[key]) {
      acc[key] = {
        zone: item.zone,
        zone_name: item.zone_name,
        province: item.province,
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


  const countLevelByProvince = (data) => {
    const map = {};

    data.forEach(item => {
      const province = item.province || "ไม่ระบุ";
      const level = item.score_level || "ไม่ผ่าน";

      if (!map[province]) {
        map[province] = {
          province,
          "ระดับเพชร": 0,
          "ระดับทอง": 0,
          "ระดับเงิน": 0,
          "ไม่ผ่าน": 0
        };
      }

      map[province][level] += 1;
    });

    return Object.values(map);
  };


  const levelByProvince = useMemo(() => {
    return countLevelByProvince(withLevel);
  }, [withLevel]);

  // console.log('Level: ', levelByProvince)

  const sortTop10MedalStyle = (data) => {
    return [...data]
      .sort((a, b) => {
        if (b["ระดับเพชร"] !== a["ระดับเพชร"])
          return b["ระดับเพชร"] - a["ระดับเพชร"];

        if (b["ระดับทอง"] !== a["ระดับทอง"])
          return b["ระดับทอง"] - a["ระดับทอง"];

        if (b["ระดับเงิน"] !== a["ระดับเงิน"])
          return b["ระดับเงิน"] - a["ระดับเงิน"];

        // ไม่ผ่าน ยิ่งน้อยยิ่งดี
        return a["ไม่ผ่าน"] - b["ไม่ผ่าน"];
      })
      .slice(0, 10);
  };

  const top10Province = useMemo(() => {
    return sortTop10MedalStyle(levelByProvince);
  }, [levelByProvince]);


  const getTotalSummary = (data) => {
    return data.reduce(
      (acc, item) => {
        acc.totalHospitals += 1;

        if (item.score_level === "ระดับเพชร") acc.ระดับเพชร += 1;
        else if (item.score_level === "ระดับทอง") acc.ระดับทอง += 1;
        else if (item.score_level === "ระดับเงิน") acc.ระดับเงิน += 1;
        else acc.ไม่ผ่าน += 1;

        return acc;
      },
      {
        totalHospitals: 0,
        ระดับเพชร: 0,
        ระดับทอง: 0,
        ระดับเงิน: 0,
        ไม่ผ่าน: 0
      }
    );
  };

  const totalSummary = useMemo(() => {
    return getTotalSummary(withLevel);
  }, [withLevel]);


  const loadExportExcelMulti = async () => {
        try {
            setIsExportLoading(true);

            const listHcode9 = listHospitals
              .filter(f=> Number(f.zone) === Number(zone))
              .map(h => h.hcode9);
            // console.log("Hosp: ", listHcode9);

            const res = await getExportExcelMulti_v2(token, listHcode9);

            const url = window.URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `รายละเอียดการประเมินของเขตสุขภาพที่ ${zone}.xlsx`;
            link.click();

        } catch (err) {
            console.log(err);
        } finally {
          setIsExportLoading(false);
        }
    }


  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>

      <ProgressZoneEvaluation
        filteredHospitals={filteredHospitals}
        filteredListEvaluate={filteredListEvaluate}
      />

      <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-2 g-3 mb-3'>
        <div className='col'>
          <div
            className='p-3 border bg-light rounded-3 shadow h-100 position-relative overflow-hidden'
          >
            <RadarChartZone withLevel={withLevel} />
          </div>
        </div>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            {/* content อีกฝั่ง */}
            <div className='table-responsive'>
              <table className='table mb-2' style={{ fontSize: '13px' }}>
                <thead>
                  <tr className='table-success'>
                    <th colSpan={6} className='text-center'>จังหวัดที่ได้ระดับสูงสุด (Top Level)</th>
                  </tr>
                  <tr className='text-center'>
                    <th>อันดับ</th>
                    <th>จังหวัด</th>
                    <th>💎 ระดับเพชร</th>
                    <th>🟡 ระดับทอง</th>
                    <th>⚪ ระดับเงิน</th>
                    <th>🔴 ไม่ผ่าน</th>
                  </tr>
                </thead>
                <tbody>
                  {top10Province.map((row, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="fw-bold">
                        {idx === 0 && "🥇"}
                        {idx === 1 && "🥈"}
                        {idx === 2 && "🥉"}
                        {idx > 2 && idx + 1}
                      </td>
                      <td className="text-start fw-bold">{row.province}</td>
                      <td className="text-primary fw-bold">{row["ระดับเพชร"]}</td>
                      <td className="text-warning fw-bold">{row["ระดับทอง"]}</td>
                      <td className="text-secondary fw-bold">{row["ระดับเงิน"]}</td>
                      <td className="text-danger fw-bold">{row["ไม่ผ่าน"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='d-flex justify-content-end'>
                <span className='fw-bold'>รวมทั้งหมด ({totalSummary.totalHospitals} โรงพยาบาล) 💎 {totalSummary.ระดับเพชร} |
                  🟡 {totalSummary.ระดับทอง} |
                  ⚪ {totalSummary.ระดับเงิน} |
                  🔴 {totalSummary.ไม่ผ่าน}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TableListHospitalScore 
        originalData={originalData} 
        withLevel={withLevel} 
        loadExportExcelMulti={loadExportExcelMulti} 
      />

      <LoadingModal show={isLoading || isExportLoading} />

    </div>
  )
}

export default FormHomeZone