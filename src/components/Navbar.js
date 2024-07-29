  import React from 'react'
  import cryptoSvg from "../assets/svg/bitcoinSvg.svg";
  import { Link } from 'react-router-dom'
  const Navbar = () => {
    return (
      

  <nav class="bg-blue-500 border-blue-200 dark:bg-gray-900 text-white fixed w-full">
    <div class=" flex flex-wrap items-center justify-between mr-20 p-4 w-full">
      <Link href='#'  class="flex items-center space-x-3 h-10 w-10 ">
      <img src={cryptoSvg} class="h-8" alt="cypto Logo" className='cursor-pointer' />
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white cursor-pointer">Crypto</span>
      </Link>

      <div class="hidden w-full md:block md:w-auto" id="navbar-default">
        <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg  md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 ">
          <li>
            <Link to='/'  class="block py-2 px-3 mx-10 text-white bg-blue-700 rounded md:bg-transparent md:p-0 dark:text-white ">Home</Link>
          </li>
          <li>
            <Link to='/chart' class="block py-2 px-3 mx-10 text-white bg-blue-700 rounded md:bg-transparent md:p-0 dark:text-white " >Chart</Link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

    )
  }

  export default Navbar