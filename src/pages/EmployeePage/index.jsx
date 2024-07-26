import React, { useState, useEffect, useContext } from 'react'
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
  updateDoc,
  getDocs
} from "firebase/firestore"

import db, {auth} from '../../Components/FirebaseConfig'
import {ref, uploadBytesResumable, getDownloadURL, deleteObject} from "firebase/storage"
import {storage} from '../../Components/FirebaseConfig'

import InputMask from "react-input-mask";

import Context from '../../Context/Context';
import Logout from '../../Components/Logout';
import { PatientPagination } from '../../Components/Pagination'
import { EmployeeMedicalRecordPagination } from '../../Components/Pagination'
import SearchPatient from '../../Components/SearchPatient'
import SearchEmployeeMedicalRecords from '../../Components/SearchEmployeeMedicalRecords'
import loginBg from '../../assets/loginbg.jpg';

import 
{ 
  ModalAddPatient, 
  ModalUpdatePatient, 
  ModalViewPatient, 
  ModalAddMedicalRecord, 
  ModalViewMedicalRecord 
} from '../../Components/ModalWindow';

import Swal from 'sweetalert2'

function EmployeePage() 
{
  let navigate = useNavigate();
  
  const 
  {
    nurseInfo, 
    searchPatient, 
    searchEmployeeMedicalRecord,
    accountInfo
  } = useContext(Context);


  const [openPatientRegisterModal, setOpenPatientRegisterModal] = useState(false);
  const [openPatientUpdateModal, setOpenPatientUpdateModal] = useState(false);
  const [openPatientViewModal, setOpenPatientViewModal] = useState(false);
  const [openAddMedicalRecordModal, setOpenAddMedicalRecordModal] = useState(false);
  const [openViewMedicalRecordModal, setOpenViewMedicalRecordModal] = useState(false);
  const [idToUpdate, setIdToUpdate] = useState('');

  const [patientList, setPatientList] = useState([]);
  const [medicalRecordList, setMedicalRecordList] = useState([]);

  const [ isSortingName, setIsSortingName ] = useState(false)

  const [ currentPage, setCurrentPage ] = useState(0);
  const [ usersPerPage, setUsersPerPage] = useState(5);
  const numbersOfUsersSeen = currentPage * usersPerPage

  const [ currentPageRecord, setCurrentPageRecord ] = useState(0);
  const [ recordPerPage, setRecordPerPage] = useState(5);
  const numbersOfRecordsSeen = currentPageRecord * recordPerPage

  const [uploading, setUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [patientPassword, setPatientPassword] = useState("patient123");


  const [registerPatientAccount, setRegisterPatientAccount] = useState
  ({  
      patientDisplayName:'',
      patientLastName:'',
      patientFirstName:'',
      patientMiddleName:'',
      patientGender:'Gender',
      patientPhoneNumber:'',
      patientBirthdate:'',
      patientAge:'',
      patientAddress:'',
      patientEmail:'',
      userId:'',
      accountCreated:'',
  });

  const [updatePatientAccount, setUpdatePatientAccount] = useState
  ({  
      profilePhoto:'',
      patientDisplayName:'',
      patientLastName:'',
      patientFirstName:'',
      patientMiddleName:'',
      patientGender:'Gender',
      patientPhoneNumber:'',
      patientBirthdate:'',
      patientAge:'',
      patientAddress:'',
      patientEmail:'',
      accountUpdated:'',
  });

  const [viewPatientAccount, setViewPatientAccount] = useState
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
  });

  const [addPatientMedicalRecord, setAddPatientMedicalRecord] = useState
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

  const fetchPatientData = async () => 
  {
    try 
    {
      const q = query(collection(db, "tb-patients"), orderBy("patientLastName", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => 
      {
        const patients = snapshot.docs.map(e => ({...e.data(),id: e.id}));
        setPatientList(patients);
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

  const fetchPatientMedicalData = async () => 
    {
      try 
      {
        const q = query(collection(db, "tb-patientsMedicalRecords"), orderBy("medicalRecordCreated", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => 
        {
          const newMedicalRecordList = snapshot.docs.map(e => ({...e.data(),id: e.id}));
          setMedicalRecordList(newMedicalRecordList);
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

  const handleUploadProfilePhoto = () =>  
  {
    try
    {
      if (profilePhoto !== "" && profilePhoto.name !== undefined) 
      {
        const imageName = new Date().getTime().toString() + profilePhoto.name
        const storageRef = ref(storage, `patientProfilePictures/${imageName}`)
        const uploadTask = uploadBytesResumable(storageRef, profilePhoto)
        uploadTask.on('state_changed', 
        (snapshot) => 
        {
          switch (snapshot.state) 
          {
            case 'running':
              setProfilePhoto("")
              setViewPatientAccount({profilePhoto:''})
              break;
          }
        }, 

        (error) => 
        { console.error(error)},

          () => 
          {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => 
            {
              setProfilePhoto(downloadURL)
              setUpdatePatientAccount({profilePhoto: downloadURL})
              setUploading(false)
            });
          }
        );
      }
    }
    catch(error) 
    {
      console.error(error)
    }
  };

  const handleCancelAddAccountPhoto = (profilePhoto) =>
  {
    const storageRef = ref(storage, profilePhoto);
    deleteObject(storageRef);
  }

  const handleRegisterPatientAccount = (e) =>
  { 
    e.preventDefault();

    var validRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   
    if(registerPatientAccount.patientEmail.match(validRegex))
    {
      try
      {
        createUserWithEmailAndPassword(auth, registerPatientAccount.patientEmail, patientPassword)
        .then((userCredential) => 
        {
          const user = userCredential.user;

          setDoc(doc(db, "tb-accounts", user.uid), 
          {
            userPrivilege:"patient",
            userEmail: registerPatientAccount.patientEmail,
            userId: user.uid,
            accountCreated: Timestamp.now(),
          })

          setDoc(doc(db, "tb-patients", user.uid), 
          {
            patientDisplayName: registerPatientAccount.patientDisplayName,
            patientLastName: registerPatientAccount.patientLastName,
            patientFirstName: registerPatientAccount.patientFirstName,
            patientMiddleName: registerPatientAccount.patientMiddleName,
            patientGender: registerPatientAccount.patientGender,
            patientPhoneNumber: registerPatientAccount.patientPhoneNumber,
            patientBirthdate: registerPatientAccount.patientBirthdate,
            patientAge: registerPatientAccount.patientAge,
            patientAddress: registerPatientAccount.patientAddress,
            userEmail: registerPatientAccount.patientEmail,
            userId: user.uid,
            profilePhoto: profilePhoto,
            accountCreated: Timestamp.now(),
          })

          sendPasswordResetEmail(auth, registerPatientAccount.patientEmail)
          .then(() => 
          {
            
          })
          .catch((error) => 
          {
            const errorCode = error.code;
            const errorMessage = error.message;
          });

            Swal.fire
            ({
              timer: 2000,
              showConfirmButton: false,
              willOpen: () => 
              {
                Swal.showLoading();
              },

              willClose: () => 
              {
                Swal.fire
                ({
                  icon: 'success',
                  title: 'Added!',
                  text: `Account successfully registered.`,
                  showConfirmButton: false,
                  timer: 2000,
                });
                
                setProfilePhoto(''),
                setRegisterPatientAccount
                ({
                  patientDisplayName:'',
                  patientLastName:'',
                  patientFirstName:'',
                  patientMiddleName:'',
                  patientGender:'Gender',
                  patientPhoneNumber:'',
                  patientBirthdate:'',
                  patientAge:'',
                  patientAddress:'',
                  patientEmail:'',
                  userId:'',
                  accountCreated:'',
                })
                setOpenPatientRegisterModal(false)
              },
            });
        })
        .catch((error) => 
        {
          console.error(error)
          Swal.fire
          ({
            allowOutsideClick: false,
            icon: 'error',
            title: 'Error!',
            text: 'Email already in use!',
            showConfirmButton: true,
            confirmButtonColor: '#860A35',
          });
        })
      }
      catch(error) 
      {
        console.error(error)
      };
    }

    else
    {
      Swal.fire
      ({
        allowOutsideClick: false,
        icon: 'error',
        title: 'Error!',
        text: 'Invalid email address!',
        showConfirmButton: true,
        confirmButtonColor: '#860A35',
      });
    }
  };

  const handleUpdateModal = (id) =>
  {
    const [patient] = patientList.filter(patient => patient.userId === id);

    setUpdatePatientAccount
    ({
      patientProfilePhoto:'',
      patientDisplayName:patient.patientDisplayName,
      patientLastName:patient.patientLastName,
      patientFirstName:patient.patientFirstName,
      patientMiddleName:patient.patientMiddleName,
      patientGender:patient.patientGender,
      patientPhoneNumber:patient.patientPhoneNumber,
      patientBirthdate:patient.patientBirthdate,
      patientAge:patient.patientAge,
      patientAddress:patient.patientAddress,
      patientEmail:patient.userEmail,
    });
  };

  const handleUpdatePatient = (e) => 
    {
      e.preventDefault();
  
      if(profilePhoto === "")
        {
          const [patient] = patientList.filter(patient => patient.userId === idToUpdate)
  
          setUpdatePatientAccount
          ({
            patientDisplayName:patient.patientDisplayName,
            patientLastName:patient.patientLastName,
            patientFirstName:patient.patientFirstName,
            patientMiddleName:patient.patientMiddleName,
            patientGender:patient.patientGender,
            patientPhoneNumber:patient.patientPhoneNumber,
            patientBirthdate:patient.patientBirthdate,
            patientAge:patient.patientAge,
            patientAddress:patient.patientAddress,
            accountUpdated:Timestamp.now(),
          });
  
          Swal.fire
          ({
            allowOutsideClick: false,
            icon: 'warning',
            title: 'Are you sure you want to update this nurse account?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonColor: '#860A35',
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel!',
          }).then( async (result) => 
            {
              if (result.value) 
              {
                try
                {
                  await updateDoc(doc(db, "tb-patients", idToUpdate),updatePatientAccount);
  
                  Swal.fire
                  ({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Account has been updated.`,
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  
                  setProfilePhoto('');
                  setUpdatePatientAccount
                  ({
                    patientProfilePhoto:'',
                    patientDisplayName:'',
                    patientLastName:'',
                    patientFirstName:'',
                    patientMiddleName:'',
                    patientGender:'',
                    patientPhoneNumber:'',
                    patientBirthdate:'',
                    patientAge:'',
                    patientAddress:'',
                  });
                  setOpenPatientUpdateModal(false);
                }
  
                catch(error)
                {
                  console.error('Error updating account:', error);
                  Swal.fire
                  ({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while updating the account.',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                }
                
              }
          });
        }
  
        else
        {
          const [patient] = patientList.filter(patient => patient.userId === idToUpdate)

          setUpdatePatientAccount
          ({
            patientProfilePhoto: profilePhoto,
            patientDisplayName:patient.patientDisplayName,
            patientLastName:patient.patientLastName,
            patientFirstName:patient.patientFirstName,
            patientMiddleName:patient.patientMiddleName,
            patientGender:patient.patientGender,
            patientPhoneNumber:patient.patientPhoneNumber,
            patientBirthdate:patient.patientBirthdate,
            patientAge:patient.patientAge,
            patientAddress:patient.patientAddress,
            accountUpdated:Timestamp.now(),
          });

          Swal.fire
          ({
            allowOutsideClick: false,
            icon: 'warning',
            title: 'Are you sure you want to update this nurse account?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonColor: '#860A35',
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel!',
          }).then( async (result) => 
            {
              if (result.value) 
              {
                try
                {
                  const storageRef = ref(storage, patient.profilePhoto);
                  await deleteObject(storageRef);
                  await updateDoc(doc(db, "tb-patients", idToUpdate),updatePatientAccount);
  
                  Swal.fire
                  ({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Account has been updated.`,
                    showConfirmButton: false,
                    timer: 1500,
                  });
  
                  setProfilePhoto('');
                  setUpdatePatientAccount
                  ({
                    patientProfilePhoto:'',
                    patientDisplayName:'',
                    patientLastName:'',
                    patientFirstName:'',
                    patientMiddleName:'',
                    patientGender:'',
                    patientPhoneNumber:'',
                    patientBirthdate:'',
                    patientAge:'',
                    patientAddress:'',
                  });
                  setOpenPatientUpdateModal(false);
                }
  
                catch(error)
                {
                  console.error('Error updating account:', error);
                  Swal.fire
                  ({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while updating the account.',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                }
              }
          });
        }
    };

    const handleAddMedicalRecordModal = (id) =>
    {
        const [patient] = patientList.filter(patient => patient.userId === id);

        setAddPatientMedicalRecord
        ({  
          patientProfilePhoto:patient.profilePhoto,
          patientDisplayName:patient.patientDisplayName,
          userId:patient.userId,
          patientLastName:patient.patientLastName,
          patientFirstName:patient.patientFirstName,
          patientMiddleName:patient.patientMiddleName,
          patientGender:patient.patientGender,
          patientPhoneNumber:patient.patientPhoneNumber,
          patientBirthdate:patient.patientBirthdate,
          patientAge:patient.patientAge,
          patientAddress:patient.patientAddress,
          patientEmail:patient.userEmail,
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
    };

    const handleAddMedicalRecordFunction = async (e) =>
    { 
      e.preventDefault();
        try
        {
          const docRef = await addDoc(collection(db, 'tb-patientsMedicalRecords'),
          {
            userId:addPatientMedicalRecord.userId,
            patientHeight:addPatientMedicalRecord.patientHeight,
            patientWeight:addPatientMedicalRecord.patientWeight,
            patientChiefComplaint:addPatientMedicalRecord.patientChiefComplaint,
            patientHpi:addPatientMedicalRecord.patientHpi,
            patientBp:addPatientMedicalRecord.patientBp,
            patientCr:addPatientMedicalRecord.patientCr,
            patientRr:addPatientMedicalRecord.patientRr,
            patientTemp:addPatientMedicalRecord.patientTemp,
            medicalRecordCreated:Timestamp.now()
          });

          await updateDoc(doc(db, 'tb-patientsMedicalRecords', docRef.id), 
          {
            medicalRecordId: encodeURIComponent(docRef.id),
          });

          Swal.fire
          ({
            timer: 2000,
            showConfirmButton: false,
            willOpen: () => 
            {
              Swal.showLoading();
            },
            willClose: () => 
            {
              Swal.fire
              ({
                icon: 'success',
                title: 'Added!',
                text: `Medical record successfully saved.`,
                showConfirmButton: false,
                timer: 2000,
              });
              
              setAddPatientMedicalRecord
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
              setOpenAddMedicalRecordModal(false)
            },
          });
        }
        catch(error) 
        {
          console.error(error)
        };
    };

    const handleViewPatientModal = (id) =>
    {
        const [patient] = patientList.filter(patient => patient.userId === id);
    
        setViewPatientAccount
        ({  
          patientProfilePhoto:patient.profilePhoto,
          patientDisplayName:patient.patientDisplayName,
          userId:patient.userId,
          patientLastName:patient.patientLastName,
          patientFirstName:patient.patientFirstName,
          patientMiddleName:patient.patientMiddleName,
          patientGender:patient.patientGender,
          patientPhoneNumber:patient.patientPhoneNumber,
          patientBirthdate:patient.patientBirthdate,
          patientAge:patient.patientAge,
          patientAddress:patient.patientAddress,
          patientEmail:patient.userEmail,
      });
    };

    const handleViewPatientMedicalRecordModal = (id) =>
    {
        const [patient] = patientList.filter(patient => patient.userId === id);
        const [medical] = medicalRecordList.filter(medical => medical.userId === id);

        setViewPatientMedicalRecord
        ({  
          patientProfilePhoto:patient.profilePhoto,
          patientDisplayName:patient.patientDisplayName,
          userId:patient.userId,
          patientLastName:patient.patientLastName,
          patientFirstName:patient.patientFirstName,
          patientMiddleName:patient.patientMiddleName,
          patientGender:patient.patientGender,
          patientPhoneNumber:patient.patientPhoneNumber,
          patientBirthdate:patient.patientBirthdate,
          patientAge:patient.patientAge,
          patientAddress:patient.patientAddress,
          patientEmail:patient.userEmail,
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

    const sortName = (patientList) => 
    { 
      setIsSortingName(!isSortingName)
      if (isSortingName) 
      {
        patientList.sort((b, a) => a.patientLastName.localeCompare(b.patientLastName));
      } 
      
      else 
      {
        patientList.sort((b, a) => b.patientLastName.localeCompare(a.patientLastName));
      }
    };

    const calculateAge = (birthdate) => 
    {
      if (!birthdate || birthdate.length !== 10) 
      {
        return '';
      }

      const [month, day, year] = birthdate.split('/').map(Number);
      if (!month || !day || !year) 
      {
        return '';
      }

      const birthDate = new Date(year, month - 1, day);

      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();

      const monthDifference = today.getMonth() - birthDate.getMonth();

      if 
      (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) 
      {
        age--;
      }
      return age;
    };
    
    const handleBirthdateChange = (e) => 
    {
      const birthdate = e.target.value;
      const age = calculateAge(birthdate);
      setRegisterPatientAccount
      ({...registerPatientAccount,
        patientBirthdate: birthdate,
        patientAge: age
      });

      setUpdatePatientAccount
      ({...updatePatientAccount,
        patientBirthdate: birthdate,
        patientAge: age
      });

    };

    const formatDate = (timestamp) => 
    {
      if (!timestamp) return '';
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    };
    

    useEffect(() => 
    {
      document.title = `Employee page`;
      
      onAuthStateChanged(auth, (user) => 
      {
        if (user) 
        {
          if (accountInfo.userPrivilege !== 'employee') 
          {
            if (accountInfo.userPrivilege === 'admin') 
            {
              navigate('/adminPage');
            } 
            
            else if (accountInfo.userPrivilege === 'patient') 
            {
              navigate('/patientPage');
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

    useEffect(() => 
    {
      fetchPatientMedicalData();
      fetchPatientData();
      handleUploadProfilePhoto();

    }, [profilePhoto]);

  return (
    <>
      <div className="relative">
        <div className='absolute top-0 right-0 m-2'>
            <Logout />
        </div>

        {/* IMAGE PREVIEW */}
        <div className='absolute top-0 let-0 m-2'>
          <div className='flex justify-center'>
            {
              nurseInfo.profilePhoto === ""
                ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                        className={
                          !uploading
                            ? "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                            : "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                        }>
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                : <img  src={nurseInfo.profilePhoto} 
                        alt="Profile Photo" 
                        className='w-14 h-14 mask mask-squircle object-cover lg:w-24 lg:h-24'
                  />
            }
          </div>
        </div>
        {/* IMAGE PREVIEW */}
        <div className="hero min-h-screen" style={{backgroundImage: `url(${loginBg})`}}>
          <div className="hero-overlay bg-opacity-60"></div>
            <div className="z-0 flex justify-center items-center gap-4 p-4 mt-20 max-w-full flex-col">
              <div className="text-center">
                <h1 className='text-2xl md:text-5xl lg:text-7xl text-slate-50'>Hello Nurse {nurseInfo.displayName}</h1>
              </div>

                <button 
                  className="btn btn-neutral hover:scale-110 duration-300" 
                  onClick={() => setOpenPatientRegisterModal(true)}
                >
                  Create Patient Account
                </button>

                <ModalAddPatient open={openPatientRegisterModal}>
                  <button 
                    onClick={() => 
                    {
                      if(profilePhoto === "")
                      {
                        
                        setProfilePhoto('');
                        setRegisterPatientAccount
                        ({
                          patientDisplayName:'',
                          patientLastName:'',
                          patientFirstName:'',
                          patientMiddleName:'',
                          patientGender:'Gender',
                          patientPhoneNumber:'',
                          patientBirthdate:'',
                          patientAge:'',
                          patientAddress:'',
                          patientEmail:'',
                          userId:'',
                          accountCreated:'',
                        })
                        setOpenPatientRegisterModal(false);

                      }
                      else
                      {
                        
                        handleCancelAddAccountPhoto(profilePhoto);
                        setProfilePhoto('');
                        setRegisterPatientAccount
                        ({
                          patientDisplayName:'',
                          patientLastName:'',
                          patientFirstName:'',
                          patientMiddleName:'',
                          patientGender:'Gender',
                          patientPhoneNumber:'',
                          patientBirthdate:'',
                          patientAge:'',
                          patientAddress:'',
                          patientEmail:'',
                          userId:'',
                          accountCreated:'',
                        })
                        setOpenPatientRegisterModal(false);

                      }
                    }}
                    className='absolute font-black rounded-full w-8 h-8 bg-white
                              text-black right-[10px] top-[10px]
                              flex justify-center items-center hover:scale-110 duration-300'
                  >
                      X
                  </button>
                    <h3 className="font-bold text-sm md:text-lg text-center py-3">Register Patient Account</h3>
                    <form className='space-y-4' onSubmit={handleRegisterPatientAccount}>
                      <div>
                        {/* IMAGE PREVIEW */}
                        <div className='flex justify-center py-2'>
                          {
                            profilePhoto === ""
                              ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                      className={
                                        !uploading
                                          ? "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                          : "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                      }>
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                              : <img  src={profilePhoto} 
                                      alt="Profile Photo" 
                                      className='w-24 h-24 mask mask-squircle object-cover'
                                />
                          }
                          
                        </div>
                        {/* IMAGE */}
                        <div className='flex justify-center py-2'>
                          <input  type="file"
                                  name='profilePhoto'
                                  id='profilePhoto'
                                  onChange={e => {setProfilePhoto(e.target.files[0])}}
                                  className='hidden'
                                  required
                          />
                          <label htmlFor="profilePhoto"
                                  className='text-sm bg-blue flex items-center justify-center gap-1 
                                                text-slate-50 font-semibold
                                              hover:translate-y-0.5 duration-200 cursor-pointer'
                                  onClick={() => { setUploading(true) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                            </svg>

                            Upload Patient Photo
                          </label>
                          </div>
                        </div>
                      
                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Last Name"
                            type="text"
                            name="patientLastName"
                            id="patientLastName"
                            value={registerPatientAccount.patientLastName}
                            onChange={(e) => 
                            {
                              setRegisterPatientAccount({...registerPatientAccount, 
                                                            patientLastName: e.target.value, 
                                                            patientDisplayName: registerPatientAccount.patientFirstName + " " + e.target.value
                                                        });
                            }}
                          />           
                      </label>
                    </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input
                            className="input input-bordered w-full max-w-xs"
                            placeholder="First Name"
                            type="text"
                            name="patientFirstName"
                            id="patientFirstName"
                            value={registerPatientAccount.patientFirstName}
                            onChange={(e) => 
                            {
                              setRegisterPatientAccount({...registerPatientAccount, 
                                                            patientFirstName: e.target.value, 
                                                            patientDisplayName: e.target.value + " " + registerPatientAccount.patientLastName
                                                        });
                            }}
                          />                  
                      </label>
                    </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input  
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Middle Name"
                            type="text"
                            name="patientMiddleName"
                            id="patientMiddleName"
                            value={registerPatientAccount.patientMiddleName}
                            onChange={(e) => 
                            {
                              setRegisterPatientAccount({...registerPatientAccount, 
                                                            patientMiddleName: e.target.value
                                                        });
                            }}      
                          />           
                      </label>
                    </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                        <select 
                          className="select select-bordered w-full max-w-xs"
                          value={registerPatientAccount.patientGender}
                          onChange={(e) => setRegisterPatientAccount({...registerPatientAccount, patientGender: e.target.value})}
                        >
                          <option disabled value="Gender">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </label>
                    </div>


                  <div className='container'>
                    <label className="form-control w-full max-w-xs">
                      <InputMask 
                        mask="9999-999-9999" 
                        className='input input-bordered w-full max-w-xs'
                        placeholder="Phone Number"
                        name="patientPhoneNumber"
                        id="patientPhoneNumber"
                        value={registerPatientAccount.patientPhoneNumber}
                        onChange={(e) => 
                        {
                          setRegisterPatientAccount({...registerPatientAccount, 
                                                        patientPhoneNumber: e.target.value
                                                    });
                        }}
                      />
                    </label>
                  </div>

                  <div className='container'>
                    <label className="form-control w-full max-w-xs">
                      <InputMask 
                        mask="99/99/9999"
                        className='input input-bordered w-full max-w-xs'
                        placeholder="Birthdate"
                        maskPlaceholder="MM/DD/YYYY"
                        name="patientBirthDate"
                        id="patientBirthDate"
                        value={registerPatientAccount.patientBirthdate}
                        onChange={handleBirthdateChange}
                      />
                    </label>
                  </div>
                  
                  <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input  
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Age"
                            type="text"
                            name="patientAge"
                            id="patientAge"
                            defaultValue={registerPatientAccount.patientAge}
                            readOnly    
                          />           
                      </label>
                    </div>


                  <div className='container'>
                    <label className="form-control w-full max-w-xs">
                    <textarea
                      placeholder="Address"
                      name="patientAddress"
                      className="textarea textarea-bordered textarea-md w-full max-w-xs"
                      value={registerPatientAccount.patientAddress}
                      onChange={(e) => 
                      {
                        setRegisterPatientAccount({...registerPatientAccount, 
                                                      patientAddress: e.target.value
                                                  });
                      }}
                    >  
                    </textarea>                
                    </label>
                  </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input  
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Email"
                            type="text"
                            name="patientEmail"
                            id="email"
                            value={registerPatientAccount.patientEmail}
                            onChange={(e) => 
                            {
                              setRegisterPatientAccount({...registerPatientAccount, 
                                                            patientEmail: e.target.value
                                                        });
                            }}
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
                            defaultValue={registerPatientAccount.patientFirstName + " " + registerPatientAccount.patientLastName}
                            readOnly
                          />
                        </label>
                    </div>

                      <div className='flex justify-center items-center'>
                        <button 
                          type="submit"
                          className="btn btn-neutral-500 btn-sm w-24 text-slate-50 hover:scale-110 duration-300"
                          disabled=
                          {
                             
                            profilePhoto === ''                                         ||
                            registerPatientAccount.patientLastName === ''               ||
                            registerPatientAccount.patientFirstName === ''              ||
                            registerPatientAccount.patientGender === 'Gender'           ||
                            registerPatientAccount.patientPhoneNumber === ''            ||
                            registerPatientAccount.patientBirthdate === ''              ||
                            registerPatientAccount.patientAge === ''                    ||
                            registerPatientAccount.patientBirthdate === 'MM/DD/YYYY'    ||
                            registerPatientAccount.patientAddress === ''                ||
                            registerPatientAccount.patientEmail === ''                            

                          }
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                </ModalAddPatient>

                <ModalUpdatePatient open={openPatientUpdateModal}>
                  <button 
                    onClick={() => 
                    {
                      if(profilePhoto === "")
                      {
                        
                        setProfilePhoto('');
                        setUpdatePatientAccount
                        ({
                          patientProfilePhoto:'',
                          patientDisplayName:'',
                          patientLastName:'',
                          patientFirstName:'',
                          patientMiddleName:'',
                          patientGender:'Gender',
                          patientPhoneNumber:'',
                          patientBirthdate:'',
                          patientAge:'',
                          patientAddress:'',
                          patientEmail:'',
                        })
                        setOpenPatientUpdateModal(false);

                      }
                      else
                      {
                        
                        handleCancelAddAccountPhoto(profilePhoto);
                        setProfilePhoto('');
                        setUpdatePatientAccount
                        ({
                          patientProfilePhoto:'',
                          patientDisplayName:'',
                          patientLastName:'',
                          patientFirstName:'',
                          patientMiddleName:'',
                          patientGender:'Gender',
                          patientPhoneNumber:'',
                          patientBirthdate:'',
                          patientAge:'',
                          patientAddress:'',
                          patientEmail:'',
                        })
                        setOpenPatientUpdateModal(false);

                      }
                    }}
                    className='absolute font-black rounded-full w-8 h-8 bg-white
                              text-black right-[10px] top-[10px]
                              flex justify-center items-center hover:scale-110 duration-300'
                  >
                      X
                  </button>
                    <h3 className="font-bold text-sm md:text-lg text-center py-3">Update Patient Account</h3>
                    <form className='space-y-4' onSubmit={handleUpdatePatient}>
                      <div>
                        {/* IMAGE PREVIEW */}
                        <div className='flex justify-center py-2'>
                          {
                            profilePhoto === ""
                              ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                      className={
                                        !uploading
                                          ? "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                          : "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                      }>
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                              : <img  src={profilePhoto} 
                                      alt="Profile Photo" 
                                      className='w-24 h-24 mask mask-squircle object-cover'
                                />
                          }
                          
                        </div>
                        {/* IMAGE */}
                        <div className='flex justify-center py-2'>
                          <input  type="file"
                                  name='profilePhoto'
                                  id='profilePhoto'
                                  onChange={e => {setUpdatePatientAccount.patientProfilePhoto(e.target.files[0])}}
                                  className='hidden'
                          />
                          <label htmlFor="profilePhoto"
                                  className='text-sm bg-blue flex items-center justify-center gap-1 
                                                text-slate-50 font-semibold
                                              hover:translate-y-0.5 duration-200 cursor-pointer'
                                  onClick={() => { setUploading(true) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                            </svg>

                            Upload New Patient Photo
                          </label>
                          </div>
                        </div>
                      
                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Last Name"
                            type="text"
                            name="patientLastName"
                            id="patientLastName"
                            value={updatePatientAccount.patientLastName}
                            onChange={(e) => 
                            {
                              setUpdatePatientAccount({...updatePatientAccount, 
                                                            patientLastName: e.target.value, 
                                                            patientDisplayName: updatePatientAccount.patientFirstName + " " + e.target.value
                                                        });
                            }}
                          />           
                      </label>
                    </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input
                            className="input input-bordered w-full max-w-xs"
                            placeholder="First Name"
                            type="text"
                            name="patientFirstName"
                            id="patientFirstName"
                            value={updatePatientAccount.patientFirstName}
                            onChange={(e) => 
                            {
                              setUpdatePatientAccount({...updatePatientAccount, 
                                                            patientFirstName: e.target.value, 
                                                            patientDisplayName: e.target.value + " " + updatePatientAccount.patientLastName
                                                        });
                            }}
                          />                  
                      </label>
                    </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input  
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Middle Name"
                            type="text"
                            name="patientMiddleName"
                            id="patientMiddleName"
                            value={updatePatientAccount.patientMiddleName}
                            onChange={(e) => 
                            {
                              setUpdatePatientAccount({...updatePatientAccount, 
                                                            patientMiddleName: e.target.value
                                                        });
                            }}      
                          />           
                      </label>
                    </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                        <select 
                          className="select select-bordered w-full max-w-xs"
                          value={updatePatientAccount.patientGender}
                          onChange={(e) => setUpdatePatientAccount({...updatePatientAccount, patientGender: e.target.value})}
                        >
                          <option disabled value="Gender">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </label>
                    </div>


                  <div className='container'>
                    <label className="form-control w-full max-w-xs">
                      <InputMask 
                        mask="9999-999-9999" 
                        className='input input-bordered w-full max-w-xs'
                        placeholder="Phone Number"
                        name="patientPhoneNumber"
                        id="patientPhoneNumber"
                        value={updatePatientAccount.patientPhoneNumber}
                        onChange={(e) => 
                        {
                          setUpdatePatientAccount({...updatePatientAccount, 
                                                        patientPhoneNumber: e.target.value
                                                    });
                        }}
                      />
                    </label>
                  </div>

                  <div className='container'>
                    <label className="form-control w-full max-w-xs">
                      <InputMask 
                        mask="99/99/9999"
                        className='input input-bordered w-full max-w-xs'
                        placeholder="Birthdate"
                        maskPlaceholder="MM/DD/YYYY"
                        name="patientBirthDate"
                        id="patientBirthDate"
                        value={updatePatientAccount.patientBirthdate}
                        onChange={handleBirthdateChange}
                      />
                    </label>
                  </div>
                  
                  <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input  
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Age"
                            type="text"
                            name="patientAge"
                            id="patientAge"
                            value={updatePatientAccount.patientAge}
                            readOnly
                          />           
                      </label>
                  </div>
                  
                  <div className='container'>
                    <label className="form-control w-full max-w-xs">
                    <textarea
                      placeholder="Address"
                      name="patientAddress"
                      className="textarea textarea-bordered textarea-md w-full max-w-xs"
                      value={updatePatientAccount.patientAddress}
                      onChange={(e) => 
                      {
                        setUpdatePatientAccount({...updatePatientAccount, 
                                                      patientAddress: e.target.value
                                                  });
                      }}
                    >  
                    </textarea>                
                    </label>
                  </div>

                    <div className='container'>
                      <label className="form-control w-full max-w-xs">
                          <input  
                            className="input input-bordered w-full max-w-xs"
                            placeholder="Email"
                            type="text"
                            name="patientEmail"
                            id="email"
                            value={updatePatientAccount.patientEmail}
                            onChange={(e) => 
                            {
                              setUpdatePatientAccount({...updatePatientAccount, 
                                                            patientEmail: e.target.value
                                                        });
                            }}
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
                            value={updatePatientAccount.patientFirstName + " " + updatePatientAccount.patientLastName}
                            readOnly
                          />
                        </label>
                    </div>

                      <div className='flex justify-center items-center'>
                        <button 
                          type="submit"
                          className="btn btn-neutral-500 btn-sm w-24 text-slate-50 hover:scale-110 duration-300"
                          disabled=
                          {
                             
                            updatePatientAccount.patientLastName === ''                 ||
                            updatePatientAccount.patientFirstName === ''                ||
                            updatePatientAccount.patientGender === 'Gender'             ||
                            updatePatientAccount.patientPhoneNumber === ''              ||
                            updatePatientAccount.patientPhoneNumber === '____-___-____' ||
                            updatePatientAccount.patientBirthdate === ''                ||
                            updatePatientAccount.patientAge === ''                      ||
                            updatePatientAccount.patientBirthdate === 'MM/DD/YYYY'      ||
                            updatePatientAccount.patientAddress === ''  
                                                       

                          }
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                </ModalUpdatePatient>

                <ModalViewPatient open={openPatientViewModal}>
                  <button 
                    onClick={() => 
                    {
    
                      setProfilePhoto('');
                      setViewPatientAccount
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
                    });
                      setOpenPatientViewModal(false);
                    }}
                    className='absolute font-black rounded-full w-8 h-8 bg-white
                              text-black right-[10px] top-[10px]
                              flex justify-center items-center hover:scale-110 duration-300'
                  >
                      X
                  </button>
                    <h3 className="font-bold text-sm md:text-lg text-center py-3">View Patient Account</h3>
                    <form className='space-y-4' onSubmit={handleRegisterPatientAccount}>
                      <div>
                        {/* IMAGE PREVIEW */}
                        <div className='flex justify-center py-2'>
                          {
                            viewPatientAccount.patientProfilePhoto === ""
                              ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                      className={
                                        !uploading
                                          ? "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                          : "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                      }>
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                              : <img  src={viewPatientAccount.patientProfilePhoto} 
                                      alt="Profile Photo" 
                                      className='w-24 h-24 mask mask-squircle object-cover'
                                />
                          }
                          
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
                              value={viewPatientAccount.userId}
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
                              value={viewPatientAccount.patientLastName}
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
                              value={viewPatientAccount.patientFirstName}
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
                              value={viewPatientAccount.patientMiddleName}
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
                            value={viewPatientAccount.patientGender}
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
                            value={viewPatientAccount.patientPhoneNumber}
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
                            value={viewPatientAccount.patientBirthdate}
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
                              value={viewPatientAccount.patientAge}
                              readOnly     
                            />           
                        </label>
                      </div>

                      <div className='container'>
                        <span className="label-text mx-1">Patient Address</span>
                        <label className="form-control w-full max-w-xs">
                          <textarea
                            placeholder="Address"
                            type="patientAddress"
                            name="patientAddress"
                            className="textarea textarea-bordered textarea-md w-full max-w-xs"
                            value={viewPatientAccount.patientAddress}
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
                              placeholder="Email"
                              type="patientEmail"
                              name="patientEmail"
                              id="email"
                              value={viewPatientAccount.patientEmail}
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
                            value={viewPatientAccount.patientFirstName + " " + viewPatientAccount.patientLastName}
                            readOnly
                          />
                        </label>
                    </div>
                  </form>
                </ModalViewPatient>

                <ModalAddMedicalRecord open={openAddMedicalRecordModal}>
                  <button 
                    onClick={() => 
                    {
    
                      setProfilePhoto('');
                      setAddPatientMedicalRecord
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
                      setOpenAddMedicalRecordModal(false);
                    }}
                    className='absolute font-black rounded-full w-8 h-8 bg-white
                              text-black right-[10px] top-[10px]
                              flex justify-center items-center hover:scale-110 duration-300'
                  >
                      X
                  </button>
                    <h3 className="font-bold text-sm md:text-lg text-center py-3">Add Medical Record</h3>
                    <form className='space-y-4' onSubmit={handleAddMedicalRecordFunction}>
                      <div>
                        {/* IMAGE PREVIEW */}
                        <div className='flex justify-center py-2'>
                          {
                            addPatientMedicalRecord.patientProfilePhoto === ""
                              ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                      className={
                                        !uploading
                                          ? "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                          : "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                      }>
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                              : <img  src={addPatientMedicalRecord.patientProfilePhoto} 
                                      alt="Profile Photo" 
                                      className='w-24 h-24 mask mask-squircle object-cover'
                                />
                          }
                          
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
                              value={addPatientMedicalRecord.userId}
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
                              value={addPatientMedicalRecord.patientLastName}
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
                              value={addPatientMedicalRecord.patientFirstName}
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
                              value={addPatientMedicalRecord.patientMiddleName}
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
                            value={addPatientMedicalRecord.patientGender}
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
                            value={addPatientMedicalRecord.patientPhoneNumber}
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
                            value={addPatientMedicalRecord.patientBirthdate}
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
                              value={addPatientMedicalRecord.patientAge}
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
                            value={addPatientMedicalRecord.patientAddress}
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
                              value={addPatientMedicalRecord.patientEmail}
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
                              value={addPatientMedicalRecord.patientHeight}
                              onChange={(e) => 
                              {
                                setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                              patientHeight: e.target.value
                                                          });
                              }} 
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
                              value={addPatientMedicalRecord.patientWeight}
                              onChange={(e) => 
                              {
                                setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                              patientWeight: e.target.value
                                                          });
                              }} 
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
                            value={addPatientMedicalRecord.patientChiefComplaint}
                            onChange={(e) => 
                            {
                              setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                            patientChiefComplaint: e.target.value
                                                        });
                            }}
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
                            value={addPatientMedicalRecord.patientHpi}
                            onChange={(e) => 
                            {
                              setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                            patientHpi: e.target.value
                                                        });
                            }}
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
                              value={addPatientMedicalRecord.patientBp}
                              onChange={(e) => 
                              {
                                setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                              patientBp: e.target.value
                                                          });
                              }}    
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
                              value={addPatientMedicalRecord.patientCr}
                              onChange={(e) => 
                              {
                                setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                              patientCr: e.target.value
                                                          });
                              }}     
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
                              value={addPatientMedicalRecord.patientRr}
                              onChange={(e) => 
                              {
                                setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                              patientRr: e.target.value
                                                          });
                              }} 
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
                              value={addPatientMedicalRecord.patientTemp}
                              onChange={(e) => 
                              {
                                setAddPatientMedicalRecord({...addPatientMedicalRecord, 
                                                              patientTemp: e.target.value
                                                          });
                              }}
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
                            value={addPatientMedicalRecord.patientFirstName + " " + addPatientMedicalRecord.patientLastName}
                            readOnly
                          />
                        </label>
                    </div>

                    <div className='flex justify-center items-center'>
                        <button 
                          type="submit"
                          className="btn btn-neutral-500 btn-sm w-24 text-slate-50 hover:scale-110 duration-300"
                          disabled=
                          {
                            addPatientMedicalRecord.patientHeight === ''         ||
                            addPatientMedicalRecord.patientWeight === ''         ||
                            addPatientMedicalRecord.patientChiefComplaint === '' ||
                            addPatientMedicalRecord.patientHpi === ''            ||
                            addPatientMedicalRecord.patientBp === ''             ||
                            addPatientMedicalRecord.patientCr === ''             ||
                            addPatientMedicalRecord.patientRr === ''             ||
                            addPatientMedicalRecord.patientTemp === '' 
                          }
                        >
                          Save
                        </button>
                    </div>
                  </form>
                </ModalAddMedicalRecord>

                <ModalViewMedicalRecord open={openViewMedicalRecordModal}>
                  <button 
                    onClick={() => 
                    {
    
                      setProfilePhoto('');
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
                          {
                            viewPatientMedicalRecord.patientProfilePhoto === ""
                              ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                      className={
                                        !uploading
                                          ? "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                          : "w-20 h-20 border-2 border-gray-300 mask mask-squircle p-2 text-gray-600 bg-gray-100 animate-pulse"
                                      }>
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                              : <img  src={viewPatientMedicalRecord.patientProfilePhoto} 
                                      alt="Profile Photo" 
                                      className='w-24 h-24 mask mask-squircle object-cover'
                                />
                          }
                          
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
                        <th><SearchPatient/></th>
                        <th>Patient ID</th>
                        <th onClick={() => {sortName(patientList)}} 
                            className="px-3 py-3 cursor-pointer">
                          <span className="flex justify-center items-center gap-4">
                            Patient Name
                          <div className={!isSortingName ? "duration-150" : "rotate-180 duration-150"}>↑</div>
                          </span>
                        </th>
                        <th className='truncate'>Patient Phone number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                    {
                      patientList.length > 0
                      ?
                        (
                          patientList
                          .filter(patientRecord => 
                          {
                            return (
                              searchPatient === "" ? patientRecord 
                                                   : 
                                                   (
                                                     patientRecord.patientFirstName.toLowerCase().includes(searchPatient) ||
                                                     patientRecord.patientLastName.toLowerCase().includes(searchPatient)  ||
                                                     patientRecord.userEmail.toLowerCase().includes(searchPatient)        ||
                                                     patientRecord.userId.toLowerCase().includes(searchPatient)           ||
                                                     patientRecord.patientPhoneNumber.includes(searchPatient)
                                                   )     
                            )
                          })
                          .slice(numbersOfUsersSeen, numbersOfUsersSeen + usersPerPage)
                          .map((patientRecord) => 
                          (
                          <tr key={patientRecord.id} className='text-center hover:bg-neutral-950/50 duration-300'>
                            <td>
                                <div className='flex justify-center items-center gap-3'>
                                  <div className="avatar">
                                  <div className="mask mask-squircle w-12 h-12">
                                    {
                                      patientRecord.profilePhoto === ""
                                      ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className= "w-12 h-12 border-gray-300 p-1 text-gray-600 bg-gray-100"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>

                                      : <img src={patientRecord.profilePhoto} alt="User Photo"/>
                                    }
                                  </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="badge badge-ghost badge-sm">{patientRecord.userId} </span>
                              </td>
                              <td>
                                <p className="truncate">{patientRecord.patientFirstName} {patientRecord.patientLastName} </p>
                                <div className="text-sm opacity-50">{patientRecord.userEmail}</div>
                              </td>
                              <td>
                                <p className="truncate">{patientRecord.patientPhoneNumber}</p>
                              </td>
                              <td className="flex justify-center items-center cursor-pointer h-[65px]" >
                                
                                <button 
                                  className="btn btn-ghost btn-sm tooltip tooltip-top"
                                  data-tip="View"
                                  onClick={() => {setOpenPatientViewModal(true); handleViewPatientModal(patientRecord.userId);}}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </button>

                                <button 
                                  className="btn btn-ghost btn-sm tooltip tooltip-top"
                                  data-tip="Add Medical Record"
                                  onClick={() => {setOpenAddMedicalRecordModal(true); handleAddMedicalRecordModal(patientRecord.userId);}}
                                >
                                    <svg data-slot="icon" aria-hidden="true" fill="red" strokeWidth="1.5" stroke="currentColor" className="size-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                </button>

                                <button 
                                  className="btn btn-ghost btn-sm tooltip tooltip-top"
                                  data-tip="Update"
                                  onClick={() => {handleUpdateModal(patientRecord.userId); setOpenPatientUpdateModal(true); setIdToUpdate(patientRecord.userId);}}
                                >
                                  
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
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
                      <option onClick={() => setUsersPerPage(5)}>5</option>
                      <option onClick={() => setUsersPerPage(10)}>10</option>
                      <option onClick={() => setUsersPerPage(25)}>25</option>
                    </select>
                      <PatientPagination dataList={patientList} dataPerPage={usersPerPage} setCurrentPage={setCurrentPage} currentPage={{currentPage}}/>
                </div>

              <div className="container mx-auto max-w-80 md:max-w-screen-md lg:max-w-screen-lg overflow-x-auto text-slate-50 bg-neutral border-2 rounded-md">
                  <table className="table-md md:table-lg">
                    {/* head */}
                    <thead>
                      <tr className='bg-neutral-950'>
                        <th><SearchEmployeeMedicalRecords/></th>
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
                              searchEmployeeMedicalRecord === "" ? medicalRecord 
                                                   : 
                                                   (
                                                     medicalRecord.userId.toLowerCase().includes(searchEmployeeMedicalRecord)           ||
                                                     medicalRecord.medicalRecordId.toLowerCase().includes(searchEmployeeMedicalRecord)  ||
                                                     formatDate(medicalRecord.medicalRecordCreated).toLowerCase().includes(searchEmployeeMedicalRecord)       
                                                     
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
                    <option onClick={() => setRecordPerPage(1)}>1</option>
                      <option onClick={() => setRecordPerPage(5)}>5</option>
                      <option onClick={() => setRecordPerPage(10)}>10</option>
                      <option onClick={() => setRecordPerPage(25)}>25</option>
                    </select>
                      <EmployeeMedicalRecordPagination dataList={medicalRecordList} dataPerPage={recordPerPage} setCurrentPage={setCurrentPageRecord} currentPage={{currentPageRecord}}/>
                </div>
            </div>
          </div>
        </div>
    </>
  )
}
export default EmployeePage