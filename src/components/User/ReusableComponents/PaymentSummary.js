import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SelectInput from "../ReusableComponents/SelectInput";
import TextInput from "../ReusableComponents/TextInput";
import Alert from "../../Alert";

const PaymentSummary = ({ purchaseOrder, setPurchaseOrder, isIntraState }) => {
  const [paymentType, setPaymentType] = useState(purchaseOrder.modeOfPayment === 'EMI' ? 'EMI' : 'One-Go');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!purchaseOrder.emiDetails || !Array.isArray(purchaseOrder.emiDetails?.installments)) {
      console.warn('Normalizing emiDetails:', purchaseOrder.emiDetails);
      setPurchaseOrder(prevState => ({
        ...prevState,
        emiDetails: {
          frequency: prevState.emiDetails?.frequency || '',
          interestRate: prevState.emiDetails?.interestRate || 0,
          totalWithInterest: prevState.emiDetails?.totalWithInterest || prevState.dueAmount || '0',
          installments: Array.isArray(prevState.emiDetails?.installments) ? prevState.emiDetails.installments : []
        }
      }));
    }
  }, [purchaseOrder, setPurchaseOrder]);

  const unpaidInstallmentsCount = Array.isArray(purchaseOrder.emiDetails?.installments)
    ? purchaseOrder.emiDetails.installments.filter(installment => installment.status === 'Unpaid').length
    : 0;

  const handlePaymentTypeChange = (e) => {
    const value = e.target.value;
    setPaymentType(value);
    setPurchaseOrder(prevState => ({
      ...prevState,
      modeOfPayment: value === 'EMI' ? 'EMI' : prevState.initialPaymentMethod || '',
      emiDetails: value === 'EMI' ? prevState.emiDetails : { frequency: '', interestRate: 0, totalWithInterest: '0', installments: [] }
    }));
  };

  const handlePaymentMethodChange = (event, index = null) => {
    const { name, value } = event.target;
    setPurchaseOrder(prevState => {
      if (name === 'initialPaymentMethod') {
        return { ...prevState, initialPaymentMethod: value };
      } else if (name.startsWith('installmentPaymentMethod')) {
        const updatedInstallments = [...prevState.emiDetails.installments];
        updatedInstallments[index] = { ...updatedInstallments[index], paymentMethod: value };
        return {
          ...prevState,
          emiDetails: { ...prevState.emiDetails, installments: updatedInstallments }
        };
      } else if (name.startsWith('paymentReference')) {
        const updatedInstallments = [...prevState.emiDetails.installments];
        updatedInstallments[index] = { ...updatedInstallments[index], paymentReference: value };
        return {
          ...prevState,
          emiDetails: { ...prevState.emiDetails, installments: updatedInstallments }
        };
      } else if (name.startsWith('paymentNote')) {
        const updatedInstallments = [...prevState.emiDetails.installments];
        updatedInstallments[index] = { ...updatedInstallments[index], paymentNote: value };
        return {
          ...prevState,
          emiDetails: { ...prevState.emiDetails, installments: updatedInstallments }
        };
      }
      return prevState;
    });
  };

  const handleEmiChange = (event) => {
    const { name, value } = event.target;
    setPurchaseOrder(prevState => {
      const updatedEmiDetails = { ...prevState.emiDetails } || { frequency: '', interestRate: 0, totalWithInterest: '0', installments: [] };
      if (name === 'frequency') {
        updatedEmiDetails.frequency = value;
      } else if (name === 'interestRate') {
        updatedEmiDetails.interestRate = parseFloat(value) || 0;
      } else if (name === 'installments') {
        const numInstallments = parseInt(value) || 0;
        if (numInstallments > 0 && prevState.dueAmount) {
          const dueAmount = parseFloat(prevState.dueAmount);
          const interestRate = updatedEmiDetails.interestRate || 0;
          const tenureYears = numInstallments / (updatedEmiDetails.frequency === 'Monthly' ? 12 : updatedEmiDetails.frequency === 'Quarterly' ? 4 : updatedEmiDetails.frequency === 'Half-Yearly' ? 2 : 1);
          const interest = dueAmount * (interestRate / 100) * tenureYears;
          const totalWithInterest = (dueAmount + interest).toFixed(2);
          updatedEmiDetails.totalWithInterest = totalWithInterest;
          const baseAmount = Math.floor((totalWithInterest / numInstallments) * 100) / 100;
          const lastInstallmentAmount = (totalWithInterest - (baseAmount * (numInstallments - 1))).toFixed(2);
          const startDate = prevState.orderDate ? new Date(prevState.orderDate) : new Date();
          updatedEmiDetails.installments = Array.from({ length: numInstallments }, (_, i) => {
            const dueDate = new Date(startDate);
            if (updatedEmiDetails.frequency === 'Monthly') {
              dueDate.setMonth(startDate.getMonth() + i + 1);
            } else if (updatedEmiDetails.frequency === 'Quarterly') {
              dueDate.setMonth(startDate.getMonth() + (i + 1) * 3);
            } else if (updatedEmiDetails.frequency === 'Half-Yearly') {
              dueDate.setMonth(startDate.getMonth() + (i + 1) * 6);
            } else if (updatedEmiDetails.frequency === 'Yearly') {
              dueDate.setFullYear(startDate.getFullYear() + i + 1);
            }
            return {
              amount: i === numInstallments - 1 ? lastInstallmentAmount : baseAmount.toFixed(2),
              dueDate,
              status: 'Unpaid',
              paymentMethod: '',
              paymentReference: '',
              paymentNote: ''
            };
          });
          const installmentTotal = updatedEmiDetails.installments.reduce((sum, i) => sum + parseFloat(i.amount), 0);
          if (Math.abs(installmentTotal - parseFloat(totalWithInterest)) > 0.01) {
            console.warn('Installment total mismatch:', installmentTotal, totalWithInterest);
          }
        } else {
          updatedEmiDetails.installments = [];
          updatedEmiDetails.totalWithInterest = prevState.dueAmount || '0';
        }
      }
      return { ...prevState, emiDetails: updatedEmiDetails };
    });
  };

  useEffect(() => {
    if (purchaseOrder.modeOfPayment === 'EMI' && Array.isArray(purchaseOrder.emiDetails?.installments) && purchaseOrder.emiDetails.installments.length > 0) {
      const numInstallments = purchaseOrder.emiDetails.installments.length;
      const dueAmount = parseFloat(purchaseOrder.dueAmount || 0);
      const interestRate = purchaseOrder.emiDetails.interestRate || 0;
      const tenureYears = numInstallments / (purchaseOrder.emiDetails.frequency === 'Monthly' ? 12 : purchaseOrder.emiDetails.frequency === 'Quarterly' ? 4 : purchaseOrder.emiDetails.frequency === 'Half-Yearly' ? 2 : 1);
      const interest = dueAmount * (interestRate / 100) * tenureYears;
      const totalWithInterest = (dueAmount + interest).toFixed(2);
      const baseAmount = Math.floor((totalWithInterest / numInstallments) * 100) / 100;
      const lastInstallmentAmount = (totalWithInterest - (baseAmount * (numInstallments - 1))).toFixed(2);
      setPurchaseOrder(prevState => ({
        ...prevState,
        emiDetails: {
          ...prevState.emiDetails,
          totalWithInterest,
          installments: prevState.emiDetails.installments.map((installment, i) => ({
            ...installment,
            amount: i === numInstallments - 1 ? lastInstallmentAmount : baseAmount.toFixed(2)
          }))
        }
      }));
    }
  }, [purchaseOrder.dueAmount, purchaseOrder.emiDetails?.interestRate, purchaseOrder.emiDetails?.frequency, purchaseOrder.modeOfPayment, setPurchaseOrder]);

  const handleDiscountChange = (event) => {
    const value = event.target.value;
    if (parseFloat(value) < 0) return;
    setPurchaseOrder(prevState => {
      const discount = value || '0';
      const totalAmount = Math.max(0, parseFloat(prevState.totalAmount || 0) + parseFloat(prevState.discount || 0) - parseFloat(discount)).toFixed(2);
      const dueAmount = Math.max(0, parseFloat(totalAmount) - parseFloat(prevState.paidAmount || 0)).toFixed(2);
      return {
        ...prevState,
        discount,
        totalAmount,
        dueAmount,
        paymentStatus: parseFloat(prevState.paidAmount) >= parseFloat(totalAmount) ? 'Paid' : parseFloat(prevState.paidAmount) > 0 ? 'Partially Paid' : 'UnPaid'
      };
    });
  };

  const handlePaidAmountChange = (event) => {
    const value = event.target.value;
    if (parseFloat(value) < 0) return;
    setPurchaseOrder(prevState => {
      const paidAmount = value || '0';
      const dueAmount = Math.max(0, parseFloat(prevState.totalAmount || 0) - parseFloat(paidAmount)).toFixed(2);
      if (prevState.emiDetails.installments.length > 0) {
        setAlert({ message: 'Changing paid amount will reset EMI installments. Please reselect number of installments.', type: 'warning' });
      }
      return {
        ...prevState,
        paidAmount,
        dueAmount,
        paymentStatus: parseFloat(paidAmount) >= parseFloat(prevState.totalAmount) ? 'Paid' : parseFloat(paidAmount) > 0 ? 'Partially Paid' : 'UnPaid',
        emiDetails: {
          ...prevState.emiDetails,
          installments: [],
          totalWithInterest: dueAmount
        }
      };
    });
  };

  const handlePay = async () => {
    if (!purchaseOrder._id) {
      setAlert({ message: 'Please save the purchase order first.', type: 'error' });
      return;
    }
    try {
      let amount, paymentType, modeOfPayment, paymentReference, paymentNote;
      if (paymentType === 'EMI') {
        const nextUnpaid = purchaseOrder.emiDetails?.installments?.find(installment => installment.status === 'Unpaid');
        if (!nextUnpaid) {
          setAlert({ message: 'All installments are paid.', type: 'info' });
          return;
        }
        amount = nextUnpaid.amount;
        paymentType = 'EMI';
        modeOfPayment = nextUnpaid.paymentMethod;
        paymentReference = nextUnpaid.paymentReference || '';
        paymentNote = nextUnpaid.paymentNote || '';
        if (!modeOfPayment) {
          setAlert({ message: 'Please select a payment method for the installment.', type: 'error' });
          return;
        }
      } else {
        amount = purchaseOrder.dueAmount;
        paymentType = purchaseOrder.paidAmount === '0' ? 'One-Go' : 'Initial';
        modeOfPayment = purchaseOrder.initialPaymentMethod;
        paymentReference = '';
        paymentNote = '';
        if (!modeOfPayment) {
          setAlert({ message: 'Please select a payment method.', type: 'error' });
          return;
        }
      }

      const response = await axios.post(`/api/purchaseorder/${purchaseOrder._id}/pay-installment`, {
        amount,
        modeOfPayment,
        paymentType,
        paymentReference,
        paymentNote
      });

      setPurchaseOrder(prevState => {
        let updatedInstallments = prevState.emiDetails.installments;
        if (paymentType === 'EMI') {
          updatedInstallments = prevState.emiDetails.installments.map(installment =>
            installment.dueDate === response.data.purchaseOrder.emiDetails.installments.find(i => i.status === 'Paid' && i.paymentDate).dueDate ? {
              ...installment,
              status: 'Paid',
              paymentDate: new Date(response.data.paymentHistory.paymentDate),
              paymentMethod: modeOfPayment,
              paymentReference,
              paymentNote
            } : installment
          );
        }
        const newPaidAmount = (parseFloat(prevState.paidAmount || 0) + parseFloat(amount)).toFixed(2);
        const newDueAmount = Math.max(0, parseFloat(prevState.totalAmount || 0) - parseFloat(newPaidAmount)).toFixed(2);
        return {
          ...prevState,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStatus: parseFloat(newPaidAmount) >= parseFloat(prevState.totalAmount) ? 'Paid' : parseFloat(newPaidAmount) > 0 ? 'Partially Paid' : 'UnPaid',
          emiDetails: {
            ...prevState.emiDetails,
            installments: updatedInstallments
          },
          initialPaymentMethod: paymentType === 'Initial' ? modeOfPayment : prevState.initialPaymentMethod
        };
      });
      setAlert({ message: `Payment of ₹${amount} via ${modeOfPayment} recorded on ${new Date(response.data.paymentHistory.paymentDate).toLocaleDateString()}!`, type: 'success' });
    } catch (error) {
      console.error('Error recording payment:', error);
      setAlert({ message: error.response?.data?.error || 'Failed to record payment.', type: 'error' });
    }
  };

  const totalBeforeTax = (parseFloat(purchaseOrder.totalAmount || 0) - parseFloat(purchaseOrder.taxAmount || 0)).toFixed(2);
  const cgstTotal = purchaseOrder.products.reduce((sum, p) => sum + parseFloat(p.cgstAmount || 0), 0).toFixed(2);
  const sgstTotal = purchaseOrder.products.reduce((sum, p) => sum + parseFloat(p.sgstAmount || 0), 0).toFixed(2);
  const igstTotal = purchaseOrder.products.reduce((sum, p) => sum + parseFloat(p.igstAmount || 0), 0).toFixed(2);

  return (
    <div className="mt-6 border-t pt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary & Payment Details</h2>
      {alert && <Alert message={alert.message} type={alert.type} handleClose={() => setAlert(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-bold text-gray-700 mb-2">Total Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Before Tax:</span>
              <span>₹{totalBeforeTax}</span>
            </div>
            {isIntraState ? (
              <>
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>₹{cgstTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>₹{sgstTotal}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST:</span>
                <span>₹{igstTotal}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax Amount:</span>
              <span>₹{purchaseOrder.taxAmount || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <label htmlFor="discount">Discount:</label>
              <TextInput
                id="discount"
                name="discount"
                type="number"
                value={purchaseOrder.discount || '0'}
                onChange={handleDiscountChange}
                min="0"
                className="w-[150px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Inc. Tax:</span>
              <span>₹{purchaseOrder.totalAmount || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-bold text-gray-700 mb-2">Financial Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <label htmlFor="paidAmount">Paid Amount:</label>
              <TextInput
                id="paidAmount"
                name="paidAmount"
                type="number"
                value={purchaseOrder.paidAmount || '0'}
                onChange={handlePaidAmountChange}
                min="0"
                className="w-[150px] py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
              />
            </div>
            <div className="flex justify-between">
              <span>Due Amount:</span>
              <span>₹{purchaseOrder.dueAmount || '0.00'}</span>
            </div>
            {purchaseOrder.modeOfPayment === 'EMI' && (
              <>
                <div className="flex justify-between">
                  <span>Total with Interest:</span>
                  <span>₹{purchaseOrder.emiDetails?.totalWithInterest || purchaseOrder.dueAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unpaid Installments:</span>
                  <span>{unpaidInstallmentsCount}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
          <h3 className="text-md font-bold text-gray-700 mb-2">Payment Details</h3>
          <div className="flex flex-wrap text-sm">
            <div>
              <SelectInput
                id="paymentType"
                label="Payment Type"
                options={[
                  { value: 'One-Go', label: 'One-Go' },
                  { value: 'EMI', label: 'EMI' }
                ]}
                value={paymentType}
                onChange={handlePaymentTypeChange}
                className="w-full"
              />
            </div>
            <div>
              <SelectInput
                id="initialPaymentMethod"
                name="initialPaymentMethod"
                label="Initial/One-Go Payment Method"
                options={[
                  { value: '', label: 'Select Method' },
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'Card', label: 'Card' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'UPI', label: 'UPI' }
                ]}
                value={purchaseOrder.initialPaymentMethod || ''}
                onChange={handlePaymentMethodChange}
                className="w-full"
              />
            </div>
          </div>
          {paymentType === 'EMI' && purchaseOrder.emiDetails && (
            <div className="mt-4">
              <div className="flex flex-wrap text-sm">
                <div>
                  <SelectInput
                    id="emiFrequency"
                    name="frequency"
                    label="EMI Frequency"
                    options={[
                      { value: '', label: 'Select Frequency' },
                      { value: 'Monthly', label: 'Monthly' },
                      { value: 'Quarterly', label: 'Quarterly' },
                      { value: 'Half-Yearly', label: 'Half-Yearly' },
                      { value: 'Yearly', label: 'Yearly' }
                    ]}
                    value={purchaseOrder.emiDetails?.frequency || ''}
                    onChange={handleEmiChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <TextInput
                    id="emiInstallments"
                    name="installments"
                    label="Number of Installments"
                    type="number"
                    value={purchaseOrder.emiDetails?.installments?.length || ''}
                    onChange={handleEmiChange}
                    min="1"
                  />
                </div>
                <div>
                  <TextInput
                    id="interestRate"
                    name="interestRate"
                    label="Annual Interest Rate (%)"
                    type="number"
                    value={purchaseOrder.emiDetails?.interestRate || '0'}
                    onChange={handleEmiChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              {Array.isArray(purchaseOrder.emiDetails?.installments) && purchaseOrder.emiDetails.installments.length > 0 && (
                <div className="mt-4">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2">Installment</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Due Date</th>
                        <th className="p-2">Payment Date</th>
                        <th className="p-2">Payment Method</th>
                        <th className="p-2">Payment Reference</th>
                        <th className="p-2">Payment Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrder.emiDetails.installments.map((installment, index) => (
                        <tr key={index} className={`border-b ${index === purchaseOrder.emiDetails.installments.length - 1 ? 'bg-yellow-50' : ''}`}>
                          <td className="px-2">{index + 1}</td>
                          <td className="px-2">₹{installment.amount}</td>
                          <td className="px-2">{installment.status}</td>
                          <td className="px-2">{new Date(installment.dueDate).toLocaleDateString()}</td>
                          <td className="px-2">{installment.paymentDate ? new Date(installment.paymentDate).toLocaleDateString() : '-'}</td>
                          <td className="px-2">
                            {installment.status === 'Unpaid' ? (
                              <SelectInput
                                id={`installmentPaymentMethod-${index}`}
                                name={`installmentPaymentMethod-${index}`}
                                options={[
                                  { value: '', label: 'Select Method' },
                                  { value: 'Cash', label: 'Cash' },
                                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                                  { value: 'Card', label: 'Card' },
                                  { value: 'Cheque', label: 'Cheque' },
                                  { value: 'UPI', label: 'UPI' }
                                ]}
                                value={installment.paymentMethod || ''}
                                onChange={(e) => handlePaymentMethodChange(e, index)}
                                className="w-full py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                              />
                            ) : (
                              installment.paymentMethod || '-'
                            )}
                          </td>
                          <td className="px-2">
                            {installment.status === 'Unpaid' ? (
                              <TextInput
                                id={`paymentReference-${index}`}
                                name={`paymentReference-${index}`}
                                value={installment.paymentReference || ''}
                                onChange={(e) => handlePaymentMethodChange(e, index)}
                                placeholder="Enter Reference"
                                className="w-full py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                              />
                            ) : (
                              installment.paymentReference || '-'
                            )}
                          </td>
                          <td className="px-2">
                            {installment.status === 'Unpaid' ? (
                              <TextInput
                                id={`paymentNote-${index}`}
                                name={`paymentNote-${index}`}
                                value={installment.paymentNote || ''}
                                onChange={(e) => handlePaymentMethodChange(e, index)}
                                placeholder="Enter Note"
                                className="w-full py-2 px-2 rounded-lg outline outline-1 outline-gray-200 focus:outline-1 focus:outline-customSecondary text-gray-700 text-[14px]"
                              />
                            ) : (
                              installment.paymentNote || '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handlePay}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!purchaseOrder._id || (paymentType === 'EMI' && !purchaseOrder.emiDetails?.installments?.some(i => i.status === 'Unpaid')) || purchaseOrder.dueAmount === '0'}
          >
            {paymentType === 'EMI' ? 'Pay Next Installment' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;