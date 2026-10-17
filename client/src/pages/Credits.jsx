import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import { dummyPlans } from '../assets/assets' 
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Credits = () => {
const [plans, setPlans] = useState([]);
const [loading, setLoading] = useState(true);
const {token , axios} = useAppContext()

const fetchPlans = async () => {
  try {
    const {data} = await axios.get('/api/credit/plan',{headers:{Authorization: token}})
    if(data.success){
      setPlans(data.plans)
    }else{
      toast.error(data.message || 'Failed to Fetch plans')
    }
  } catch (error) {
    toast.error(error.message)
  }
  setLoading(false)
}

const purchasaePlan = async (planId) =>{
  try {
    const { data } = await axios.post('/api/credit/purchase',{planId}, {headers:{Authorization: token}})
    if(data.success){
      window.location.href = data.url
    }else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
  }
}


useEffect(() => {
    fetchPlans();
}, []);

if (loading) return <Loading />;

  return (
    <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
  <h2 className='text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white'>Credit Plans</h2>

  <div className='flex flex-wrap justify-center gap-8'>
    {plans.map((plan) => (
      <div 
        key={plan.id} 
        className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${
          plan.id === "pro" ? "bg-purple-50 dark:bg-purple-900" : "bg-white dark:bg-transparent"
        }`}
      >
        <div className='flex-1'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>{plan.name}</h3>
          <p className='text-2xl font-bold text-purple-600 text-purple-600 dark:text-purple-300 mb-4'>${plan.price} <span className='text-base font-normal text-gray-600 dark:text-purple-200'>{' '}/ {plan.credits} credits</span></p>
          <ul className='list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1'>
            {plan.features.map((features,index)=>(
              <li key={index}>{features}</li>
            ))}
          </ul>
        </div>
        <button onClick={()=> toast.promise(purchasaePlan(plan._id),{loading:'Processing...'})} className='mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 px-4 rounded transition-colors duration-200 cursor-pointer'>Buy Now</button>
      </div>
    ))}
  </div>
</div>
  )
}

export default Credits
