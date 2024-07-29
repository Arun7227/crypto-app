import { useEffect, useState } from 'react';
import CandleStickChart from '../components/CandleStickChart';
import axios from 'axios';
import SymbolsDropdown from '../components/Symbols';
import clockSvg from "../assets/svg/clock.svg"

const ChartPage = () => {
    const [exchangeInfo,setExchangeInfo]=useState([])
    const [symbol,setSymbol]=useState('BTCUSDT');
    const [timeframe,setTimeframe]=useState('4h')
    const setSelectedSymbol=(value)=>{
      setSymbol(value)
    }
    const fetchExangeInfo=async()=>{
      const response=await axios.get('https://api.binance.com/api/v1/exchangeInfo');
      let data=response.data
      setExchangeInfo(data)
    }
    useEffect(()=>{
      fetchExangeInfo()
    },[])
  
    let timeframes=[ "1s","1m","3m","5m","15m","30m","1h","2h","4h","6h","8h","12h","1d","3d","1w","1M"]
    return (
      <div className="App">
        <div className='bg-white py-3 w-full custom-shadow'>
          <SymbolsDropdown selectedOption={symbol} setSelectedOption={setSelectedSymbol} data={exchangeInfo}/>
  
          <div className='relative inline-block'>
          <img className='absolute top-[9px] left-[1.5rem] h-[1.3rem] w-[1.3rem]'  src={clockSvg} alt='lens'/>
            <select className=' border border-gray-300 rounded-md shadow-sm py-2 pl-10 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' onChange={(e)=>setTimeframe(e.target.value)} value={timeframe} >
              {timeframes.length && timeframes.map((value,index)=>(
                <option key={index} value={value}>{value}</option>
              ))}
            </select>
  
          </div>
  
  
  
        </div>
        <CandleStickChart symbol={symbol} interval={timeframe}/>
      </div>
    );
}

export default ChartPage