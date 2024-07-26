import React, {useState, useContext} from "react"
import Context from "../Context/Context"

function SearchEmployee() 
{

    const [ searchFilterEmployee, setSearchFilterEmployee ] =  useState('')
  
    const {setSearchEmployee} = useContext(Context)


  
  return (
    <>
        <div className="flex justify-center items-center rounded-md gap-2">
            <div value={searchFilterEmployee}>
                <input  
                    className="input input-bordered w-32 max-w-xs input-sm"
                    type="search" 
                    name="search"
                    placeholder="Search"
                    value={searchFilterEmployee}
                    onChange={e => 
                    {
                        setSearchFilterEmployee(e.target.value.toLowerCase())
                        setSearchEmployee(e.target.value.toLowerCase())
                    }}
                />
            </div>
        </div>
    </>
  )
}

export default SearchEmployee