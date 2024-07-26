import React, {useEffect} from 'react'
import ReactPaginate from 'react-paginate'

export function Pagination({dataList, dataPerPage, setCurrentPage, currentPage}) 
{
    // automatically scoll ontop after page change
    useEffect( () => 
    {
        window.scrollTo({top: 0})
    }, [currentPage])

  return (
    <>
        <ReactPaginate
            className="flex gap-4 text-center bg-transparent text-slate-50 p-1 text-md"
        // name of the buttons
            previousLabel=
            {
                <svg className='size-6 hover:stroke-neutral-950' aria-hidden="true" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
            nextLabel=
            {
                <svg className='size-6 hover:stroke-neutral-950' aria-hidden="true" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
            breakLabel={"..."}
        // number of pages
        // Math.ceil to roundup the number and divide it by the number of usersPerPage
            pageCount={Math.ceil(dataList.length / dataPerPage)}
        // ReactPaginate have {selected}, it basically make the pagination work
            onPageChange={({selected}) => { setCurrentPage(selected)}}
            activeClassName={'currentPage'}
            previousLinkClassName={"prevBtn"}
            nextLinkClassName={"nextBtn"}
            pageRangeDisplayed={1}
            marginPagesDisplayed={1}
        />
    </>
  )
}

export function EmployeePagination(props)
{
    return <Pagination {...props} />;
}

export function PatientPagination(props)
{
    return <Pagination {...props} />;
}

export function EmployeeMedicalRecordPagination(props)
{
    return <Pagination {...props} />;
}

export function PatientMedicalRecordPagination(props)
{
    return <Pagination {...props} />;
}
