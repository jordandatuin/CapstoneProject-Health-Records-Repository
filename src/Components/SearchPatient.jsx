import React, {useState, useContext} from "react"
import Context from "../Context/Context"

function SearchPatient() 
{
    const [ searchFilterPatient, setSearchFilterPatient ] =  useState('')
  
    const {setSearchPatient} = useContext(Context)
    
    return (
        <>
            <div className="flex justify-center items-center rounded-md gap-2">
                <div value={searchFilterPatient}>
                    <input  
                        className="input input-bordered w-32 max-w-xs input-sm"
                        type="search" 
                        name="search"
                        placeholder="Search"
                        value={searchFilterPatient}
                        onChange={e => 
                        {
                            setSearchFilterPatient(e.target.value.toLowerCase())
                            setSearchPatient(e.target.value.toLowerCase())
                        }}
                    />
                </div>
            </div>
        </>
      )
}

export default SearchPatient