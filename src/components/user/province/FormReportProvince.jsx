import { useState, useEffect } from 'react';
import useGlobalStore from '../../../store/global-store';

const FormReportProvince = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  const province = user?.province;

  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
      <div className='d-flex justify-content-center mb-3'>
        <h4 className='text-success fw-bold'>รายงานการอนุมัติผลการประเมินโรงพยาบาลอัจฉริยะ ของจังหวัด{province}</h4>
      </div>
    </div>
  )
}

export default FormReportProvince