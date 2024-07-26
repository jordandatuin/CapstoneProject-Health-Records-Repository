import React from 'react'

import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './FirebaseConfig'

import Swal from 'sweetalert2'

function Logout() 
{
    const navigate = useNavigate();

    const handleLogout = () =>
        {
            Swal.fire
            ({
            icon: 'question',
            title: 'Signing Out',
            text: 'Are you sure you want to Sign out?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: '#860A35',
            }).then(result => 
            {
                if (result.value) 
                {
                Swal.fire
                ({
                    timer: 1500,
                    showConfirmButton: false,
                    willOpen: () => 
                    {
                    Swal.showLoading();
                    },
                    willClose: () => 
                    {
                        signOut(auth).then(() => 
                        {
                            navigate('/');

                        }).catch((error) => 
                        {
                            const errorCode = error.code;
                            const errorMessage = error.message;
                            alert(errorCode)
                            alert(errorMessage)
                        });
                    },
                });
                }
            });
        };

    return (
        <>
            <button 
                className='btn btn-neutral hover:scale-110 hover:bg-red-900 duration-300 lg:tooltip lg:tooltip-bottom'
                data-tip="Sign out"
                onClick={handleLogout}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 rotate-180">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
            </button>
        </>
    )
}

export default Logout