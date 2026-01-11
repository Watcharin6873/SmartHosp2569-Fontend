import { useEffect, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getCyberLevelByHosp, getReportAllCatByHcode9 } from '../../../api/Report';
import { BlocksIcon, HandPlatter, MonitorCog, UsersRound, Star, Medal } from 'lucide-react';

const FormHomeResponder = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [cyberLevel, setCyberLevel] = useState(null);
  const [reportAllCat, setReportAllCat] = useState([]);

  const hcode9 = user?.hcode9;

  useEffect(() => {
    loadReportAllCat(token, hcode9);
    loadCyberLevelByHosp(token, hcode9);
  }, []);

  // Get report all category
  const loadReportAllCat = async () => {
    try {
      const res = await getReportAllCatByHcode9(token, hcode9);
      setReportAllCat(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Get cyber level by hcode9
  const loadCyberLevelByHosp = async () => {
    try {
      const res = await getCyberLevelByHosp(token, hcode9);
      setCyberLevel(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  // Category score
  const infraScore = reportAllCat.filter(f => f.category_id === 2);
  const managementScore = reportAllCat.filter(f => f.category_id === 3);
  const serviceScore = reportAllCat.filter(f => f.category_id === 4);
  const peopleScore = reportAllCat.filter(f => f.category_id === 5);

  // Total score
  const totalScoreSum = reportAllCat.reduce((acc, item) => {
    acc.answer_value += item.answer_value || 0;
    acc.answer_required += item.answer_required || 0;
    return acc;
  }, { answer_value: 0, answer_required: 0 }
  );


  return (
    <>
      <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3'>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
              <div
                className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                style={{
                  width: 'clamp(44px, 6vw, 56px)',
                  height: 'clamp(44px, 6vw, 56px)',
                  backgroundColor: '#f7ecd0',
                  border: '1px solid #05770d',
                }}
              >
                <Medal size={28} color='#05770d' />
              </div>

              <p
                className="fw-bold mb-0 text-wrap"
                style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
              >
                คะแนนที่ได้อยู่ในระดับ (Level)
              </p>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
              <div
                className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                style={{
                  width: 'clamp(44px, 6vw, 56px)',
                  height: 'clamp(44px, 6vw, 56px)',
                  backgroundColor: '#f7ecd0',
                  border: '1px solid #05770d',
                }}
              >
                <BlocksIcon size={28} color='#05770d' />
              </div>

              <p
                className="fw-bold mb-0 text-wrap"
                style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
              >
                ด้านโครงสร้าง (Infrastructure)
              </p>
            </div>

            <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                {/* Logic show score */}
                {
                  infraScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/300</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 300 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนจำเป็น</p>
                {/* Logic show score */}
                {
                  infraScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-success mb-2'>{item.answer_required}/170</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_required / 170 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
            </div>

            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>
            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>

          </div>
        </div>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
              <div
                className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                style={{
                  width: 'clamp(44px, 6vw, 56px)',
                  height: 'clamp(44px, 6vw, 56px)',
                  backgroundColor: '#f7ecd0',
                  border: '1px solid #05770d',
                }}
              >
                <MonitorCog size={28} color='#05770d' />
              </div>

              <p
                className="fw-bold mb-0 text-wrap"
                style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
              >
                ด้านบริหารจัดการ (Management)
              </p>
            </div>

            <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                {/* Logic show score */}
                {
                  managementScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/300</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 300 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนจำเป็น</p>
                {/* Logic show score */}
                {
                  managementScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-success mb-2'>{item.answer_required}/170</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_required / 170 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
            </div>

            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>
            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>

          </div>
        </div>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-5">
              <div
                className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                style={{
                  width: 'clamp(44px, 6vw, 56px)',
                  height: 'clamp(44px, 6vw, 56px)',
                  backgroundColor: '#f7ecd0',
                  border: '1px solid #05770d',
                }}
              >
                <Star size={28} color='#05770d' />
              </div>

              <p
                className="fw-bold mb-0 text-wrap"
                style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
              >
                คะแนนรวมทุกด้าน (Total Score)
              </p>
            </div>

            <div className='d-flex justify-content-between px-2'>
              <div>
                <p className='text-muted fw-bold'>คะแนนที่ได้รวม</p>
              </div>
              <div>
                <p className='fw-bold'>{totalScoreSum.answer_value}</p>
              </div>
            </div>
            <div className='d-flex justify-content-between px-2'>
              <div>
                <p className='text-muted fw-bold'>คะแนนจำเป็นรวม</p>
              </div>
              <div>
                <p className='fw-bold'>{totalScoreSum.answer_required}</p>
              </div>
            </div>
            <div className='d-flex justify-content-between px-2'>
              <div>
                <p className='text-muted fw-bold'>ระดับเกณฑ์ CTAM ของ ศทส.</p>
              </div>
              <div>
                {
                  cyberLevel?.cyber_level === 'GREEN'
                    ? <p className='fw-bold text-success'>{cyberLevel?.cyber_levelname}</p>
                    : cyberLevel?.cyber_level === 'YELLOW'
                      ? <p className='fw-bold text-warning'>{cyberLevel?.cyber_levelname}</p>
                      : cyberLevel?.cyber_level === 'RED'
                        ? <p className='fw-bold text-danger'>{cyberLevel?.cyber_levelname}</p>
                        : <p className='fw-bold'>-</p>
                }
              </div>
            </div>

          </div>
        </div>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
              <div
                className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                style={{
                  width: 'clamp(44px, 6vw, 56px)',
                  height: 'clamp(44px, 6vw, 56px)',
                  backgroundColor: '#f7ecd0',
                  border: '1px solid #05770d',
                }}
              >
                <HandPlatter size={28} color='#05770d' />
              </div>

              <p
                className="fw-bold mb-0 text-wrap"
                style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
              >
                ด้านการบริการ (Service)
              </p>
            </div>

            <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                {/* Logic show score */}
                {
                  serviceScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/300</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 300 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนจำเป็น</p>
                {/* Logic show score */}
                {
                  serviceScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-success mb-2'>{item.answer_required}/170</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_required / 170 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
            </div>

            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>
            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>

          </div>
        </div>
        <div className='col'>
          <div className='p-3 border bg-light rounded-3 shadow h-100'>
            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
              <div
                className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                style={{
                  width: 'clamp(44px, 6vw, 56px)',
                  height: 'clamp(44px, 6vw, 56px)',
                  backgroundColor: '#f7ecd0',
                  border: '1px solid #05770d',
                }}
              >
                <UsersRound size={28} color='#05770d' />
              </div>

              <p
                className="fw-bold mb-0 text-wrap"
                style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
              >
                ด้านบุคลากร (People)
              </p>
            </div>

            <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
              <div
                className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                style={{
                  maxWidth: '180px',
                  minHeight: '140px',
                }}
              >
                <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                {/* Logic show score */}
                {
                  peopleScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/100</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 100 * 100).toFixed(2)} %</p>
                      </div>
                  ))
                }

              </div>
            </div>

            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>
            <div className='d-flex justify-content-between px-2'>
              <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
              <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default FormHomeResponder