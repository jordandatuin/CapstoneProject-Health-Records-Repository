// Import necessary dependencies and components
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./LoginPage"

import { AdminPage, EmployeePage, PatientPage } from "./pages"

import PageNotFound from "./Components/PageNotFound";

function App() 
{
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Route for the "login" path, rendering the LoginAndCreateAccount component */}   
          <Route path="/" element={<LoginPage />} />
          <Route path="adminPage" element={<AdminPage />} />
          <Route path="employeePage" element={<EmployeePage />} />
          <Route path="patientPage" element={<PatientPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App