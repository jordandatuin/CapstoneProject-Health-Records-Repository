import React from 'react';

// Common Modal Component
export function ModalWindow({ open, onClose, children }) 
{
  return (
    <div
      onClick={onClose}
      className={`
        fixed inset-0 flex justify-center items-center z-10
        transition-colors
        ${open ? 'visible bg-black/20' : 'invisible'}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-neutral rounded-xl shadow p-6 mt-10 lg:mt-0 transition-all max-h-[90vh] overflow-y-auto
          ${open ? 'scale-90 md:scale-110 lg:scale-105 opacity-100' : 'scale-125 opacity-0'}
        `}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalAddEmployee(props) 
{
    return <ModalWindow {...props} />;
}

export function ModalUpdateEmployee(props) 
{
    return <ModalWindow {...props} />;
}

export function ModalViewEmployee(props) 
{
    return <ModalWindow {...props} />;
}

export function ModalAddPatient(props) 
{
  return <ModalWindow {...props} />;
}

export function ModalUpdatePatient(props) 
{
  return <ModalWindow {...props} />;
}

export function ModalViewPatient(props) 
{
  return <ModalWindow {...props} />;
}

export function ModalAddMedicalRecord(props) 
{
  return <ModalWindow {...props} />;
}

export function ModalViewMedicalRecord(props) 
{
  return <ModalWindow {...props} />;
}
