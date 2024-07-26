import React, {useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import Context from '../Context/Context';
import loginBg from '../assets/loginbg.jpg';

function PageNotFound() 
{
    const {accountInfo} = useContext(Context);
    
    const navigate = useNavigate();

    const handleNavigate = () => 
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
        
        else 
        {
            navigate('/');
        }
    };

    useEffect(() => 
    {
        document.title = 'Page Not Found';
    }, [accountInfo]);

    return (
        <div className="hero min-h-screen" style={{backgroundImage: `url(${loginBg})`}}>
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content flex-col">
                <main className="grid max-h-full max-w-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
                    <div className="text-center">
                        <p className="text-base font-semibold text-slate-50">404</p>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl">Page not found</h1>
                        <p className="mt-6 text-base leading-7 text-slate-50">Sorry, we couldn’t find the page you’re looking for.</p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button 
                                onClick={handleNavigate}
                                className="btn btn-neutral-500 btn-lg text-slate-50 hover:scale-110 duration-300"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PageNotFound;
