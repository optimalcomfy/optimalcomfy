import React, {useState,useEffect} from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';  
import DashboardInfoCard from "@/Components/DashboardInfoCard.jsx";

const Create = () => {
    const { employees, auth, companies } = usePage().props; 
    const roleId = auth.user?.role_id;
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const employeeOptions = employees?.map(employee => ({
      value: employee.id,
      label: employee.user?.name
    }));

    const companyOptions = companies?.map(data => ({
        value: data.id,
        label: data.name
      }));

    const { data, setData, post, errors } = useForm({
      amount: '',
      status: 'Pending',
      disbursed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      employee_id: '',
      loan_provider_id: 1,
      company_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const loanFloat = selectedEmployee?.loan_limit - selectedEmployee?.total_loan_balance;
        
        if (parseFloat(data.amount) > loanFloat) {
            alert("Loan amount cannot exceed the available loan float.");
            return;
        }
    
        post(route('loans.store'));
    };
    

    const handleEmployeeChange = (selectedOption) => {
        setData('employee_id', selectedOption ? selectedOption.value : ''); 
    };

    const handleCompanyChange = (selectedOption) => {
        setData('company_id', selectedOption ? selectedOption.value : ''); 
    };

    useEffect(() => {
        if(roleId === 3) {
            const employee = employees.find(emp => emp.user_id === auth.user?.id);
            setSelectedEmployee(employee || null);
            setData((prev) => ({
                ...prev,
                employee_id: employee.id,
            }));
            
        }

        if(data.employee_id !== '') {
            const employee = employees.find(emp => emp.id === data.employee_id);
            setSelectedEmployee(employee || null);
        }

        if(data.company_id !== '') {
            const company = companies.find(emp => emp.id === data.company_id);
            setSelectedCompany(company || null);
        }

        if(roleId !== 1) {
            const company = companies.find(emp => emp.id === auth.user?.company_id);
            setSelectedCompany(company || null);
        }
    }, [employees, auth, data.employee_id, data.company_id]);

    return (
        <Layout>
            {selectedEmployee !== null && 
            <div className="grid">
                <DashboardInfoCard
                    title="Salary"
                    value={selectedEmployee?.salary}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="Salary"
                    descriptionText="per month"
                />
                <DashboardInfoCard
                    title="Loan limit"
                    value={selectedEmployee?.loan_limit}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="The maximum amount"
                    descriptionText="you can borrow"
                />
                <DashboardInfoCard
                    title="Number of unpaid loans"
                    value={selectedEmployee?.unpaid_loans_count}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="The number"
                    descriptionText="of loans not fully paid"
                />
                <DashboardInfoCard
                    title="Value of unpaid loans"
                    value={selectedEmployee?.total_loan_balance}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="The value"
                    descriptionText="of loans not fully paid"
                />
                <DashboardInfoCard
                    title="Loan float"
                    value={selectedEmployee?.loan_limit - selectedEmployee?.total_loan_balance}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="The amount"
                    descriptionText="you can still borrow"
                />
                <DashboardInfoCard
                    title="Loan percentage rate"
                    value={`${selectedCompany?.percentage}%`}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="The amount in percentage"
                    descriptionText="added to the loan"
                />
            </div>}
            <div className="max-w-full my-4">
                <h1 className="text-3xl font-semibold">Request for a loan</h1>
                <div className="grid gap-2">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md mt-2">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            step="any"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {parseFloat(data.amount) > (selectedEmployee?.loan_limit - selectedEmployee?.total_loan_balance) && (
                            <div className="text-sm text-red-500 mt-1">
                                Loan amount cannot exceed the available loan float.
                            </div>
                        )}
                        {errors.amount && <div className="text-sm text-red-500 mt-1">{errors.amount}</div>}
                    </div>

                    {roleId !== 3 &&
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Employee</label>
                        <Select
                            options={employeeOptions}
                            value={employeeOptions.find(option => option.value === data.employee_id)} 
                            onChange={handleEmployeeChange}
                            className="mt-1 block w-full py-2"
                            placeholder="Select a employee"
                        />
                        {errors.employee_id && <div className="text-sm text-red-500 mt-1">{errors.employee_id}</div>}
                    </div>}

                    {roleId === 1 &&
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <Select
                            options={companyOptions}
                            value={companyOptions.find(option => option.value === data.company_id)} 
                            onChange={handleCompanyChange}
                            className="mt-1 block w-full py-2"
                            placeholder="Select a company"
                        />
                        {errors.employee_id && <div className="text-sm text-red-500 mt-1">{errors.employee_id}</div>}
                    </div>}

                    {/* Submit Button */}
                    {parseFloat(data.amount) <= (selectedEmployee?.loan_limit - selectedEmployee?.total_loan_balance) && (
                        <button
                            type="submit"
                            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Request for a loan
                        </button>
                    )}
                </form>

                <DashboardInfoCard
                    title="New loan repayment amount"
                    value={parseFloat(((parseFloat(data?.amount) || 0) + (parseFloat(data?.amount) || 0) * (parseFloat(selectedCompany?.percentage) || 0) / 100).toFixed(2))}
                    icon="map-marker"
                    iconColor="blue"
                    descriptionValue="The value"
                    descriptionText="to pay for this new loan"
                />

                </div>

                {/* Link to Go Back */}
                <div className="mt-6 text-center">
                    <Link href={route('loans.index')} className="text-indigo-600 hover:text-indigo-800">
                        Back to Loans
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Create;
