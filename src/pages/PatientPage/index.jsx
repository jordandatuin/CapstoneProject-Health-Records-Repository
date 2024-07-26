import React, {useEffect, useState, useContext} from 'react'
import { useNavigate } from 'react-router-dom';

import 
{
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  deleteUser,
  onAuthStateChanged
} from "firebase/auth"

import 
{
  collection, 
  addDoc, 
  Timestamp, 
  setDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc
} from "firebase/firestore"

import db, {auth} from '../../Components/FirebaseConfig'
import {ref, uploadBytesResumable, getDownloadURL, deleteObject} from "firebase/storage"
import {storage} from '../../Components/FirebaseConfig'

import InputMask from "react-input-mask";

import Context from '../../Context/Context';
import { ModalViewMedicalRecord } from '../../Components/ModalWindow'
import SearchPatientMedicalRecords from '../../Components/SearchPatientMedicalRecords'
import { PatientMedicalRecordPagination } from '../../Components/Pagination'
import loginBg from '../../assets/loginbg.jpg';
import Logout from '../../Components/Logout'


import Swal from 'sweetalert2'

function PatientPage() 
{
  let navigate = useNavigate();
  
  const 
  {
    patientInfo, 
    searchPatientMedicalRecord, 
    accountInfo
  } = useContext(Context);


  const [medicalRecordList, setMedicalRecordList] = useState ([]);

  const [ currentPageRecord, setCurrentPageRecord ] = useState(0);
  const [ recordPerPage, setRecordPerPage] = useState(5);
  const numbersOfRecordsSeen = currentPageRecord * recordPerPage

  const [openViewMedicalRecordModal, setOpenViewMedicalRecordModal] = useState(false);

  const [viewPatientMedicalRecord, setViewPatientMedicalRecord] = useState
  ({
      patientProfilePhoto:'',
      patientDisplayName:'',
      userId:'',
      patientLastName:'',
      patientFirstName:'',
      patientMiddleName:'',
      patientGender:'Gender',
      patientPhoneNumber:'',
      patientBirthdate:'',
      patientAge:'',
      patientAddress:'',
      patientEmail:'',
      patientHeight:'',
      patientWeight:'',
      patientChiefComplaint:'',
      patientHpi:'',
      patientBp:'',
      patientCr:'',
      patientRr:'',
      patientTemp:'',
      medicalRecordCreated:''
  });

  const fetchPatientMedicalRecords = async () =>
  {
    try
    {
      const q = query(collection(db, 'tb-patientsMedicalRecords'), where('userId', '==', patientInfo.userId));
      const unsubscribe = onSnapshot(q, (snapshot) => 
      {
        const medicalRecords = snapshot.docs.map(e => ({...e.data(),id: e.id}));
        setMedicalRecordList(medicalRecords);
      });
      return () => unsubscribe();
    }

    catch (e) 
    {
      
      Swal.fire
      ({
        icon: 'error',
        title: 'Could not fetch data!',
        showConfirmButton: false,
        timer: 1500,
      });
      console.error('Error fetching data:', e);
    }
  };

  const formatDate = (timestamp) => 
  {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const handleViewPatientMedicalRecordModal = (id) =>
  {
      const [medical] = medicalRecordList.filter(medical => medical.userId === id);

      setViewPatientMedicalRecord
      ({  
        patientProfilePhoto:patientInfo.profilePhoto,
        patientDisplayName:patientInfo.patientDisplayName,
        userId:patientInfo.userId,
        patientLastName:patientInfo.patientLastName,
        patientFirstName:patientInfo.patientFirstName,
        patientMiddleName:patientInfo.patientMiddleName,
        patientGender:patientInfo.patientGender,
        patientPhoneNumber:patientInfo.patientPhoneNumber,
        patientBirthdate:patientInfo.patientBirthdate,
        patientAge:patientInfo.patientAge,
        patientAddress:patientInfo.patientAddress,
        patientEmail:patientInfo.userEmail,
        patientHeight:medical.patientHeight,
        patientWeight:medical.patientWeight,
        patientChiefComplaint:medical.patientChiefComplaint,
        patientHpi:medical.patientHpi,
        patientBp:medical.patientBp,
        patientCr:medical.patientCr,
        patientRr:medical.patientRr,
        patientTemp:medical.patientTemp,
        medicalRecordCreated:medical.medicalRecordCreated
    });
  };


  useEffect(() => 
  {
    document.title = `Patient page`;
    fetchPatientMedicalRecords();
    onAuthStateChanged(auth, (user) => 
    {
      if (user) 
      {
        if (accountInfo.userPrivilege !== 'patient') 
        {
          if (accountInfo.userPrivilege === 'admin') 
          {
            navigate('/adminPage');
          } 
          
          else if (accountInfo.userPrivilege === 'employee') 
          {
            navigate('/employeePage');
          } 
          
          else 
          {
            navigate("/");
          }
        }
      } 
      
      else 
      {
        navigate("/");
      }
    });
  }, [navigate, accountInfo]);

  return (
    <>
      <div className="relative">
        <div className='absolute top-0 right-0 m-2'>
            <Logout />
        </div>

        <div className='absolute top-0 let-0 m-2'>
            <div className='flex justify-center'>
              <img  src={patientInfo.profilePhoto} 
                alt="Profile Photo" 
                className='w-14 h-14 mask mask-squircle object-cover lg:w-24 lg:h-24'
              />
            </div>
        </div>

        <div className="hero min-h-screen" style={{backgroundImage: `url(${loginBg})`}}>
          <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content flex-col">
              <div className="text-center">
                <h1 className='text-4xl md:text-7xl text-slate-50'>Hello Patient {patientInfo.patientDisplayName}</h1>
              </div>

              <ModalViewMedicalRecord open={openViewMedicalRecordModal}>
                    <button 
                      onClick={() => 
                      {
                        setViewPatientMedicalRecord
                        ({  
                          patientProfilePhoto:'',
                          patientDisplayName:'',
                          userId:'',
                          patientLastName:'',
                          patientFirstName:'',
                          patientMiddleName:'',
                          patientGender:'Gender',
                          patientPhoneNumber:'',
                          patientBirthdate:'',
                          patientAge:'',
                          patientAddress:'',
                          patientEmail:'',
                          patientHeight:'',
                          patientWeight:'',
                          patientChiefComplaint:'',
                          patientHpi:'',
                          patientBp:'',
                          patientCr:'',
                          patientRr:'',
                          patientTemp:'',
                      });
                        setOpenViewMedicalRecordModal(false);
                      }}
                      className='absolute font-black rounded-full w-8 h-8 bg-white
                                text-black right-[10px] top-[10px]
                                flex justify-center items-center hover:scale-110 duration-300'
                    >
                        X
                    </button>
                      <h3 className="font-bold text-sm md:text-lg text-center py-3">View Patient Medical Record</h3>
                      <form className='space-y-4'>
                        <div>
                          {/* IMAGE PREVIEW */}
                          <div className='flex justify-center py-2'>
                            <img  src={viewPatientMedicalRecord.patientProfilePhoto} 
                                    alt="Profile Photo" 
                                    className='w-24 h-24 mask mask-squircle object-cover'
                            />
                          </div>
                        </div>  

                        <div className='container'>
                        <span className="label-text mx-1">Patient ID</span>
                          <label className="form-control w-full max-w-xs">
                              <input
                                className="input input-bordered w-full max-w-xs lg:text-sm"
                                placeholder="Patient ID"
                                type="text"
                                name="patientId"
                                id="patientId"
                                value={viewPatientMedicalRecord.userId}
                                readOnly
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Last Name</span>
                          <label className="form-control w-full max-w-xs">
                              <input
                                className="input input-bordered w-full max-w-xs"
                                placeholder="Last Name"
                                type="text"
                                name="patientLastName"
                                id="patientLastName"
                                value={viewPatientMedicalRecord.patientLastName}
                                readOnly
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient First Name</span>
                          <label className="form-control w-full max-w-xs">
                              <input
                                className="input input-bordered w-full max-w-xs"
                                placeholder="First Name"
                                type="text"
                                name="patientFirstName"
                                id="patientFirstName"
                                value={viewPatientMedicalRecord.patientFirstName}
                                readOnly
                              />                  
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Middle Name</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                placeholder="Middle Name"
                                type="text"
                                name="patientMiddleName"
                                id="patientMiddleName"
                                value={viewPatientMedicalRecord.patientMiddleName}
                                readOnly     
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Gender</span>
                          <label className="form-control w-full max-w-xs">
                            <input  
                              className="input input-bordered w-full max-w-xs"
                              placeholder="Gender"
                              type="text"
                              name="patientGender"
                              id="patientGender"
                              value={viewPatientMedicalRecord.patientGender}
                              readOnly     
                            />      
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Phone Number</span>
                          <label className="form-control w-full max-w-xs">
                            <InputMask 
                              mask="9999-999-9999" 
                              className='input input-bordered w-full max-w-xs'
                              placeholder="Phone Number"
                              name="patientPhoneNumber"
                              id="patientPhoneNumber"
                              value={viewPatientMedicalRecord.patientPhoneNumber}
                              readOnly
                            />
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Birthdate</span>
                          <label className="form-control w-full max-w-xs">
                            <InputMask 
                              mask="99/99/9999"
                              className='input input-bordered w-full max-w-xs'
                              placeholder="Birthdate"
                              maskPlaceholder="MM/DD/YYYY"
                              name="patientBirthDate"
                              id="patientBirthDate"
                              value={viewPatientMedicalRecord.patientBirthdate}
                              readOnly
                            />
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Age</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                placeholder="Age"
                                type="text"
                                name="patientAge"
                                id="patientAge"
                                value={viewPatientMedicalRecord.patientAge}
                                readOnly     
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Address</span>
                          <label className="form-control w-full max-w-xs">
                            <textarea
                              placeholder="Address"
                              name="patientAddress"
                              className="textarea textarea-bordered textarea-md w-full max-w-xs"
                              value={viewPatientMedicalRecord.patientAddress}
                              readOnly
                            >  
                            </textarea>                
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Email</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                placeholder="text"
                                type="patientEmail"
                                name="patientEmail"
                                id="email"
                                value={viewPatientMedicalRecord.patientEmail}
                                readOnly
                              />           
                            </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Height</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                type="text"
                                name="patientHeight"
                                id="patientHeight"
                                value={viewPatientMedicalRecord.patientHeight}
                                readOnly
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Weight</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                type="text"
                                name="patientWeight"
                                id="patientWeight"
                                value={viewPatientMedicalRecord.patientWeight}
                                readOnly
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Chief Complaint</span>
                          <label className="form-control w-full max-w-xs">
                            <textarea
                              type="patientChiefComplaint"
                              name="patientChiefComplaint"
                              className="textarea textarea-bordered textarea-md w-full max-w-xs"
                              value={viewPatientMedicalRecord.patientChiefComplaint}
                              readOnly
                            >  
                            </textarea>                
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">HPI</span>
                          <label className="form-control w-full max-w-xs">
                            <textarea
                              type="patientHpi"
                              name="patientHpi"
                              className="textarea textarea-bordered textarea-md w-full max-w-xs"
                              value={viewPatientMedicalRecord.patientHpi}
                              readOnly
                            >  
                            </textarea>                
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Vital Signs:</span>
                        </div>
                        
                        <div className='container'>
                          <span className="label-text mx-1">Patient BP</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                type="text"
                                name="patientBp"
                                id="patientBp"
                                value={viewPatientMedicalRecord.patientBp} 
                                readOnly 
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient CR</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                type="text"
                                name="patientCr"
                                id="patientCr"
                                value={viewPatientMedicalRecord.patientCr}
                                readOnly
                              />           
                          </label>
                        </div>
                        
                        <div className='container'>
                          <span className="label-text mx-1">Patient RR</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                type="text"
                                name="patientRr"
                                id="patientRr"
                                value={viewPatientMedicalRecord.patientRr}
                                readOnly
                              />           
                          </label>
                        </div>

                        <div className='container'>
                          <span className="label-text mx-1">Patient Temp</span>
                          <label className="form-control w-full max-w-xs">
                              <input  
                                className="input input-bordered w-full max-w-xs"
                                type="text"
                                name="patientTemp"
                                id="patientTemp"
                                value={viewPatientMedicalRecord.patientTemp}
                                readOnly
                              />           
                          </label>
                        </div>
                      
                        <div className='container hidden'>
                          <label className="input input-bordered flex items-center gap-2 w-full max-w-xs">
                            <span className="flex-shrink-0 text-sm">Username</span>
                            <input  
                              className="text-sm min-w-24"
                              type="text"
                              name="patientDisplayname"
                              id="patientDisplayname"
                              value={viewPatientMedicalRecord.patientFirstName + " " + viewPatientMedicalRecord.patientLastName}
                              readOnly
                            />
                          </label>
                      </div>
                    </form>
                  </ModalViewMedicalRecord>

              <div className="container mx-auto max-w-80 md:max-w-screen-md lg:max-w-screen-lg overflow-x-auto text-slate-50 bg-neutral border-2 rounded-md">
                <table className="table-md md:table-lg">
                  {/* head */}
                  <thead>
                    <tr className='bg-neutral-950'>
                      <th><SearchPatientMedicalRecords /></th>
                      <th>Patient ID</th>
                      <th className='truncate'>Medical Record ID</th>
                      <th className='truncate'>Medical Record Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                    medicalRecordList.length > 0
                    ?
                      (
                        medicalRecordList
                        .filter(medicalRecord => 
                        {
                          return (
                            searchPatientMedicalRecord === "" ? medicalRecord 
                                                  : 
                                                  (
                                                    medicalRecord.medicalRecordId.toLowerCase().includes(searchPatientMedicalRecord)  ||
                                                    formatDate(medicalRecord.medicalRecordCreated).toLowerCase().includes(searchPatientMedicalRecord)       
                                                    
                                                  )     
                          )
                        })
                        .slice(numbersOfRecordsSeen, numbersOfRecordsSeen + recordPerPage)
                        .map((medicalRecord) => 
                        (
                        <tr key={medicalRecord.id} className='text-center hover:bg-neutral-950/50 duration-300'>
                            <td>

                            </td>
                            <td>
                              <span className="badge badge-ghost badge-sm">{medicalRecord.userId} </span>
                            </td>
                            <td>
                              <p className="truncate">{medicalRecord.medicalRecordId} </p>
                            </td>
                            <td>
                            <p className="truncate">{formatDate(medicalRecord.medicalRecordCreated)}</p>

                            </td>
                            <td className="flex justify-center items-center cursor-pointer h-[65px]" >
                              
                              <button 
                                className="btn btn-ghost btn-sm tooltip tooltip-top"
                                data-tip="View"
                                onClick={() => {setOpenViewMedicalRecordModal(true); handleViewPatientMedicalRecordModal(medicalRecord.userId);}}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                  </svg>
                              </button>
                            </td>
                        </tr>
                      ))
                    )
                    :
                    ( 
                      <tr>
                        <td colSpan="5" className="px-2 py-3 italic text-xs md:text-sm text-center">No records found</td>
                      </tr>
                    )
                  }
                  </tbody>
                </table>
              </div>
                <div className='flex gap-5 w-full justify-end items-end'>
                  <p className='text-xs mb-2 -me-3 text-slate-50 line-clamp-1'>Rows per page:</p>
                  <select className="select select-sm w-20 max-w-xs">
                    <option onClick={() => setRecordPerPage(5)}>5</option>
                    <option onClick={() => setRecordPerPage(10)}>10</option>
                    <option onClick={() => setRecordPerPage(25)}>25</option>
                  </select>
                    <PatientMedicalRecordPagination dataList={medicalRecordList} dataPerPage={recordPerPage} setCurrentPageRecord={setCurrentPageRecord} currentPageRecord={{currentPageRecord}}/>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
export default PatientPage