  import React, { useCallback, useEffect, useRef, useState } from 'react';
  import { createChart } from 'lightweight-charts';
  import axios from 'axios';
  import { fromZonedTime } from 'date-fns-tz';

  function CandleStickChart({ symbol, interval }) {
    const [chartData, setChartData] = useState([]);
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const ws = useRef(null);
    const isLoadingRef = useRef(false);

    const fetchInitialData = useCallback(async () => {
      try {
        const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`);
        const data = response.data;
        const processedData = data.map(item => ({
          time: fromZonedTime(new Date(item[0]), 'Asia/Kolkata').getTime() / 1000,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    }, [symbol, interval]);

    const handleWebSocketMessages = useCallback((event) => {
      const message = JSON.parse(event.data);
      if (message.k) {
        const kline = message.k;
        const newCandle = {
          time: fromZonedTime(new Date(kline.t), 'Asia/Kolkata').getTime() / 1000,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        setChartData(prevData => {
          const existingCandleIndex = prevData.findIndex(d => d.time === newCandle.time);
          if (existingCandleIndex >= 0) {
            const updatedData = [...prevData];
            updatedData[existingCandleIndex] = newCandle;
            return updatedData;
          } else {
            return [...prevData, newCandle];
          }
        });
      }
    }, []);

    useEffect(() => {
      fetchInitialData();

      ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}@+05:30`);
      ws.current.onmessage = handleWebSocketMessages;

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }, [symbol, interval, fetchInitialData, handleWebSocketMessages]);
    const fetchMoreData = useCallback(async (endTime) => {
          if (isLoadingRef.current) return;
          isLoadingRef.current = true;
      
          try {
            const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&endTime=${endTime}`);
            const data = response.data;
            const processedData = data.map(item => ({
              time: fromZonedTime(new Date(item[0]), 'Asia/Kolkata').getTime() / 1000,
              open: parseFloat(item[1]),
              high: parseFloat(item[2]),
              low: parseFloat(item[3]),
              close: parseFloat(item[4]),
            }));
            processedData.sort((a, b) => a.time - b.time);
      
            setChartData(prevData => {
              const combinedData = [...processedData, ...prevData];
              const uniqueData = combinedData.filter((item, index, self) =>
                index === self.findIndex(t => t.time === item.time)
              );
              uniqueData.sort((a, b) => a.time - b.time); // Ensure data is sorted by time
              return uniqueData;
            });
          } catch (error) {
            console.error('Error fetching more data:', error);
          } finally {
            isLoadingRef.current = false;
          }
        }, [symbol, interval]);
    useEffect(() => {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
        grid: {
          vertLines: {
            color: '#e1e1e1',
          },
          horzLines: {
            color: '#e1e1e1',
          },
        },
        crosshair: {
          mode: 1,
        },
        priceScale: {
          borderColor: '#e1e1e1',
        },
        timeScale: {
          borderColor: '#e1e1e1',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#4caf50',
        downColor: '#f44336',
        borderVisible: false,
        wickUpColor: '#4caf50',
        wickDownColor: '#f44336',
      });

      candlestickSeries.setData(chartData);
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      chart.timeScale().subscribeVisibleTimeRangeChange((newVisibleTimeRange) => {
              const firstCandleTime = chartData[0]?.time;
              if (newVisibleTimeRange.from <= firstCandleTime) {
                fetchMoreData(firstCandleTime * 1000); 
              }
            });
      return () => {
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          candlestickSeriesRef.current = null;
        }
      };
    }, [chartData,fetchMoreData]);

    return (
      <div className='pb-20'
        ref={chartContainerRef}
        style={{ position: 'relative', width: '100%', height: '80vh' }}
      />
    );
  }

  export default CandleStickChart;
