import { useEffect, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListCategory } from '../../../api/Category';
import { getListQuestionByCatId } from '../../../api/Queation';
import { getListSubQuestionByCatId } from '../../../api/SubQuestion';
import { getListChoicesByCatId } from '../../../api/Choices';

const FormDetailEvaluation = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listCategories, setListCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [listQuestions, setListQuestions] = useState([]);
    const [listSubQuestions, setListSubQuestions] = useState([]);
    const [listChoices, setListChoices] = useState([]);
    const [valueCatId, setValueCatId] = useState(null);

    useEffect(()=>{
        loadListCategories(token);
    }, []);

    const loadListCategories = async () =>{
        try {
            const res = await getListCategory(token);
            setListCategories(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const loadListQuestions = async () =>{
        try {
            setIsLoading(true);
            const res = await getListQuestionByCatId(token);
            setListQuestions(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const loadListSubQuestions = async () =>{
        try {
            const res = await getListSubQuestionByCatId(token);
            setListSubQuestions(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const loadListChoices = async () =>{
        try {
            const res = await getListChoicesByCatId(token);
            setListChoices(res.data);
        } catch (err) {
            console.log(err)
        }
    }

    const catOption = listCategories.map((item, idx) => ({
        value: item.id,
        label: (idx+1) + ") " + item.category_name_th
    }));

    const handleSelectedCategory = (e) =>{
        const selectValue = e.target.value;
        setValueCatId(setValueCatId);

        loadListQuestions(token, parseInt(selectValue));
        loadListSubQuestions(token, parseInt(selectValue));
        loadListChoices(token, parseInt(selectValue));
    }

  return (
    <>    
        <div style={{fontFamily: 'Sarabun, sans-serif'}}>
            <div className='d-flex justify-content-center'>
                <h3 className="p-3">รายละเอียดการประเมินโรงพยาบาลอัจฉริยะ ปีงบประมาณ พ.ศ. 2569</h3>
            </div>

            {/* Category selection */}
            <div className='d-flex justify-content-center mb-3'>
                <select
                    className='form-select w-25'
                    aria-label='Category select to search'
                    value={ valueCatId ?? "" }
                    onChange={handleSelectedCategory}
                >
                    <option>--- เลือกด้านที่ต้องการดูรายละเอียด ---</option>
                    {
                        catOption.sort((a,b) => a.value - b.value).map((item, idx) => (
                            <option key={idx} value={item.value}>
                                {item.label}
                            </option>
                        ))
                    }
                </select>
            </div>

        </div>
    </>
  )
}

export default FormDetailEvaluation