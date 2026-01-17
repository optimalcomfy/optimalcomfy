import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FaCalendarAlt, FaMapMarkerAlt, FaEye, FaUser, FaCar, FaMoneyBillWave, FaCheckCircle, FaArrowLeft, FaSignInAlt, FaSignOutAlt, FaCalendarPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { ClipboardCheck, Clock } from 'lucide-react';

const CarBookingShow = () => {
  const { carBooking: booking, auth, errors, max_refundable_amount } = usePage().props;
  const roleId = parseInt(auth.user?.role_id);

  // Calculate number of days
  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const handleCheckIn = () => {
    if (booking.checkin_verification_code) {
      // Show verification modal if code was already sent
      Swal.fire({
        title: 'Enter Verification Code',
        html: `
          <p>We sent a verification code to ${booking.user.email}</p>
          <input type="text" id="verification-code" class="swal2-input" placeholder="6-digit code">
        `,
        showCancelButton: true,
        confirmButtonText: 'Verify',
        preConfirm: () => {
          const code = Swal.getPopup().querySelector('#verification-code').value;
          if (!code || code.length !== 6) {
            Swal.showValidationMessage('Please enter a valid 6-digit code');
            return false;
          }
          return code;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          router.put(route('car-bookings.update', { car_booking: booking.id }), {
            checked_in: new Date().toISOString().slice(0, 19).replace('T', ' '),
            id: booking.id,
            verification_code: result.value,
            preserveScroll: true,
            onSuccess: () => {
              Swal.fire('Success!', 'Car check-in verified successfully!', 'success');
            },
            onError: () => {
              Swal.fire('Error!', 'Invalid verification code', 'error');
            }
          });
        }
      });
    } else {
      // Initiate check-in process
      Swal.fire({
        title: 'Confirm Car Check-In',
        text: 'Are you sure you want to check in this car rental? A verification code will be sent to the guest\'s email.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, send verification'
      }).then((result) => {
        if (result.isConfirmed) {
          router.put(route('car-bookings.update', { car_booking: booking.id }), {
            checked_in: new Date().toISOString().slice(0, 19).replace('T', ' '),
            id: booking.id,
            preserveScroll: true,
            onSuccess: () => {
              Swal.fire(
                'Verification Sent!',
                'A verification code has been sent to the guest\'s email.',
                'success'
              );
            },
            onError: () => {
              Swal.fire(
                'Error!',
                'There was an error initiating car check-in.',
                'error'
              );
            }
          });
        }
      });
    }
  };

  const handleCheckOut = () => {
    if (booking.checkout_verification_code) {
      // Show verification modal if code was already sent
      Swal.fire({
        title: 'Enter Verification Code',
        html: `
          <p>We sent a verification code to ${booking.user.email}</p>
          <input type="text" id="verification-code" class="swal2-input" placeholder="6-digit code">
        `,
        showCancelButton: true,
        confirmButtonText: 'Verify',
        preConfirm: () => {
          const code = Swal.getPopup().querySelector('#verification-code').value;
          if (!code || code.length !== 6) {
            Swal.showValidationMessage('Please enter a valid 6-digit code');
            return false;
          }
          return code;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          router.put(route('car-bookings.update', { car_booking: booking.id }), {
            checked_out: new Date().toISOString().slice(0, 19).replace('T', ' '),
            id: booking.id,
            verification_code: result.value,
            preserveScroll: true,
            onSuccess: () => {
              Swal.fire('Success!', 'Car check-out verified successfully!', 'success');
            },
            onError: () => {
              Swal.fire('Error!', 'Invalid verification code', 'error');
            }
          });
        }
      });
    } else {
      // Initiate check-out process
      Swal.fire({
        title: 'Confirm Car Check-Out',
        text: 'Are you sure you want to check out this car rental? A verification code will be sent to the guest\'s email.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, send verification'
      }).then((result) => {
        if (result.isConfirmed) {
          router.put(route('car-bookings.update', { car_booking: booking.id }), {
            checked_out: new Date().toISOString().slice(0, 19).replace('T', ' '),
            id: booking.id,
            preserveScroll: true,
            onSuccess: () => {
              Swal.fire(
                'Verification Sent!',
                'A verification code has been sent to the guest\'s email.',
                'success'
              );
            },
            onError: () => {
              Swal.fire(
                'Error!',
                'There was an error initiating car check-out.',
                'error'
              );
            }
          });
        }
      });
    }
  };

  const getBookingStatus = () => {
    if (booking.checked_out) return 'checked_out';
    if (booking.checked_in) return 'checked_in';
    return 'confirmed';
  };

  const bookingStatus = getBookingStatus();


  const handleCancelBooking = () => {
    Swal.fire({
      title: 'Cancel Booking',
      html: `
        <p>Are you sure you want to cancel this booking?</p>
        <p>This action cannot be undone.</p>
        <textarea id="cancel-reason" class="swal2-textarea mt-3" placeholder="Please provide a reason for cancellation (required)" required></textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel booking',
      cancelButtonText: 'No, keep booking',
      preConfirm: () => {
        const reason = Swal.getPopup().querySelector('#cancel-reason').value;
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('Please provide a cancellation reason');
          return false;
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.put(route('car-bookings.cancel', booking.id), {
          cancel_reason: result.value,
          id:booking.id,
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Booking cancelled!',
              'The booking has been cancelled successfully. Both host and guest have been notified.',
              'success'
            );
          },
          onError: () => {
            Swal.fire(
              'Error!',
              'There was an error cancelling the booking. Please try again.',
              'error'
            );
          }
        });
      }
    });
  };



    const handleRefund = () => {
        // Get payment data from the correct structure
        const payment = booking.payment;
        const refunds = booking.refunds || [];

        // Calculate actual values from the correct data structure
        const actualAmountPaid = payment && payment.status === 'completed' ? parseFloat(payment.amount) : 0;
        const totalRefunded = refunds.reduce((sum, refund) => sum + parseFloat(refund.amount || 0), 0);
        const remainingRefundable = Math.max(0, actualAmountPaid - totalRefunded);

        // Get max refundable amount from car booking calculation
        const maxRefundable = parseFloat(booking.max_refundable_amount) || 0;

        // The maximum allowed refund is the minimum between calculated refund and remaining refundable
        const maxAllowedRefund = Math.min(maxRefundable, remainingRefundable);

        // Check if refund can be processed
        const hasSuccessfulPayment = actualAmountPaid > 0 && payment?.status === 'completed';
        const canProcessRefund = hasSuccessfulPayment && maxAllowedRefund > 0;

        // Determine if this is a partial refund scenario
        const isPartialRefund = maxAllowedRefund > 0 && maxAllowedRefund < actualAmountPaid;
        const hasPreviousRefunds = totalRefunded > 0;

        Swal.fire({
            title: 'Process Refund Request',
            html: `
            <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <!-- Payment Information -->
                <div style="
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
                color: #0369a1;
                ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <i class="fas fa-money-bill-wave"></i>
                    <strong>Payment Information</strong>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
                    <div>
                    <span style="color: #6b7280;">Amount Paid:</span>
                    <div style="font-weight: 600; color: #065f46;">KES ${actualAmountPaid.toFixed(2)}</div>
                    </div>
                    <div>
                    <span style="color: #6b7280;">Already Refunded:</span>
                    <div style="font-weight: 600; color: #dc2626;">KES ${totalRefunded.toFixed(2)}</div>
                    </div>
                    <div>
                    <span style="color: #6b7280;">Remaining Refundable:</span>
                    <div style="font-weight: 600; color: #059669;">KES ${remainingRefundable.toFixed(2)}</div>
                    </div>
                    <div>
                    <span style="color: #6b7280;">Max Allowed:</span>
                    <div style="font-weight: 600; color: #0369a1;">KES ${maxAllowedRefund.toFixed(2)}</div>
                    </div>
                </div>
                ${!hasSuccessfulPayment ? `
                    <div style="margin-top: 8px; padding: 8px; background: #fef2f2; border-radius: 4px; font-size: 12px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i>
                    No successful payment found for this booking.
                    </div>
                ` : hasPreviousRefunds ? `
                    <div style="margin-top: 8px; padding: 8px; background: #fef3c7; border-radius: 4px; font-size: 12px; color: #92400e;">
                    <i class="fas fa-info-circle" style="margin-right: 4px;"></i>
                    Partial refunds have already been processed for this booking.
                    </div>
                ` : ''}
                </div>

                ${!hasSuccessfulPayment ? `
                <div style="
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    color: #dc2626;
                ">
                    <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>No Payment Found</strong>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">
                    Cannot process refund - no successful payment was recorded for this booking.
                    </p>
                </div>
                ` : !canProcessRefund ? `
                <div style="
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    color: #dc2626;
                ">
                    <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Non-refundable</strong>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">
                    Maximum refundable amount has been reached or exceeded.
                    </p>
                </div>
                ` : ''}

                ${canProcessRefund && isPartialRefund ? `
                <div style="
                    background: #fffbeb;
                    border: 1px solid #fed7aa;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    color: #ea580c;
                ">
                    <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-info-circle"></i>
                    <strong>Partial Refund Available</strong>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">
                    ${hasPreviousRefunds ?
                        'Additional partial refund available based on remaining refundable amount.' :
                        'Partial refund available based on rental conditions.'
                    }
                    </p>
                </div>
                ` : ''}

                <!-- Action Selection Card -->
                <div style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ${!canProcessRefund ? 'opacity: 0.6; pointer-events: none;' : ''}
                ">
                <h4 style="
                    margin: 0 0 16px 0;
                    color: #334155;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                ">
                    <i class="fas fa-tasks" style="color: #6366f1; margin-right: 8px; font-size: 14px;"></i>
                    Select Action
                </h4>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <label style="
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: white;
                    border: 2px solid #10b981;
                    border-radius: 8px;
                    cursor: ${!canProcessRefund ? 'not-allowed' : 'pointer'};
                    transition: all 0.2s ease;
                    font-weight: 500;
                    color: #065f46;
                    ${!canProcessRefund ? 'opacity: 0.6;' : ''}
                    " for="approveRefund">
                    <input
                        type="radio"
                        id="approveRefund"
                        name="refundAction"
                        value="approve"
                        ${!canProcessRefund ? 'disabled' : 'checked'}
                        style="
                        margin-right: 12px;
                        transform: scale(1.2);
                        accent-color: #10b981;
                        "
                    >
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i>
                    Approve Refund
                    </label>

                    <label style="
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    color: #6b7280;
                    " for="rejectRefund">
                    <input
                        type="radio"
                        id="rejectRefund"
                        name="refundAction"
                        value="reject"
                        ${!canProcessRefund ? 'checked' : ''}
                        style="
                        margin-right: 12px;
                        transform: scale(1.2);
                        accent-color: #ef4444;
                        "
                    >
                    <i class="fas fa-times-circle" style="color: #ef4444; margin-right: 8px;"></i>
                    Reject Refund
                    </label>
                </div>
                </div>

                <!-- Refund Amount Section -->
                <div id="refundAmountGroup" style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ${!canProcessRefund ? 'display: none;' : ''}
                ">
                <h4 style="
                    margin: 0 0 16px 0;
                    color: #334155;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                ">
                    Refund Amount
                </h4>

                <div style="position: relative;">
                    <input
                    type="number"
                    id="refundAmount"
                    style="
                        width: 100%;
                        padding: 12px 12px 12px 48px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        color: #374151;
                        background: #f9fafb;
                        transition: all 0.2s ease;
                        box-sizing: border-box;
                        ${!canProcessRefund ? 'background: #f3f4f6; color: #9ca3af;' : ''}
                    "
                    min="0.01"
                    max="${maxAllowedRefund}"
                    value="${maxAllowedRefund}"
                    step="0.01"
                    placeholder="0.00"
                    ${!canProcessRefund ? 'disabled' : ''}
                    >
                    <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #6b7280; font-weight: 600;">KES:</span>
                </div>

                <div style="
                    margin-top: 8px;
                    font-size: 13px;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                ">
                    <i class="fas fa-info-circle" style="margin-right: 6px; color: #3b82f6;"></i>
                    Maximum refundable amount: KES ${maxAllowedRefund.toFixed(2)}
                </div>

                <div style="
                    margin-top: 4px;
                    font-size: 12px;
                    color: #6b7280;
                ">
                    <i class="fas fa-shield-alt" style="margin-right: 6px; color: #10b981;"></i>
                    Based on actual payment of KES ${actualAmountPaid.toFixed(2)} ${hasPreviousRefunds ? `minus previous refunds of KES ${totalRefunded.toFixed(2)}` : ''}
                </div>
                </div>

                <!-- Rejection Reason Section -->
                <div id="rejectReasonGroup" style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                display: ${!canProcessRefund ? 'block' : 'none'};
                ">
                <h4 style="
                    margin: 0 0 16px 0;
                    color: #334155;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                ">
                    <i class="fas fa-comment-alt" style="color: #ef4444; margin-right: 8px; font-size: 14px;"></i>
                    Reason for Rejection
                </h4>

                <textarea
                    id="rejectReason"
                    rows="4"
                    placeholder="Please provide a detailed reason for rejecting this refund request..."
                    style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                    color: #374151;
                    background: #f9fafb;
                    resize: vertical;
                    min-height: 100px;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    "
                ></textarea>

                <div style="
                    margin-top: 8px;
                    font-size: 13px;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                ">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 6px; color: #f59e0b;"></i>
                    This reason will be sent to the customer
                </div>
                </div>
            </div>
            `,
            width: 560,
            showCancelButton: true,
            confirmButtonText: !canProcessRefund ?
            '<i class="fas fa-ban" style="margin-right: 8px;"></i>Reject Refund' :
            '<i class="fas fa-paper-plane" style="margin-right: 8px;"></i>Submit Request',
            cancelButtonText: '<i class="fas fa-times" style="margin-right: 8px;"></i>Cancel',
            confirmButtonColor: !canProcessRefund ? '#ef4444' : '#3b82f6',
            cancelButtonColor: '#6b7280',
            customClass: {
            popup: 'professional-refund-modal',
            confirmButton: 'professional-confirm-btn',
            cancelButton: 'professional-cancel-btn'
            },
            buttonsStyling: false,
            preConfirm: () => {
            const action = document.querySelector('input[name="refundAction"]:checked').value;
            const amount = document.getElementById('refundAmount')?.value;
            const reason = document.getElementById('rejectReason')?.value;

            if (action === 'reject' && !reason?.trim()) {
                Swal.showValidationMessage(
                '<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>Please provide a reason for rejection'
                );
                return false;
            }

            if (action === 'approve' && (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAllowedRefund)) {
                Swal.showValidationMessage(
                `<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>Refund amount must be between 0.01 and ${maxAllowedRefund.toFixed(2)}`
                );
                return false;
            }

            return { action, amount, reason };
            },
            didOpen: () => {
            // Add custom CSS
            const style = document.createElement('style');
            style.textContent = `
                .professional-refund-modal {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                }

                .professional-confirm-btn, .professional-cancel-btn {
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                font-size: 14px !important;
                transition: all 0.2s ease !important;
                border: none !important;
                cursor: pointer !important;
                }

                .professional-confirm-btn {
                background: ${!canProcessRefund ? '#ef4444' : '#3b82f6'} !important;
                color: white !important;
                }

                .professional-confirm-btn:hover {
                background: ${!canProcessRefund ? '#dc2626' : '#2563eb'} !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(${!canProcessRefund ? '239, 68, 68' : '59, 130, 246'}, 0.4) !important;
                }

                .professional-cancel-btn {
                background: #6b7280 !important;
                color: white !important;
                }

                .professional-cancel-btn:hover {
                background: #4b5563 !important;
                transform: translateY(-1px) !important;
                }

                input[type="number"]:focus, textarea:focus {
                outline: none !important;
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                }

                label:has(input[type="radio"]:checked) {
                border-color: #10b981 !important;
                background: #ecfdf5 !important;
                color: #065f46 !important;
                }

                label:has(input[name="refundAction"][value="reject"]:checked) {
                border-color: #ef4444 !important;
                background: #fef2f2 !important;
                color: #991b1b !important;
                }

                input:disabled, textarea:disabled {
                background: #f3f4f6 !important;
                color: #9ca3af !important;
                cursor: not-allowed !important;
                }
            `;
            document.head.appendChild(style);

            const refundActionRadios = document.querySelectorAll('input[name="refundAction"]');
            const refundAmountGroup = document.getElementById('refundAmountGroup');
            const rejectReasonGroup = document.getElementById('rejectReasonGroup');

            refundActionRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                if (e.target.value === 'approve') {
                    refundAmountGroup.style.display = 'block';
                    rejectReasonGroup.style.display = 'none';
                } else {
                    refundAmountGroup.style.display = 'none';
                    rejectReasonGroup.style.display = 'block';
                }
                });
            });
            }
        }).then((result) => {
            if (result.isConfirmed) {
            const { action, amount, reason } = result.value;

            // Show loading state
            Swal.fire({
                title: 'Processing...',
                html: '<i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i><br><br>Please wait while we process your request.',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
            });

            router.post(route('car-bookings.handle-refund', booking.id), {
                action,
                refund_amount: action === 'approve' ? amount : 0,
                reason: action === 'reject' ? reason : '',
            }, {
                preserveScroll: true,
                onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    html: `
                    <div style="text-align: center; color: #374151;">
                        <i class="fas fa-check-circle" style="color: #10b981; font-size: 48px; margin-bottom: 16px;"></i>
                        <p style="font-size: 16px; margin: 0;">
                        Refund request has been <strong>${action === 'approve' ? 'approved' : 'rejected'}</strong>
                        </p>
                        ${action === 'approve' ? `<p style="color: #6b7280; margin: 8px 0 0 0;">Amount: KES ${parseFloat(amount).toFixed(2)}</p>` : ''}
                    </div>
                    `,
                    confirmButtonText: 'Continue',
                    confirmButtonColor: '#10b981',
                    customClass: {
                    confirmButton: 'professional-success-btn'
                    },
                    buttonsStyling: false
                });
                },
                onError: (errors) => {
                let errorMessage = 'There was an error processing the refund request';

                if (errors.refund_amount) {
                    errorMessage = errors.refund_amount;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    html: `
                    <div style="text-align: center; color: #374151;">
                        <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 48px; margin-bottom: 16px;"></i>
                        <p style="font-size: 16px; margin: 0;">
                        ${errorMessage}
                        </p>
                        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
                        Please try again or contact support if the issue persists
                        </p>
                    </div>
                    `,
                    confirmButtonText: 'Try Again',
                    confirmButtonColor: '#ef4444',
                    customClass: {
                    confirmButton: 'professional-error-btn'
                    },
                    buttonsStyling: false
                });
                }
            });
            }
        });
    };

  const handleExtendRental = () => {
    if (!booking?.id) {
      Swal.fire('Error', 'Booking information is not available', 'error');
      return;
    }

    // Format the date properly
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString();
    };

    const params = new URLSearchParams({
      start_date: formatDate(booking.end_date) || '',
      end_date: '', // Explicitly set as empty string
      car_id: booking.car_id || ''
    });

    // Use the correct route name for car booking extension
    const url = route('car-bookings.extend', {
      car_booking: booking.id,
      ...Object.fromEntries(params)
    });

    router.visit(url);
  };

  return (
    <Layout>
      <div className="max-w-7xl p-4">
        {/* Header with back button */}
        <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
          {roleId !== 4 &&
          <Link
            href={route('car-bookings.index')}
            className="flex items-center text-peachDark mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Car Bookings
          </Link>}
          <h1 className="text-3xl font-bold text-gray-800">Car Rental Details</h1>
          <Link
              href={route('car-bookings.checklist', booking.id)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
              <ClipboardCheck className="h-4 mr-2" />
              View Checklist
          </Link>
            {booking.checked_in && !booking.checked_out && booking.status !== 'cancelled' && booking.status !== 'failed' && (
                <button
                    onClick={handleExtendRental}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    <FaCalendarPlus className="mr-2" />
                    Extend Rental
                </button>
            )}
            {booking.status === 'confirmed' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 text-yellow-600" />
                            <div>
                                <p className="font-medium text-yellow-800">Payment Required</p>
                                <p className="text-sm text-yellow-700">
                                    Complete payment to confirm your booking.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('car-bookings.pay', booking.id)}
                            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                        >
                            Pay Now
                        </Link>
                    </div>
                </div>
            )}
        </div>

        {/* Status banner with check-in/out buttons */}
        <div className={`mb-6 rounded-r p-4 border-l-4 ${
          bookingStatus === 'checked_in' ? 'bg-blue-50 border-blue-500' :
          bookingStatus === 'checked_out' ? 'bg-purple-50 border-purple-500' :
          'bg-green-50 border-green-500'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className={`h-5 ${
                  bookingStatus === 'checked_in' ? 'text-blue-500' :
                  bookingStatus === 'checked_out' ? 'text-purple-500' :
                  'text-green-500'
                }`} />
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  <span className="font-medium">{booking.car.name}</span> -
                  Status: <span className="font-bold capitalize">{bookingStatus}</span>
                </p>
                {(booking.checkin_verification_code || booking.checkout_verification_code) && (
                  <p className="text-xs mt-1 text-yellow-700">
                    <i>Verification pending - code sent to guest's email</i>
                  </p>
                )}
              </div>
            </div>
            {roleId !== 3 &&
            <div className="flex space-x-2">
              {!booking.checked_in && !booking.checked_out && booking.status !== 'cancelled' && booking.status !== 'failed' && (
                <button
                  onClick={handleCheckIn}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  <FaSignInAlt className="mr-2" />
                  {booking.checkin_verification_code ? 'Verify Check In' : 'Check In'}
                </button>
              )}
              {booking.checked_in && !booking.checked_out && booking.status !== 'cancelled' && booking.status !== 'failed' && (
                <button
                  onClick={handleCheckOut}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  <FaSignOutAlt className="mr-2" />
                  {booking.checkout_verification_code ? 'Verify Check Out' : 'Check Out'}
                </button>
              )}
            </div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Booking summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3">
                  <img
                    className="h-48 w-full object-cover md:h-full"
                    src={`/storage/${booking.car?.initial_gallery?.[0]?.image}` || '/images/default-car.jpg'}
                    alt={booking.car.name}
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="uppercase tracking-wide text-sm text-peachDark font-semibold">
                    {booking.car.type}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {booking.car.name}
                  </h2>
                  <div className="mt-2 flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{booking.car.location}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Pickup Date</p>
                      <p className="font-medium">{new Date(booking.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dropoff Date</p>
                      <p className="font-medium">{new Date(booking.end_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup Location</p>
                      <p className="font-medium">{booking.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dropoff Location</p>
                      <p className="font-medium">{booking.dropoff_location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaUser className="inline mr-2" /> Guest Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{booking.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{booking.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{booking.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{booking.user.address}, {booking.user.city}, {booking.user.country}</p>
                </div>
                <Link href={route('users.show', booking.user?.id)}>
                  <p className="text-lg font-bold text-gray-500 flex items-center gap-2"> <FaEye /> View user kyc</p>
                </Link>
              </div>
            </div>

            {/* Car details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaCar className="inline mr-2" /> Car Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Make</p>
                  <p className="font-medium">{booking.car.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{booking.car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{booking.car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{booking.car.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Color</p>
                  <p className="font-medium">{booking.car.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seats</p>
                  <p className="font-medium">{booking.car.seats}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transmission</p>
                  <p className="font-medium">{booking.car.transmission}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-medium">{booking.car.fuel_type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Payment summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaMoneyBillWave className="inline mr-2" /> Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total</span>
                      {roleId === 2 ?
                  <span>KES {parseFloat(booking.host_price)}</span>
                  :
                   <span>KES {parseFloat(booking.total_price)}</span>}
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-peachDark">
                      Payment Status: <span className={`font-bold ${booking.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booking.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaCalendarAlt className="inline mr-2" /> Booking Timeline
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Booking confirmed on <time dateTime={booking.created_at}>{new Date(booking.created_at).toLocaleString()}</time></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {booking.checked_in && (
                    <li>
                      <div className="relative pb-8">
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <FaSignInAlt className="h-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Checked in on <time dateTime={booking.checked_in}>{new Date(booking.checked_in).toLocaleString()}</time></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}

                  {booking.checked_out && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                              <FaSignOutAlt className="h-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Checked out on <time dateTime={booking.checked_out}>{new Date(booking.checked_out).toLocaleString()}</time></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Help section */}
            <div className="bg-white flex flex-col gap-4 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If you have any questions about your car rental, please contact our customer support.
              </p>
              <a href={`tel:${booking.user?.phone}`} className="px-8 py-2 text-center justify-center flex items-center w-full bg-peachDark hover:bg-blue-700 text-white rounded-md transition duration-150">
                Contact Support
              </a>

              {errors.cancel_reason &&
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md flex items-start">
                <svg
                  className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{errors.cancel_reason}</span>
              </div>}

              {booking.status === 'cancelled' &&
              <div className="bg-white flex flex-col gap-4 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  {booking.refund_approval ? 'Refund Status' : 'This booking has been cancelled'}
                </h3>

                {booking.cancel_reason && (
                  <p className="text-sm text-gray-600 mb-3">
                    {booking.cancel_reason}
                  </p>
                )}

                {!booking.checked_out && booking.status !== 'cancelled' && booking.status !== 'failed' && (
                    <button
                      onClick={handleCancelBooking}
                      className="px-8 py-2 w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150"
                    >
                      Cancel Booking
                    </button>
                )}


                {roleId === 1 && max_refundable_amount > 0 && (
                    <button
                        onClick={handleRefund}
                        className="px-8 py-2 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150"
                    >
                        Process Refund
                    </button>
                )}


                {booking.refund_approval === 'approved' ? (
                  <div className="bg-green-50 text-green-800 p-3 rounded-md">
                    <p className="font-medium">Refund Approved</p>
                    <p>Amount: KES {booking.refund_amount}</p>
                    <p className="text-sm mt-1">
                      Status: {booking.refund_status === 'completed' ?
                        'Completed' : 'Processing - Please allow 1-3 business days'}
                    </p>
                  </div>
                ) : booking.refund_approval === 'rejected' ? (
                  <div className="bg-red-50 text-red-800 p-3 rounded-md">
                    <p className="font-medium">Refund Rejected</p>
                    <p>Reason: {booking.non_refund_reason}</p>
                  </div>
                ) : (
                    <></>
                )}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarBookingShow;
