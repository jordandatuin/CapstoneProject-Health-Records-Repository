// Import necessary hooks and components from React
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom';

// Import various functions from Firebase SDKs
import 
{ 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "firebase/auth";

import 
{ 
  addDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';

import db, {auth} from '../Components/FirebaseConfig';

import Context from '../Context/Context';

import loginBg from '../assets/loginbg.jpg';

import Swal from 'sweetalert2'


function LoginPage() 
{

  const navigate = useNavigate();

  const 
  {
    setNurseUserInfo, 
    setPatientUserInfo, 
    setAccountInfo, 
    accountInfo
  } = useContext(Context)


  const [accountList, setAccountList] = useState([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const handleShowPassword = () => setIsPasswordVisible((show) => !show);

  const [loginAccount, setLoginAccount] = useState
  ({
    userEmail: '',
    userPassword: '',
  });

  const handleLogin = async (e) => 
  {
    e.preventDefault();
    if(loginAccount.userEmail === "" || loginAccount.userPassword === "")
      {
        Swal.fire
        ({
          icon: 'error',
          title: 'Error!',
          text: 'Please input your Email and Password',
          showConfirmButton: true,
          allowOutsideClick:false,
          confirmButtonColor: '#860A35',
          confirmButtonText: 'Try again',
        });
      }
      else
      {
        signInWithEmailAndPassword(auth, loginAccount.userEmail, loginAccount.userPassword)
        .then(async (userCredential) => 
        {
          const user = userCredential.user;
          fetchEmployeeInfo(user);
          fetchPatientInfo(user);
          fetchAccountInfo(user);

          const q = query(collection(db, 'tb-accounts'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) 
          {
            const userDoc = querySnapshot.docs[0].data();
            const accountPrivilege = userDoc.userPrivilege;

            const Toast = Swal.mixin
            ({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => 
              {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            Toast.fire
            ({
              icon: "success",
              title: "Signed in successfully"
            });

            setLoginAccount
            ({
              userEmail: '',
              userPassword: '',
            });

            if (accountPrivilege === 'admin') 
            {
              navigate('/adminPage');

            } 
            
            else if (accountPrivilege === 'employee') 
            {
              navigate('/employeePage');
            } 
            
            else if (accountPrivilege === 'patient') 
            {
              navigate('/patientPage');
            }
            
        }
        
        else 
        {
          Swal.fire
          ({
            icon: 'error',
            title: 'Error!',
            text: 'User document not found in Firestore.',
            showConfirmButton: true,
            allowOutsideClick:false,
            confirmButtonColor: '#860A35',
            confirmButtonText: 'Try again',
          });

        }
      })
      .catch((error) => 
      {
        console.error('Login error:', error);
        Swal.fire
        ({
          icon: 'error',
          title: 'Error!',
          text: 'Invalid Credential',
          showConfirmButton: true,
          allowOutsideClick:false,
          confirmButtonColor: '#860A35',
          confirmButtonText: 'Try again',
        });

        setLoginAccount
          ({
            userEmail: '',
            userPassword: '',
          });
      });
      }
  };

  const fetchEmployeeInfo = async(user) => 
  {

    const q = query(collection(db, "tb-employees"));
    const unsubscribe = onSnapshot(q, (snapshot) => 
    {
     const nurse = snapshot.docs.map(e => ({...e.data(),id: e.id}));
     nurse.map(e => 
      {
        if (e.userId === user.uid )  
        {
          localStorage.setItem("nurse", JSON.stringify(e))
          setNurseUserInfo(e)
        }
      });
    });

    return () => unsubscribe();
  };

  const fetchPatientInfo = async(user) => 
  {
    const q = query(collection(db, "tb-patients"));
    const unsubscribe = onSnapshot(q, (snapshot) => 
    {
      const patient = snapshot.docs.map(e => ({...e.data(),id: e.id}));
      patient.map(e => 
      {
        if (e.userId === user.uid ) 
        {
          localStorage.setItem("patient", JSON.stringify(e))
          setPatientUserInfo(e)
        }
      });
    });
      return () => unsubscribe();
    };

    const fetchAccountInfo = async(user) => 
    {
      const q = query(collection(db, "tb-accounts"));
      const unsubscribe = onSnapshot(q, (snapshot) => 
      {
        const account = snapshot.docs.map(e => ({...e.data(),id: e.id}));
        account.map(e => 
        {
          if (e.userId === user.uid ) 
          {
            localStorage.setItem("account", JSON.stringify(e))
            setAccountInfo(e)
          }
        });
      });
        return () => unsubscribe();
    };

    const fetchAccountData = async () => 
      {
        try 
        {
          const q = query(collection(db, "tb-accounts"));
          const unsubscribe = onSnapshot(q, (snapshot) => 
          {
            const employees = snapshot.docs.map(e => ({...e.data(),id: e.id}));
            setAccountList(employees);
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

    const handleResetPassword = async () =>
    {
      const { value: useremail } = await Swal.fire
      ({
        text: "This reset password is for Patient only. For Employee please contact your Administrator.",
        input: "email",
        inputPlaceholder: "Ex. JohnDoe@gmail.com",
        confirmButtonColor: '#1e293b',
        confirmButtonText: 'Send',
      });

      const [accounts] = accountList.filter(accounts => accounts.userEmail === useremail);

      if(accounts.userPrivilege === 'patient')
      {
        try
          {
            sendPasswordResetEmail(auth, useremail)
            Swal.fire
            ({
              icon: 'success',
              title: `Password reset email has been sent to this email`,
              text: `${useremail}.`,
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

      else
      {
        Swal.fire
        ({
          icon: 'error',
          text: `This forgot password is for Patient only. For Employee please contact your Administrator.`,
          confirmButtonColor: '#1e293b',
        });
      }
    };

    useEffect(() => 
    {
      document.title = `Login Page`;
      fetchAccountData();

      onAuthStateChanged(auth, (user)=>
      {
        if(user)
        {
          if (accountInfo.userPrivilege === 'admin') 
            {
              navigate('/adminPage');
            } 
            
            else if (accountInfo.userPrivilege === 'employee') 
            {
              navigate('/employeePage');
            } 
            
            else if (accountInfo.userPrivilege === 'patient') 
            {
              navigate('/patientPage');
            }
          }

          else
          {
            navigate('/');
          }
      });
    }, [])

  return (
    <>
    <div className="relative">
      <div className='absolute top-0 right-0 m-2'>
          <a 
            href="https://docs.google.com/document/d/1vis4EUHaypzp8OVYWLf02aZ-VO9hUJAR/edit?usp=sharing&ouid=108625918524549130807&rtpof=true&sd=true" target="_blank"
            className='btn bg-transparent hover:bg-transparent border-0 tooltip tooltip-left'
            data-tip="Documentation"
            >
          <svg dataSlot="icon" aria-hidden="true" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className='size-10'>
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          </a>
      </div>
      <div className="hero min-h-screen" style={{backgroundImage: `url(${loginBg})`}}>
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="flex-col">
          <div className="text-center">
            <h1 className="text-6xl lg:text-7xl font-bold text-slate-50">Health Records Repository</h1>
            <p className="text-1xl lg:text-3xl py-3 text-slate-50 italic">Your Health record is always on the GO!</p>
          </div>

            <div className="card max-w-[350px] lg:max-w-[450px] w-full mx-auto p-8 shadow-2xl bg-slate-200">
              <form onSubmit={handleLogin}>

                <div className="flex flex-col mb-4">
                  <label className="input input-bordered flex items-center gap-2 bg-slate-100 text-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                    <input 
                      className="grow w-5" 
                      type="text"
                      name="email"
                      id="email" 
                      placeholder="Email"
                      value={loginAccount.userEmail}
                      onChange={(e) => setLoginAccount({...loginAccount, userEmail:e.target.value})}
                      />
                  </label>
                </div>

                <div className="flex flex-col mb-4">
                  <label className="input input-bordered flex items-center gap-2 bg-slate-100 text-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                    <input 
                      className="grow w-5" 
                      type={isPasswordVisible ? "text" : "password"}
                      name="password"
                      id="password" 
                      placeholder="Password"
                      value={loginAccount.userPassword}
                      onChange={(e) => setLoginAccount({...loginAccount, userPassword:e.target.value})}
                    />
                
                    {loginAccount.userPassword === "" ? 
                    (
                      <button
                        type="button"
                        onClick={handleShowPassword}
                        className="rounded-md hidden"
                        
                      >
                        {isPasswordVisible ? 
                        (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 opacity-70" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        ) 
                        : 
                        (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 opacity-70" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        )}
                      </button>
                    ) 
                    
                    : 
                    
                    (
                      <button
                        type="button"
                        onClick={handleShowPassword}
                        className="rounded-md"
                      >
                        {isPasswordVisible ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 opacity-70" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 opacity-70" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        )}
                      </button>
                    )}
                  </label>
                </div>

                <button
                  type="submit" 
                  className="w-full py-3 mt-8 bg-slate-800 hover:bg-slate-600 text-slate-50 rounded-lg"
                >
                  Sign In
                </button>

                <div className='text-center py-2 text-slate-800'>
                  <button 
                    type="button"
                    className="mt-2 hover:underline"
                    onClick={handleResetPassword}
                  >
                  Forgot Password?
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default LoginPage