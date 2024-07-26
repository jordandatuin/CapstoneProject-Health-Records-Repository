import React, {useState} from 'react'
import Context from './Context'

function ContextProvider ({children}) 
{
  const storedNurseInfo = () => 
  {
    const nurse = localStorage.getItem("nurse") 
    return nurse ? JSON.parse(nurse) : []
  }

  const storedPatientInfo = () => 
  {
    const patient = localStorage.getItem("patient") 
    return patient ? JSON.parse(patient) : []
  }

  const storedAccountInfo = () => 
  {
    const account = localStorage.getItem("account") 
    return account ? JSON.parse(account) : []
  }
  
  const [ accountInfo, setAccountInfo ] = useState(storedAccountInfo)
  const [ nurseInfo, setNurseUserInfo ] = useState(storedNurseInfo)
  const [ patientInfo, setPatientUserInfo ] = useState(storedPatientInfo)
  const [ searchEmployee, setSearchEmployee ] = useState("")
  const [ searchPatient, setSearchPatient ] = useState("")
  const [ searchEmployeeMedicalRecord, setSearchEmployeeMedicalRecord ] = useState("")
  const [ searchPatientMedicalRecord, setSearchPatientMedicalRecord ] = useState("")

  return (
    <Context.Provider value={{
                              accountInfo, setAccountInfo,
                              nurseInfo, setNurseUserInfo,
                              patientInfo,setPatientUserInfo,
                              searchEmployee, setSearchEmployee,
                              searchPatient, setSearchPatient,
                              searchEmployeeMedicalRecord,setSearchEmployeeMedicalRecord,
                              searchPatientMedicalRecord,setSearchPatientMedicalRecord
                            }}>
      {children}
    </Context.Provider>
  )

}
export default ContextProvider