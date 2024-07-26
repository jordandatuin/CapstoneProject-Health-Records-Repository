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

import loginBg from '../../assets/loginbg.jpg';
import Logout from '../../Components/Logout';
import Context from '../../Context/Context'
import SearchEmployee from '../../Components/SearchEmployee'
import { EmployeePagination } from '../../Components/Pagination'

import 
{
  
  ModalAddEmployee, 
  ModalUpdateEmployee, 
  ModalViewEmployee
}  
from '../../Components/ModalWindow'

import Swal from 'sweetalert2'

function AdminMainPage() 
{
  let navigate = useNavigate();

  const {searchEmployee, accountInfo} = useContext(Context)

  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  const [employeeList, setEmployeeList] = useState([]);

  const [ isSortingName, setIsSortingName ] = useState(false)

  const [ currentPage, setCurrentPage ] = useState(0)
  const [ usersPerPage, setUsersPerPage] = useState(5)
  const numbersOfUsersSeen = currentPage * usersPerPage

  const [uploading, setUploading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState("")
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [nurseUsername, setNurseUsername] = useState('');
  const [nurseRegisterdNumber, setNurseRegisterdNumber] = useState('');
  const [nurseEmail, setNurseEmail] = useState('');
  const [nursePassword, setNursePassword] = useState('password123');

  const [idToUpdate, setIdToUpdate] = useState('');
  
  const [updateNurseAccount, setUpdateNurseAccount] = useState
  ({  
      displayName:'',
      firstName:'',
      lastName:'',
      middleName:'',
      nurseRegisterdNumber:'',
      nurseEmail:'',
      profilePhoto:'',
      accountUpdated:'',
  });

  const [viewNurseAccount, setViewNurseAccount] = useState
  ({  
      userId:'',
      displayName:'',
      firstName:'',
      lastName:'',
      middleName:'',
      nurseRegisterdNumber:'',
      nurseEmail:'',
      profilePhoto:'',
  });

  const fetchData = async () => 
  {
    try 
    {
      const q = query(collection(db, "tb-employees"), orderBy("accountCreated", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => 
      {
        const employees = snapshot.docs.map(e => ({...e.data(),id: e.id}));
        setEmployeeList(employees);
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
        const storageRef = ref(storage, `employeeProfilePictures/${imageName}`)
        const uploadTask = uploadBytesResumable(storageRef, profilePhoto)
        uploadTask.on('state_changed', 
        (snapshot) => 
        {
          switch (snapshot.state) 
          {
            case 'running':
              setProfilePhoto("")
              setUpdateNurseAccount({profilePhoto:''})
              setViewNurseAccount({profilePhoto:''})
              break;
          }
        }, (error) => 
        { console.error(error)},

          () => 
          {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => 
            {
              setProfilePhoto(downloadURL)
              setUpdateNurseAccount({profilePhoto: downloadURL})
              setViewNurseAccount({profilePhoto: downloadURL})
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

  const handleRegisterNurseAccount = (e) =>
  {
    e.preventDefault();
    var validRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(nurseEmail.match(validRegex))
    {
      try
      {
        createUserWithEmailAndPassword(auth, nurseEmail, nursePassword)
        .then((userCredential) => 
        {
          const user = userCredential.user;

          setDoc(doc(db, "tb-accounts", user.uid), 
          {
            userPrivilege:"employee",
            userEmail: nurseEmail,
            userId: user.uid,
            accountCreated: Timestamp.now(),
          })

          setDoc(doc(db, "tb-employees", user.uid), 
          {
            firstName: firstName,
            lastName: lastName,
            middleName:middleName,
            nurseRegisterdNumber:nurseRegisterdNumber,
            displayName: nurseUsername,
            userEmail: nurseEmail,
            userId: user.uid,
            profilePhoto: profilePhoto,
            accountCreated: Timestamp.now(),
          })

          sendPasswordResetEmail(auth, nurseEmail)
          .then(() => 
          {
            loginForm.resetFields();
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
                setNurseRegisterdNumber(''),
                setFirstName(''),
                setLastName(''),
                setMiddleName(''),
                setNurseEmail(''),
                setNurseUsername(''),
                setOpenRegisterModal(false)
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

  const handleCancelAddAccountPhoto = (profilePhoto) =>
  {
    const storageRef = ref(storage, profilePhoto);
    deleteObject(storageRef);
  };

  const handleDeleteFunction = (idToDelete) => 
  {
    Swal.fire
    ({
      allowOutsideClick: false,
      icon: 'warning',
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: '#860A35',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then( async (result) => 
      {
        if (result.value) 
        {
          try
          {
            const [employee] = employeeList.filter(employee => employee.userId === idToDelete);
            const storageRef = ref(storage, employee.profilePhoto);
            await deleteObject(storageRef);
            await deleteDoc(doc(db, "tb-accounts", idToDelete));
            await deleteDoc(doc(db, "tb-employees", idToDelete));

            Swal.fire
            ({
              icon: 'success',
              title: 'Deleted!',
              text: `${employee.firstName} ${employee.lastName}'s data has been deleted.`,
              showConfirmButton: false,
              timer: 1500,
            });
          }

          catch(error)
          {
            console.error('Error deleting post:', error);
            Swal.fire
            ({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred while deleting the post.',
              showConfirmButton: false,
              timer: 1500,
            });
          }
          
        }
    });
  };

  const handleResetPasswordFunction = (idToResetPassword) => 
  {
    Swal.fire
    ({
      allowOutsideClick: false,
      icon: 'warning',
      title: 'Send a password reset email?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: '#860A35',
      confirmButtonText: 'Yes, send it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => 
      {
        if (result.value) 
        {
          try
          {
            const [employee] = employeeList.filter(employee => employee.userId === idToResetPassword);
            sendPasswordResetEmail(auth, employee.userEmail)

            Swal.fire
            ({
              icon: 'success',
              title: `Password reset email has been sent to this email`,
              text: `${employee.userEmail}.`,
              showConfirmButton: false,
              timer: 3000,
            });
          }

          catch(error)
          {
            console.error('Error deleting post:', error);
            Swal.fire
            ({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred sending reset password email.',
              showConfirmButton: false,
              timer: 1500,
            });
          }
          
        }
    });
  };

  const handleUpdateModal = (idToUpdate) =>
  {
    const [employee] = employeeList.filter(employee => employee.userId === idToUpdate);

    setUpdateNurseAccount
    ({
        displayName: employee.displayName,
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName,
        nurseRegisterdNumber: employee.nurseRegisterdNumber,
        nurseEmail: employee.userEmail,
        accountUpdated:Timestamp.now(),
    });
  };
  
  const handleUpdateEmployee = (e) => 
  {
    e.preventDefault();

    if(profilePhoto === "")
      {
        const [employee] = employeeList.filter(employee => employee.userId === idToUpdate)

        setUpdateNurseAccount
        ({
            displayName: employee.displayName,
            firstName: employee.firstName,
            lastName: employee.lastName,
            middleName: employee.middleName,
            nurseRegisterdNumber: employee.nurseRegisterdNumber,
            nurseEmail: employee.userEmail,
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
                await updateDoc(doc(db, "tb-employees", idToUpdate),updateNurseAccount);

                Swal.fire
                ({
                  icon: 'success',
                  title: 'Updated!',
                  text: `Account has been updated.`,
                  showConfirmButton: false,
                  timer: 1500,
                });
                
                setProfilePhoto('');
                setUpdateNurseAccount
                ({
                  profilePhoto:'',
                  displayName:'',
                  firstName: '',
                  lastName: '',
                  middleName: '',
                  nurseRegisterdNumber: '',
                  nurseEmail: '',
                });
                setOpenUpdateModal(false);
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
        const [employee] = employeeList.filter(employee => employee.userId === idToUpdate)

        setUpdateNurseAccount
        ({
          displayName: employee.displayName,
          firstName: employee.firstName,
          lastName: employee.lastName,
          middleName: employee.middleName,
          nurseRegisterdNumber: employee.nurseRegisterdNumber,
          nurseEmail: employee.userEmail,
          profilePhoto: profilePhoto,
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
                const storageRef = ref(storage, employee.profilePhoto);
                await deleteObject(storageRef);
                await updateDoc(doc(db, "tb-employees", idToUpdate),updateNurseAccount);

                Swal.fire
                ({
                  icon: 'success',
                  title: 'Updated!',
                  text: `Account has been updated.`,
                  showConfirmButton: false,
                  timer: 1500,
                });

                setProfilePhoto('');
                setUpdateNurseAccount
                ({
                  profilePhoto:'',
                  displayName:'',
                  firstName: '',
                  lastName: '',
                  middleName: '',
                  nurseRegisterdNumber: '',
                  nurseEmail: '',
                });
                setOpenUpdateModal(false);
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

  const handleViewModal = (idToView) =>
  {
    const [employee] = employeeList.filter(employee => employee.userId === idToView);

    setViewNurseAccount
    ({  
        userId: employee.userId,
        displayName: employee.displayName,
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName,
        nurseRegisterdNumber: employee.nurseRegisterdNumber,
        nurseEmail: employee.userEmail,
        profilePhoto: employee.profilePhoto,
    });
  };

  const sortName = (employeeList) => 
  { 
    setIsSortingName(!isSortingName)
    if (isSortingName) 
    {
      employeeList.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } 
    
    else 
    {
      employeeList.sort((a, b) => b.lastName.localeCompare(a.lastName));
    }
  };

  useEffect(() => 
  {
    document.title = `Admin page`;

    onAuthStateChanged(auth, (user) => 
    {
      if (user) 
      {
        if (accountInfo.userPrivilege !== 'admin') 
        {
          if (accountInfo.userPrivilege === 'employee') 
          {
            navigate('/employeePage');
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
    fetchData();
    handleUploadProfilePhoto();
  }, [profilePhoto]);

  return (
    <>
    <div className="relative">
      <div className='absolute top-0 right-0 m-2'>
          <Logout />
      </div>

      <div className="hero min-h-screen" style={{backgroundImage: `url(${loginBg})`}}>
        <div className="hero-overlay bg-opacity-60"></div>
          <div className="hero-content flex-col">

            <div className="text-center">
              <h1 className='text-4xl md:text-7xl text-slate-50'>Hello Admin!</h1>
            </div>

              <button 
                className="btn btn-neutral hover:scale-110 duration-300" 
                onClick={() => setOpenRegisterModal(true)}
              >
                Create Nurse Account
              </button>
              
            
            <ModalAddEmployee open={openRegisterModal}>
            <button 
              onClick={() => 
              {
                if(profilePhoto === "")
                {
                  setProfilePhoto('');
                  setNurseRegisterdNumber('');
                  setFirstName('');
                  setLastName('');
                  setMiddleName('');
                  setNurseEmail('');
                  setNurseUsername('');
                  setOpenRegisterModal(false);
                }
                else
                {
                  handleCancelAddAccountPhoto(profilePhoto);
                  setProfilePhoto('');
                  setNurseRegisterdNumber('');
                  setFirstName('');
                  setLastName('');
                  setMiddleName('');
                  setNurseEmail('');
                  setNurseUsername('');
                  setOpenRegisterModal(false);
                }

                
              }}
              className='absolute font-black rounded-full w-8 h-8 bg-white
                         text-black right-[10px] top-[10px]
                        flex justify-center items-center hover:scale-110 duration-300'
            >
                X
            </button>
              <h3 className="font-bold text-sm md:text-lg text-center py-3">Register Nurse Account</h3>
              <form className='space-y-4' onSubmit={handleRegisterNurseAccount}>
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
                    />
                    <label htmlFor="profilePhoto"
                            className='text-sm bg-blue flex items-center justify-center gap-1 
                                          text-slate-50 font-semibold
                                        hover:translate-y-0.5 duration-200 cursor-pointer'
                            onClick={() => { setUploading(true) }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                      </svg>

                      Upload Photo
                    </label>
                    </div>
                  </div>
                
              <div className='container'>
                <label className="form-control w-full max-w-xs">
                    <input 
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Registered Identification Number"
                      type="text"
                      name="nurseRegisterdNumber"
                      id="nurseRegisterdNumber"
                      value={nurseRegisterdNumber}
                      onChange={(e) => setNurseRegisterdNumber(e.target.value)}
                    />                  
                  </label>
                </div>

              <div className='container'>
                <label className="form-control w-full max-w-xs">
                    <input
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Last Name"
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => 
                      {
                        setLastName(e.target.value);
                        setNurseUsername(firstName + " " + e.target.value);
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
                      name="firstName"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => 
                      {
                        setFirstName(e.target.value);
                        setNurseUsername(e.target.value + " " + lastName);
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
                      name="middleName"
                      id="middleName"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />           
                  </label>
                </div>

              <div className='container'>
                <label className="form-control w-full max-w-xs">
                    <input  
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Email"
                      type="text"
                      name="email"
                      id="email"
                      value={nurseEmail}
                      onChange={(e) => setNurseEmail(e.target.value)}
                    />           
                  </label>
                </div>

                <div className='container hidden'>
                  <label className="input input-bordered flex items-center gap-2 w-full max-w-xs">
                    <span className="flex-shrink-0 text-sm">Username</span>
                    <input  
                      className="text-sm min-w-24"
                      type="text"
                      name="text"
                      id="username"
                      value={firstName + " " + lastName}
                      readOnly
                    />
                  </label>
                </div>

                <div className='flex justify-center items-center'>
                  <button 
                    type="submit"
                    className="btn btn-neutral-500 btn-sm w-24  text-slate-50 hover:scale-110 duration-300"
                    disabled=
                    {
                      profilePhoto === ""         ||
                      nurseRegisterdNumber === "" ||
                      lastName === ""             ||
                      nurseEmail === ""           
                    }
                  >
                    Submit
                  </button>
                </div>
              </form>
            </ModalAddEmployee>

            <ModalUpdateEmployee open={openUpdateModal}>
            <button 
              onClick={() => 
              {
                if(profilePhoto === "")
                {
                  setProfilePhoto('');
                  setUpdateNurseAccount
                  ({
                    profilePhoto:'',
                    displayName:'',
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    nurseRegisterdNumber: '',
                    nurseEmail: '',
                  });
                  setOpenUpdateModal(false);
                }

                else
                {
                  handleCancelAddAccountPhoto(profilePhoto)
                  setProfilePhoto('');
                  setUpdateNurseAccount
                  ({
                    profilePhoto:'',
                    displayName:'',
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    nurseRegisterdNumber: '',
                    nurseEmail: '',
                  });
                  setOpenUpdateModal(false);
                }
              }}
              className='absolute font-black rounded-full w-8 h-8 bg-white
                         text-black right-[10px] top-[10px]
                        flex justify-center items-center hover:scale-110 duration-300'
            >
                X
            </button>
              <h3 className="font-bold text-sm md:text-lg text-center py-3">Update Nurse Account</h3>
              <form className='space-y-4' onSubmit={handleUpdateEmployee}>
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
                            onChange={e => {setUpdateNurseAccount.profilePhoto(e.target.files[0])}}
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

                      Upload New Photo
                    </label>
                    </div>
                  </div>
                
              <div className='container'>
                <label className="form-control w-full max-w-xs">
                    <input 
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Registered Identification Number"
                      type="text"
                      name="nurseRegisterdNumber"
                      id="nurseRegisterdNumber"
                      value={updateNurseAccount.nurseRegisterdNumber}
                      onChange={(e) => setUpdateNurseAccount ({...updateNurseAccount, nurseRegisterdNumber: e.target.value})}
                    />                  
                  </label>
                </div>

              <div className='container'>
                <label className="form-control w-full max-w-xs">
                    <input
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Last Name"
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={updateNurseAccount.lastName}
                      onChange={(e) => 
                      {
                        setUpdateNurseAccount ({...updateNurseAccount, lastName: e.target.value, displayName: updateNurseAccount.firstName + " " + e.target.value});
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
                      name="firstName"
                      id="firstName"
                      value={updateNurseAccount.firstName}
                      onChange={(e) => 
                      {
                        setUpdateNurseAccount ({...updateNurseAccount, firstName: e.target.value, displayName: e.target.value + " " + updateNurseAccount.lastName});
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
                      name="middleName"
                      id="middleName"
                      value={updateNurseAccount.middleName}
                      onChange={(e) => {setUpdateNurseAccount ({...updateNurseAccount, middleName: e.target.value});}}
                    />           
                  </label>
                </div>

              <div className='container'>
                <label className="form-control w-full max-w-xs">
                    <input  
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Email"
                      type="email"
                      name="email"
                      id="email"
                      value={updateNurseAccount.nurseEmail}
                      onChange={(e) => {setUpdateNurseAccount ({...updateNurseAccount, nurseEmail: e.target.value});}}
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
                      name="text"
                      id="username"
                      value={updateNurseAccount.firstName + " " + updateNurseAccount.lastName}
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
                      updateNurseAccount.nurseRegisterdNumber === "" ||
                      updateNurseAccount.lastName === ""             ||
                      updateNurseAccount.firstName === ""               
                    }
                  >
                    Update
                  </button>
                </div>
              </form>
            </ModalUpdateEmployee>

            <ModalViewEmployee open={openViewModal}>
            <button 
              onClick={() => 
              {
                setProfilePhoto('')
                setViewNurseAccount
                ({
                  userId:'',
                  displayName:'',
                  firstName:'',
                  lastName:'',
                  middleName:'',
                  nurseRegisterdNumber:'',
                  nurseEmail:'',
                  profilePhoto:'',
                });
                setOpenViewModal(false);
              }}
              className='absolute font-black rounded-full w-8 h-8 bg-white
                         text-black right-[10px] top-[10px]
                        flex justify-center items-center hover:scale-110 duration-300'
            >
                X
            </button>
              <h3 className="font-bold text-sm md:text-lg text-center py-3">View Nurse Account</h3>
              <div className='space-y-4 group'>
                {/* IMAGE PREVIEW */}
                <div className='flex justify-center py-2'>

                <img  
                  src={viewNurseAccount.profilePhoto} 
                  alt="Profile Photo" 
                  className='w-24 h-24 mask mask-squircle object-cover'
                />
                </div>

                <div className='container'>
                 <span className="label-text mx-1">Nurse Account ID</span>
                  <label className="form-control w-full max-w-xs">
                    <input 
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Nurse Account ID"
                      type="text"
                      name="nurseUserId"
                      id="nurseUserId"
                      readOnly
                      value={viewNurseAccount.userId}
                    />                  
                  </label>
                </div>
                
              <div className='container'>
                <span className="label-text mx-1">Registered Identification Number</span>
                <label className="form-control w-full max-w-xs">
                    <input 
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Registered Identification Number"
                      type="text"
                      name="nurseRegisterdNumber"
                      id="nurseRegisterdNumber"
                      readOnly
                      value={viewNurseAccount.nurseRegisterdNumber}
                    />                  
                  </label>
                </div>

              <div className='container'>
               <span className="label-text mx-1">Last Name</span>
                <label className="form-control w-full max-w-xs">
                    <input
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Last Name"
                      type="text"
                      name="lastName"
                      id="lastName"
                      readOnly
                      value={viewNurseAccount.lastName}
                    />           
                  </label>
              </div>

              <div className='container'>
                <span className="label-text mx-1">First Name</span>
                <label className="form-control w-full max-w-xs">
                    <input
                      className="input input-bordered w-full max-w-xs"
                      placeholder="First Name"
                      type="text"
                      name="firstName"
                      id="firstName"
                      readOnly
                      value={viewNurseAccount.firstName}                     
                    />                  
                  </label>
                </div>

              <div className='container'>
                <span className="label-text mx-1">Middle Name</span>
                <label className="form-control w-full max-w-xs">
                    <input  
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Middle Name"
                      type="text"
                      name="middleName"
                      id="middleName"
                      readOnly
                      value={viewNurseAccount.middleName}
                    />           
                  </label>
                </div>

              <div className='container'>
                <span className="label-text mx-1">Email</span>
                <label className="form-control w-full max-w-xs">
                    <input  
                      className="input input-bordered w-full max-w-xs"
                      placeholder="Email"
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={viewNurseAccount.nurseEmail}
                      readOnly
                    />           
                  </label>
                </div>
              </div>
            </ModalViewEmployee>

            <div className="container mx-auto max-w-80 md:max-w-screen-md lg:max-w-screen-lg overflow-x-auto text-slate-50 bg-neutral border-2 rounded-md">
              <table className="table-md md:table-lg">
                {/* head */}
                <thead>
                  <tr className='bg-neutral-950'>
                    <th><SearchEmployee /></th>
                    <th>Account ID</th>
                    <th>RN code</th>
                    <th onClick={() => {sortName(employeeList)}} 
                        className="px-3 py-3 cursor-pointer">
                      <span className="flex justify-center items-center gap-4">
                         Name
                      <div className={!isSortingName ? "duration-150" : "rotate-180 duration-150"}>↑</div>
                      </span>
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                {
                  employeeList.length > 0
                  ?
                    (
                      employeeList
                      .filter(employeeRecord => 
                      {
                        return (
                          searchEmployee === "" ? employeeRecord 
                                        : 
                                        (
                                          employeeRecord.firstName.toLowerCase().includes(searchEmployee) ||
                                          employeeRecord.lastName.toLowerCase().includes(searchEmployee)  ||
                                          employeeRecord.userEmail.toLowerCase().includes(searchEmployee) ||
                                          employeeRecord.userId.toLowerCase().includes(searchEmployee)    ||
                                          employeeRecord.nurseRegisterdNumber.includes(searchEmployee)
                                        )    
                        )
                      })
                      .slice(numbersOfUsersSeen, numbersOfUsersSeen + usersPerPage)
                      .map((employeeRecord) => 
                      (
                      <tr key={employeeRecord.id} className='text-center hover:bg-neutral-950/50 duration-300'>
                        <td>
                            <div className='flex justify-center items-center gap-3'>
                              <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                {
                                  employeeRecord.profilePhoto === ""
                                  ? <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 border-gray-300 p-1 text-gray-600 bg-gray-100"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>

                                  : <img src={employeeRecord.profilePhoto} alt="User Photo"/>
                                }
                              </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-ghost badge-sm">{employeeRecord.userId} </span>
                          </td>
                          <td>
                            <p className="truncate">{employeeRecord.nurseRegisterdNumber}</p>
                          </td>
                          <td>
                            <p className="truncate">{employeeRecord.firstName} {employeeRecord.lastName} </p>
                            <div className="text-sm opacity-50">{employeeRecord.userEmail}</div>
                          </td>
                          <td className="flex justify-center items-center cursor-pointer h-[65px]" >
                            <button 
                              className="btn btn-ghost btn-sm tooltip tooltip-top"
                              data-tip="View"
                              onClick={() => {setOpenViewModal(true); handleViewModal(employeeRecord.userId);}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            </button>

                            <button 
                              className="btn btn-ghost btn-sm tooltip tooltip-top"
                              data-tip="Update"
                              onClick={() => {handleUpdateModal(employeeRecord.userId); setOpenUpdateModal(true); setIdToUpdate(employeeRecord.userId);}}
                            >
                              
                              <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>

                            <button 
                              className="btn btn-ghost btn-sm lg:tooltip lg:tooltip-top"
                              data-tip="Reset Password"
                              onClick={() => handleResetPasswordFunction(employeeRecord.userId)}
                            >
                              <svg data-slot="icon" aria-hidden="true" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" className="size-6" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </button>

                            <button 
                              className="btn btn-ghost btn-sm lg:tooltip lg:tooltip-top"
                              data-tip="Delete"
                              onClick={() => handleDeleteFunction(employeeRecord.userId)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
                  <EmployeePagination dataList={employeeList} dataPerPage={usersPerPage} setCurrentPage={setCurrentPage} currentPage={{currentPage}}/>
              </div>
          </div>
      </div>
    </div>
    </>
  );
}

export default AdminMainPage
