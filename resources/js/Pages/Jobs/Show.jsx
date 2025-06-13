import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Show = ({ job }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (!max) return `From $${min.toLocaleString()}`;
    if (!min) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gray-50 border-b p-6">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>{job.company_name}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.job_type}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-8">
            {/* Key Details Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex justify-between w-1/2">
                <img src={job.image_url} alt="Job Image" className="w-full h-auto rounded-lg shadow-md" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 lg:w-1/2">
                <h2 className="text-xl font-semibold text-gray-900">Key Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry</span>
                    <span className="text-gray-900">{job.industry || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level</span>
                    <span className="text-gray-900">{job.experience_level || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Schedule</span>
                    <span className="text-gray-900">{job.work_schedule || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary Range</span>
                    <span className="text-gray-900">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:w-1/3">
                <h2 className="text-xl font-semibold text-gray-900">Application Info</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Method</span>
                    <span className="text-gray-900">{job.application_method || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline</span>
                    <span className="text-gray-900">{formatDate(job.application_deadline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Reference</span>
                    <span className="text-gray-900">{job.job_reference || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted Date</span>
                    <span className="text-gray-900">{formatDate(job.posting_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {/* Description Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 w-full">
                <h2 className="text-xl font-semibold text-gray-900">Job Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            <hr />

            {/* Qualifications Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 lg:w-1/2">
                <h2 className="text-xl font-semibold text-gray-900">Required Qualifications</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.required_qualifications}</p>
              </div>
              <div className="space-y-4 lg:w-1/3">
                <h2 className="text-xl font-semibold text-gray-900">Preferred Qualifications</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.preferred_qualifications}</p>
              </div>
            </div>

            <hr />

            {/* Benefits & Culture Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 lg:w-1/2">
                <h2 className="text-xl font-semibold text-gray-900">Benefits</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
              </div>
              <div className="space-y-4 lg:w-1/3">
                <h2 className="text-xl font-semibold text-gray-900">Company Culture</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.company_culture}</p>
              </div>
            </div>

            <hr />

            {/* Interview Process Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Interview Process</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.interview_process}</p>
            </div>

            <hr />

            {/* Company Contact Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className='lg:w-1/2'>
                  <span className="block text-gray-600">Website</span>
                  <a href={job.company_website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {job.company_website || 'Not specified'}
                  </a>
                </div>
                <div className='lg:w-1/3'>
                  <span className="block text-gray-600">Hiring Manager Contact</span>
                  <span className="text-gray-900">{job.hiring_manager_contact || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50 p-6">
            <div className="flex justify-between items-center">
              <Link
                href={route('jobs.index')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                Back to Jobs
              </Link>
              <Link
                href={route('jobs.edit', job.id)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-peach transition"
              >
                Edit Job
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Show;