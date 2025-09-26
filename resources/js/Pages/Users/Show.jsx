import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from "sweetalert2";
import {
  FiUser, FiMail, FiPhone, FiFileText, FiCalendar,
  FiMapPin, FiHome, FiGlobe, FiShield, FiPhoneCall,
  FiAward, FiKey, FiCheckCircle, FiCode
} from 'react-icons/fi';

const Show = ({ user }) => {
  // Color scheme
  const primaryColor = '#d15623';
  const secondaryColor = '#e67e51';
  const accentColor = '#34495e';
  const lightBg = '#fdf6f2';

  const { auth } = usePage().props;

  // Role mapping
  const roleMap = {
    1: 'Super Admin',
    2: 'Host',
    3: 'Customer',
    4: 'House Manager'
  };

  // Verification form
  const { post, processing } = useForm();

  const verifyUser = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to verify this user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, verify"
    }).then((result) => {
      if (result.isConfirmed) {
        post(route('users.verify', user.id), {
          onSuccess: () => {
            Swal.fire("Verified!", "The user has been verified successfully.", "success");
          }
        });
      }
    });
  };

  const unverifyUser = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to unverify this user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ca8a04",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unverify"
    }).then((result) => {
      if (result.isConfirmed) {
        post(route('users.unverify', user.id), {
          onSuccess: () => {
            Swal.fire("Unverified!", "The user has been unverified.", "success");
          }
        });
      }
    });
  };

  // Only include files that exist
  const files = [
    user.id_verification && {
      name: 'ID Verification',
      value: `/storage/${user.id_verification}`,
      icon: <FiShield className="text-[#d15623]" />
    },
    user.profile_picture && {
      name: 'Profile Picture',
      value: `/storage/${user.profile_picture}`,
      icon: <FiShield className="text-[#d15623]" />
    }
  ].filter(Boolean);

  // Check if user has permission to verify (admins only)
  const canVerify = parseInt(auth.user.role_id) === 1;

  return (
    <Layout>
      <div className="max-w-5xl bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with accent color */}
        <div
          className="p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="opacity-90 capitalize">{roleMap[user.role_id] || 'User'} Profile</p>
            </div>
            {user.ristay_verified == "1" ? (
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                <FiCheckCircle className="text-green-300" />
                <span className="text-green-200 font-medium">Ristay Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                <span className="text-yellow-200 font-medium">Not Verified</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div
              className="rounded-lg p-5 shadow-sm border"
              style={{ backgroundColor: lightBg, borderColor: `${primaryColor}20` }}
            >
              <h2
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <FiUser /> Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.email && <InfoItem icon={<FiMail />} label="Email" value={user.email} />}
                {user.phone && <InfoItem icon={<FiPhone />} label="Phone" value={user.phone} />}
                {user.referral_code && <InfoItem icon={<FiCode />} label="Referral code" value={user.referral_code} />}
                {user.date_of_birth && (
                  <InfoItem
                    icon={<FiCalendar />}
                    label="Date of Birth"
                    value={new Date(user.date_of_birth).toLocaleDateString()}
                  />
                )}
                {user.address && <InfoItem icon={<FiHome />} label="Address" value={user.address} />}
                {user.city && user.country && (
                  <InfoItem
                    icon={<FiMapPin />}
                    label="Location"
                    value={`${user.city}, ${user.country}`}
                  />
                )}
                {user.postal_code && <InfoItem icon={<FiGlobe />} label="Postal Code" value={user.postal_code} />}
                {user.emergency_contact && (
                  <InfoItem
                    icon={<FiPhoneCall />}
                    label="Emergency Contact"
                    value={user.emergency_contact}
                  />
                )}
              </div>
            </div>

            {/* System Info Card */}
            <div
              className="rounded-lg p-5 shadow-sm border"
              style={{ backgroundColor: lightBg, borderColor: `${primaryColor}20` }}
            >
              <h2
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <FiKey /> Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.role_id && (
                  <InfoItem
                    icon={<FiAward />}
                    label="Account Type"
                    value={roleMap[parseInt(user.role_id)]}
                  />
                )}
                {user.created_at && (
                  <InfoItem
                    icon="🕒"
                    label="Member Since"
                    value={new Date(user.created_at).toLocaleDateString()}
                  />
                )}
                <InfoItem
                  icon={<FiCheckCircle />}
                  label="Verification Status"
                  value={user.ristay_verified === "1" ? 'Verified' : 'Not Verified'}
                  valueColor={user.ristay_verified === "1" ? 'text-green-600' : 'text-yellow-600'}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 flex-col flex lg:flex-row gap-4">
            {/* Files Section */}
            {files.length > 0 && (
              <div
                className="rounded-lg p-5 shadow-sm border h-full"
                style={{ backgroundColor: lightBg, borderColor: `${primaryColor}20` }}
              >
                <h2
                  className="text-xl font-semibold mb-4 flex items-center gap-2"
                  style={{ color: primaryColor }}
                >
                  <FiFileText /> Documents
                </h2>

                <div className="space-y-3">
                  {files.map((file, index) => (
                    <FileItem
                      key={index}
                      icon={file.icon}
                      name={file.name}
                      url={file.value}
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              className="rounded-lg p-5 shadow-sm border"
              style={{ backgroundColor: lightBg, borderColor: `${primaryColor}20` }}
            >
              <h3
                className="font-medium mb-3"
                style={{ color: accentColor }}
              >
                User Actions
              </h3>
              <div className="flex flex-col space-y-2">
                <Link
                  href={route('users.edit', user.id)}
                  className="px-4 py-2 text-white rounded transition text-sm font-medium text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  Edit Profile
                </Link>

                {/* Verification Button - Only show for admins */}
                {canVerify && (
                  user.ristay_verified === "1" ? (
                    <button
                      onClick={unverifyUser}
                      disabled={processing}
                      className="px-4 py-2 bg-yellow-600 text-white rounded transition text-sm font-medium text-center disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Unverify User'}
                    </button>
                  ) : (
                    <button
                      onClick={verifyUser}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded transition text-sm font-medium text-center disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Verify User'}
                    </button>
                  )
                )}

                <Link
                  href={route('users.index')}
                  className="px-4 py-2 bg-white rounded border transition text-sm text-center"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                >
                  Back to Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Updated InfoItem component
const InfoItem = ({ icon, label, value, valueColor = '' }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1 text-gray-500">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-medium ${valueColor}`} style={{ color: valueColor ? '' : '#34495e' }}>{value}</p>
    </div>
  </div>
);

// File Item Component
const FileItem = ({ icon, name, url, primaryColor }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:shadow-md transition"
  >
    <div className="flex items-center space-x-3">
      <div className="text-lg">{icon}</div>
      <span className="font-medium text-gray-700">{name}</span>
    </div>
    <span
      className="text-sm font-medium"
      style={{ color: primaryColor }}
    >
      View
    </span>
  </a>
);

export default Show;
