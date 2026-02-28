import { useEffect, useMemo, useState } from 'react';
import useGlobalStore from '../../store/global-store';
import { getListHospitals, getListHospForDashboard } from '../../api/Hospitals';
import { getListHospitalsInEvaluation } from '../../api/Evaluate';
import {
  getCyberLevelForDashboard,
  getResultScoreAllCat,
  getCyberLevel,
  getReportAllCat,
  getExportExcelMulti_v2
} from '../../api/Report';
import Blue_gem from '../../assets/Blue-gem.png';
import Gold from '../../assets/Gold2.png'
import Silver from '../../assets/Silver2.png';
import Hosp from '../../assets/Hospital.png';
import { Ban } from 'lucide-react';
import TableForHomeDashBoard from '../TableForHomeDashBoard';
import BarchartForDashboard from '../BarchartForDashboard';
import ProgressCountryEvaluation from './ProgressCountryEvaluation';

const HomeAdmin = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState([]);
  const [listHospForAll, setListHospForAll] = useState([]);
  const [listResultScoreForAll, setListResultScoreForAll] = useState([]);
  const [listCyberLevel, setListCyberLevel] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [listHospitals, setListHospitals] = useState([]);
  const [listHospInEvaluate, setListHospInEvaluate] = useState([]);
  const [listScoreEvaluate, setListScoreEvaluate] = useState([]);

  const isUAT = import.meta.env.VITE_IS_UAT === 'true';

  useEffect(() => {
    loadListHospitalsForAll();
    loadResultScoreAllCat();
    loadListCyberLevel();
  }, []);

  const loadListHospitalsForAll = async () => {
    try {

      const res = await getListHospForDashboard()
      const data = res.data;
      const filtered = isUAT ? data : data.filter(f => f.dept_type !== 'หน่วยงานทดสอบ');

      setListHospForAll(filtered);

    } catch (err) {
      console.log(err);
    }
  }

  const loadResultScoreAllCat = async () => {
    try {

      const res = await getResultScoreAllCat();
      const data = res.data;
      const filtered = isUAT ? data : data.filter(f => f.hospital_code !== 'IA0043790');

      setListResultScoreForAll(filtered);

    } catch (err) {
      console.log(err);
    }
  }

  const loadListCyberLevel = async () => {
    try {
      const res = await getCyberLevelForDashboard();
      const data = res.data;

      setListCyberLevel(data);

    } catch (err) {
      console.log(err);
    }
  }


  const originalData = listHospForAll
    .sort((a, b) => Number(a.zone) - Number(b.zone))
    .flatMap((item1) => {
      return listResultScoreForAll
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

  const allLevelCount = (data) => {
    const result = {
      "ระดับเพชร": 0,
      "ระดับทอง": 0,
      "ระดับเงิน": 0,
      "ไม่ผ่าน": 0
    };

    data.forEach(item => {
      const level = item.score_level || "ไม่ผ่าน";

      if (result[level] !== undefined) {
        result[level] += 1;
      } else {
        result["ไม่ผ่าน"] += 1;
      }
    });

    return result;
  };


  const latestLevel = useMemo(() => {
    return allLevelCount(withLevel);
  }, [withLevel]);


  const totalHospital = listHospForAll.length;
  // const totalHospital = 902

  const zoneInitailsData = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    return {
      zone: num.toString().padStart(2, "0"),
      zone_name: `เขตสุขภาพที่ ${num}`
    };
  });

  const countLevelByZone = (data) => {
    const map = {};

    data.forEach(item => {
      const zone = item.zone || "ไม่ระบุ";
      const zone_name = item.zone_name || "ไม่ระบุ";
      const level = item.score_level || "ไม่ผ่าน";

      if (!map[zone]) {
        map[zone] = {
          zone,
          zone_name,
          "ระดับเพชร": 0,
          "ระดับทอง": 0,
          "ระดับเงิน": 0,
          "ไม่ผ่าน": 0
        };
      }

      map[zone][level] += 1;
    });

    return Object.values(map);
  };


  const levelByZone = useMemo(() => {
    return countLevelByZone(withLevel);
  }, [withLevel]);

  const leftJoinByZone = (array1, array2) => {
    const zoneMap = new Map(
      array2.map(item => [String(item.zone), item])
    );

    return array1.map(item => {
      const match = zoneMap.get(String(item.zone));

      return {
        ...item,
        // ถ้ามีข้อมูลใน array2 → merge
        ...(match || {
          "ระดับเพชร": 0,
          "ระดับทอง": 0,
          "ระดับเงิน": 0,
          "ไม่ผ่าน": 0
        })
      };
    });
  };

  const resultFobar = leftJoinByZone(
    zoneInitailsData,          // array1
    levelByZone // array2 (จาก withLevel)
  );

  // Sort top medal
  const sortTopMedalStyle = (data) => {
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
      .slice(0, 12);
  };

  const topZoneMedal = useMemo(() => {
    return sortTopMedalStyle(levelByZone);
  }, [levelByZone]);


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


  useEffect(() => {
    if (!token) return;

    loadListHospitals(token);
    loadListHospInEvaluate(token);
  }, [token]);


  const loadListHospitals = async () => {
    try {
      const res = await getListHospitals(token);
      const data = res.data;
      const filtered = isUAT ? data : data?.filter(f => f.dept_type !== 'หน่วยงานทดสอบ');
      setListHospitals(filtered);
    } catch (err) {
      console.log(err);
    }
  }

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


  return (
    <div style={{ fontFamily: "Sarabun, sans-serif" }}>

      {/* Card show level */}
      <ProgressCountryEvaluation
        listHospitals={listHospitals}
        listHospitalsInEvaluate={listHospInEvaluate}
      />

      {/* Chart */}
      <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-2 g-3 mb-3'>
        <div className='col'>
          <div className='d-flex align-items-center p-3 border bg-light rounded-3 shadow h-100'>
            <div className='w-100'>
              <BarchartForDashboard resultFobar={resultFobar} />
            </div>
          </div>
        </div>
        <div className='col'>

          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            {/* content อีกฝั่ง */}
            <div className='table-responsive'>
              <table className='table mb-2' style={{ fontSize: '13px' }}>
                <thead>
                  <tr className='table-success'>
                    <th colSpan={6} className='text-center'>เขตสุขภาพที่ได้ระดับสูงสุด (Top Level)</th>
                  </tr>
                  <tr className='text-center'>
                    <th>อันดับ</th>
                    <th>เขตสุขภาพ</th>
                    <th>💎 ระดับเพชร</th>
                    <th>🟡 ระดับทอง</th>
                    <th>⚪ ระดับเงิน</th>
                    <th>🔴 ไม่ผ่าน</th>
                  </tr>
                </thead>
                <tbody>
                  {topZoneMedal.map((row, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="fw-bold">
                        {idx === 0 && "🥇"}
                        {idx === 1 && "🥈"}
                        {idx === 2 && "🥉"}
                        {idx > 2 && idx + 1}
                      </td>
                      <td className="text-center fw-bold">เขต {Number(row.zone)}</td>
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

      {/* ตารางข้อมูล */}
      <TableForHomeDashBoard originalData={originalData} withLevel={withLevel} />

    </div>
  )
}

export default HomeAdmin
