import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';

function LiveData() {
  const [data, setData] = useState([]);
  const [searchTerm,setSearchterm]=useState('')
  const [filter,setFilter]=useState([])
  const ws = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let currentItems=data.slice(indexOfFirstItem, indexOfLastItem);
  let totalPages =searchTerm.length && filter.length>0 ? Math.ceil(filter.length / itemsPerPage): Math.ceil(data.length / itemsPerPage)
  const fetchInitialData = useCallback(async () => {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const filteredData = response.data.filter(item => item.symbol.endsWith('USDT'));
      setData(filteredData);
      console.log(filteredData)
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessages = useCallback((event) => {
    const messages = JSON.parse(event.data);
    if (Array.isArray(messages)) {
      setData(prevData => {
        const updatedData = [...prevData];
        messages.forEach(message => {
            if (message.ping) {
                if (ws.current) {
                  ws.current.send(JSON.stringify({ pong: message.ping }));
                }
                return;
              }
          if (message.s.endsWith('USDT')) {
            const index = updatedData.findIndex(item => item.symbol === message.s);
            if (index >= 0) {
              updatedData[index] = { ...updatedData[index], ...message };
            } else {
              updatedData.push(message);
            }
          }
        });
        return updatedData;
      });
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    ws.current = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
    ws.current.onmessage = handleWebSocketMessages;

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [fetchInitialData, handleWebSocketMessages]);


  useEffect(()=>{
    debugger
    currentItems && currentItems.length && setFilter(
        currentItems.filter(value=>{
        return value.symbol.toLowerCase().startsWith(searchTerm.toLowerCase()) || value.symbol.toLowerCase().endsWith(searchTerm.toLowerCase())
      }))
   console.log(searchTerm);
  },[searchTerm,currentItems])



  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  

  return (
    <div className='mt-5 w-full flex justify-center'>
 <div className='w-[90%]'>
    <div className='mb-3 w-[20%]'>
    <input
          type="search"
          value={searchTerm}
          onChange={(e)=>setSearchterm(e.target.value)}
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-8"
          placeholder="Search symbols..."
        />
    </div>
      <table className='text-center w-full  shadow-xl border-collapse'>
        <thead  className=' bg-blue-500 text-white'>
          <tr>
            <th className='font-semibold p-3'>Symbol</th>
            <th className='font-semibold p-3'>Open</th>
            <th className='font-semibold p-3'>High</th>
            <th className='font-semibold p-3'>Low</th>
            <th className='font-semibold p-3'>Close</th>
            <th className='font-semibold p-3'>Change</th>
            <th className='font-semibold p-3'>Change%</th>
            <th className='font-semibold p-3'>Volume</th>
          </tr>
        </thead>
        <tbody>
          {searchTerm.length && filter.length>0 ? 
          (filter.map((item,index) => (
            <tr key={item.symbol} className='p-4 border border-gray-100 border-solid cursor-pointer hover:bg-gray-200'>
              <td className='p-2 font-semibold text-blue-500' >{item.symbol}</td>
              <td className='p-2 text-blue-500' >{item.openPrice}</td>
              <td className='p-2 text-blue-500' >{item.highPrice}</td>
              <td className='p-2 text-blue-500' >{item.lowPrice}</td>
              <td className='p-2 text-blue-500' >{item.prevClosePrice}</td>
              <td className={`p-2 font-semibold ${item.priceChange>=0?'text-green-500':'text-red-500' }`} >{item.priceChange}</td>
              <td className={`p-2 font-semibold ${item.priceChangePercent>=0?'text-green-500':'text-red-500' }`} >{item.priceChangePercent}%</td>
              <td className='p-2 text-blue-500'>{item.volume}</td>
            </tr>)))
          :(currentItems.map((item,index) => (
            <tr key={item.symbol} className='p-4 border border-gray-100 border-solid cursor-pointer hover:bg-gray-200'>
              <td className='p-2 font-semibold text-blue-500' >{item.symbol}</td>
              <td className='p-2 text-blue-500' >{item.openPrice}</td>
              <td className='p-2 text-blue-500' >{item.highPrice}</td>
              <td className='p-2 text-blue-500' >{item.lowPrice}</td>
              <td className='p-2 text-blue-500' >{item.prevClosePrice}</td>
              <td className={`p-2 font-semibold ${item.priceChange>=0?'text-green-500':'text-red-500' }`} >{item.priceChange}</td>
              <td className={`p-2 font-semibold ${item.priceChangePercent>=0?'text-green-500':'text-red-500' }`} >{item.priceChangePercent}%</td>
              <td className='p-2 text-blue-500'>{item.volume}</td>
            </tr>
          )))}
        </tbody>
      </table>
      <div className='flex justify-end'>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      </div>
      </div>
    </div>
  );
}

export default LiveData;
