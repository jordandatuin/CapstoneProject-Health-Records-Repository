import React, {useState, useContext} from "react"
import Context from "../Context/Context"

function SearchEmployeeMedicalRecords() 
{
    const [ searchFilterRecords, setSearchFilterRecord ] =  useState('')
  
    const {setSearchEmployeeMedicalRecord} = useContext(Context)
    
    return (
        <>
            <div className="flex justify-center items-center rounded-md gap-2">
                <div value={searchFilterRecords}>
                    <input  
                        className="input input-bordered w-32 max-w-xs input-sm"
                        type="search" 
                        name="search"
                        placeholder="Search"
                        value={searchFilterRecords}
                        onChange={e => 
                        {
                            setSearchFilterRecord(e.target.value.toLowerCase())
                            setSearchEmployeeMedicalRecord(e.target.value.toLowerCase())
                        }}
                    />
                </div>
            </div>
        </>
      )
}

export default SearchEmployeeMedicalRecords