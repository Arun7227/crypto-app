import React, { useState, useEffect } from 'react';
import lensSvg from "../assets/svg/lens.svg"
const SymbolsDropdown = ({selectedOption,setSelectedOption,data}) => {
  const [searchTerm, setSearchTerm] = useState(selectedOption);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option)
    setIsOpen(false);
  };
  useEffect(()=>{
    debugger
    data && data.symbols && setFilteredOptions(
      data.symbols.filter(value=>{
        return value.symbol.toLowerCase().startsWith(searchTerm.toLowerCase())
      }))
  },[searchTerm,data])

  return (
    <div className="inline-block w-[7rem] ml-2">
      <div className="relative">
        <div className='relative'>
         <img className='absolute top-[9px] left-[8px] h-[1.3rem] w-[1.3rem]'  src={lensSvg} alt='lens'/>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-8"
          value={searchTerm}
          onClick={() => setIsOpen(true)}
          onInput={(e) => {
                        setSearchTerm(e.target.value); 
                         setIsOpen(true);
                        }}
          placeholder="Search symbols..."
        />
        </div>
        {isOpen && data && (
          <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <ul className="max-h-60 overflow-y-auto cursor-pointer">
              { searchTerm.length>0 ?filteredOptions && filteredOptions.length>0?
              (filteredOptions.map((value, index) => (
                  <li
                    key={index}
                    className="py-2 px-3 hover:bg-blue-100"
                    onClick={() => handleSelect(value.symbol)}
                  >
                    {value.symbol}
                  </li>
                ))
              ) : (
                <li className="py-2 px-3 text-gray-500">No options found</li>
              )  : 

              data.symbols.length &&data.symbols.map((value,index)=>(
                 <li key={index} onClick={()=>handleSelect(value.symbol)} className="py-2 px-3 hover:bg-blue-100">{value.symbol}</li>
              ))
              
              }
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbolsDropdown;
