import React, { useState } from 'react';

const Documents = ({ employee }) => {
    const [previews] = useState({
        id_front: employee?.id_front ? `/storage/${employee?.id_front}` : null,
        id_back: employee?.id_back ? `/storage/${employee?.id_back}` : null,
        passport_front: employee?.passport_front ? `/storage/${employee?.passport_front}` : null
    });

    return (
        <div className="flex flex-col justify-center">
            <div className="relative w-full">
                <div className="relative sm:rounded-3xl">
                    <div className="space-y-4">
                        {/* Employee Details */}
                        <div className="px-2">
                            <h3 className="text-xl font-semibold">Employee Details</h3>
                            <p><strong>ID Number:</strong> {employee.id_number}</p>
                            <p><strong>Passport Number:</strong> {employee.passport_number}</p>
                            <p><strong>Salary:</strong> {employee.salary}</p>
                            <p><strong>Loan Limit:</strong> {employee.loan_limit}</p>
                        </div>

                        {/* Document Previews */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {previews.id_front && (
                                <div className="card relative flex flex-col">
                                    <img
                                        src={previews.id_front}
                                        alt="ID Front"
                                        className="w-full h-[20vh] object-cover rounded-md"
                                    />
                                    <p>ID front</p>
                                </div>
                            )}
                            {previews.id_back && (
                                <div className="card relative flex flex-col">
                                    <img
                                        src={previews.id_back}
                                        alt="ID Back"
                                        className="w-full h-[20vh] object-cover rounded-md"
                                    />
                                    <p>ID back</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documents;
