import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';

function LiveData() {
  const [data, setData] = useState([]);
  const ws = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); 
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


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className='mt-5 w-full flex justify-center'>
 <div className='w-[90%]'>
      <table className='text-center w-full  shadow-xl border-collapse'>
        <thead  className=' bg-blue-500 text-white'>
          <tr>
            <th className='font-semibold p-3'>Symbol</th>
            <th className='font-semibold p-3'>Last</th>
            <th className='font-semibold p-3'>Change</th>
            <th className='font-semibold p-3'>Change%</th>
            <th className='font-semibold p-3'>Volume</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item,index) => (
            <tr key={item.symbol} className='p-4 border border-gray-100 border-solid cursor-pointer hover:bg-gray-200'>
              <td className='p-2 font-semibold text-blue-500' >{item.symbol}</td>
              <td className='p-2 text-blue-500' >{item.lastPrice}</td>
              <td className={`p-2 font-semibold ${item.priceChange>=0?'text-green-500':'text-red-500' }`} >{item.priceChange}</td>
              <td className={`p-2 font-semibold ${item.priceChangePercent>=0?'text-green-500':'text-red-500' }`} >{item.priceChangePercent}%</td>
              <td className='p-2 text-blue-500'>{item.volume}</td>
            </tr>
          ))}
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
