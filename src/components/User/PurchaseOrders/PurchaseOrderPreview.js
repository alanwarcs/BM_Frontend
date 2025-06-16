import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PurchaseOrderPreview = ({ data }) => {
    const [businessDetails, setBusinessDetails] = useState(null);
    const [vendorDetails, setVendorDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    //Fetch details of vendor and business from backend as per PO Data
    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                const response = await axios.get('/api/business/summary');
                if (!response.data || !response.data.summary) {
                    throw new Error('Business details not found');
                }
                setBusinessDetails(response.data.summary);
            } catch (error) {
                console.error('Error fetching business details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchVendorDetails = async () => {
            try {
                const response = await axios.get(`/api/vendor/getVendorDetails/${data.vendorId}`);
                if (!response.data.vendorDetails) {
                    throw new Error('Vendor details not found');
                }
                setVendorDetails(response.data.vendorDetails);
            } catch (error) {
                console.error('Error fetching vendor details:', error);
            }
        };
        fetchVendorDetails();
        fetchBusinessDetails();
    }, [data?.vendorId]);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }
    if (!businessDetails) {
        return <div className="p-4 text-red-500">Failed to load business details</div>;
    }
    if (!vendorDetails) {
        return <div className="p-4 text-red-500">Failed to load vendor details</div>;
    }

    // Determine tax type and whether to show discount in product table
    const hasCustomTax = data.products.some(product =>
        product.taxes.some(tax => tax.type === 'custom')
    );
    const hasIGST = data.products.some(product =>
        product.taxes.some(tax => tax.type === 'IGST')
    );
    const hasGST = data.products.some(product =>
        product.taxes.some(tax => tax.type === 'GST')
    );
    const hasProductDiscount = data.discountType === 'Product' && data.products.some(product =>
        parseFloat(product.inProductDiscount) > 0
    );
    const hasTotalDiscount = hasProductDiscount || (parseFloat(data.discount) > 0 && data.discountType === 'Flat');

    // Calculate product discount amount for each product
    const calculateProductDiscountAmount = (product) => {
        const quantity = parseFloat(product.quantity) || 0;
        const rate = parseFloat(product.rate) || 0;
        const discountValue = parseFloat(product.inProductDiscount) || 0;
        const baseAmount = quantity * rate;
        if (product.inProductDiscountValueType === 'Percent') {
            return (baseAmount * (discountValue / 100)).toFixed(2);
        }
        return discountValue.toFixed(2);
    };

    // Calculate flat discount amount
    const calculateFlatDiscountAmount = () => {
        if (data.discountType === 'Flat' && parseFloat(data.discount) > 0) {
            if (data.discountValueType === 'Percent') {
                const subtotalExclTax = parseFloat(data.totalAmount - data.taxAmount) || 0;
                return ((subtotalExclTax * parseFloat(data.discount)) / 100).toFixed(2);
            }
            return parseFloat(data.discount).toFixed(2);
        }
        return '0.00';
    };

    // Calculate total tax amounts
    const totalCustomTax = data.products
        .reduce((sum, product) => {
            const customTax = product.taxes.find(tax => tax.type === 'custom')?.amount || 0;
            return sum + parseFloat(customTax);
        }, 0)
        .toFixed(2);
    const totalCGST = data.products
        .reduce((sum, product) => {
            const cgst = product.taxes.find(tax => tax.subType === 'CGST')?.amount || 0;
            return sum + parseFloat(cgst);
        }, 0)
        .toFixed(2);
    const totalSGST = data.products
        .reduce((sum, product) => {
            const sgst = product.taxes.find(tax => tax.subType === 'SGST')?.amount || 0;
            return sum + parseFloat(sgst);
        }, 0)
        .toFixed(2);
    const totalIGST = data.products
        .reduce((sum, product) => {
            const igst = product.taxes.find(tax => tax.subType === 'IGST')?.amount || 0;
            return sum + parseFloat(igst);
        }, 0)
        .toFixed(2);

    return (
        <div className="purchase-order relative">
            {/* Watermark */}
            <div className="watermark-preview">
                PREVIEW
            </div>

            <h2>Purchase Order</h2>
            {/* Header Table with Borders */}
            <table className="header-table" border="1" style={{ position: 'relative', zIndex: 1 }}>
                <tbody>
                    <tr>
                        <td colSpan="6" rowSpan="2" className="company-info">
                            <div>
                                <p style={{ fontWeight: 'bold' }}>{businessDetails.organizationName}</p>
                                <p style={{ maxWidth: '250px' }}>{businessDetails.address.address}</p>
                                <p>{businessDetails.address.region}, {businessDetails.address.country} - {businessDetails.address.pincode}.</p>
                                <p>Phone: {businessDetails.phone}</p>
                                <p>Email: {businessDetails.email}</p>
                                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                    GSTIN: {businessDetails.gstin}
                                </p>
                            </div>
                        </td>
                        <td colSpan="4" className="order-details">
                            <p style={{ fontWeight: 'bold' }}>Order Number: {data.purchaseOrderNumber}</p>
                            <p style={{ fontWeight: 'bold' }}>Reference Number: {data.referenceNumber || '-'}</p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="order-details">
                            <p style={{ fontWeight: 'bold' }}>Order Date: {data.orderDate}</p>
                            <p style={{ fontWeight: 'bold' }}>Due Date: {data.dueDate || '-'}</p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="6" className="vendor-info">
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Vendor To:</p>
                            <p style={{ fontWeight: 'bold' }}>{data.vendorName}</p>
                            <p style={{ maxWidth: '250px' }}>{vendorDetails.billingAddress.addressLine1}</p>
                            <p style={{ maxWidth: '250px' }}>{vendorDetails.billingAddress.city}, {vendorDetails.billingAddress.state}, {vendorDetails.billingAddress.country} - {vendorDetails.billingAddress.postalCode}</p>
                            <p>Phone: {vendorDetails.phone}</p>
                            <p>Email: {vendorDetails.emailAddress}</p>
                            <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
                                GSTIN: {vendorDetails.taxDetails.gstin || 'Not Provided'}
                            </p>
                            <p style={{ fontWeight: 'bold' }}>PAN: {vendorDetails.taxDetails.panNumber}</p>
                            <p style={{ fontWeight: 'bold' }}>Place of Supply: {data.deliveryState}</p>
                        </td>
                        <td colSpan="2" className="bill-to">
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Bill To:</p>
                            <p style={{ fontWeight: 'bold' }}>{businessDetails.organizationName}</p>
                            <p style={{ maxWidth: '250px' }}>{data.billingAddress}</p>
                        </td>
                        <td colSpan="2" className="ship-to">
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Ship To:</p>
                            <p style={{ fontWeight: 'bold' }}>{businessDetails.organizationName}</p>
                            <p style={{ maxWidth: '250px' }}>{data.shippingAddress}</p>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Product Table */}
            <table className="no-inner-borders" border="1" style={{ position: 'relative', zIndex: 1 }}>
                <thead>
                    <tr>
                        <th>Sr No.</th>
                        <th>Description</th>
                        <th>HSN/SAC</th>
                        <th>Rate</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        {hasGST && (
                            <>
                                <th>CGST</th>
                                <th>SGST</th>
                            </>
                        )}
                        {hasIGST && <th>IGST</th>}
                        {hasCustomTax && <th>Other Tax</th>}
                        {hasProductDiscount && <th>Discount</th>}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody style={{ textAlign: 'start' }}>
                    {data.products && data.products.length > 0 ? (
                        data.products.map((product, index) => {
                            const cgst = product.taxes.find(tax => tax.subType === 'CGST');
                            const sgst = product.taxes.find(tax => tax.subType === 'SGST');
                            const igst = product.taxes.find(tax => tax.subType === 'IGST');
                            const customTax = product.taxes.find(tax => tax.type === 'custom');
                            const discount = parseFloat(product.inProductDiscount) || 0;
                            const discountAmount = calculateProductDiscountAmount(product);
                            const discountDisplay = discount > 0
                                ? product.inProductDiscountValueType === 'Percent'
                                    ? `${discount.toFixed(2)}% (₹${discountAmount})`
                                    : `₹${discount.toFixed(2)}`
                                : '0';
                            return (
                                <tr key={product.productId || index}>
                                    <td>{index + 1}</td>
                                    <td style={{ padding: 2 }}>{product.productName || 'N/A'}</td>
                                    <td>{product.hsnOrSacCode || '-'}</td>
                                    <td>{parseFloat(product.rate).toFixed(2)}</td>
                                    <td>{parseFloat(product.quantity).toFixed(2)}</td>
                                    <td>{product.unit || 'pcs'}</td>
                                    {hasGST && (
                                        <>
                                            <td>
                                                {cgst ? `${parseFloat(cgst.amount).toFixed(2)} (${cgst.rate.toFixed(2)}%)` : '0.00(0%)'}
                                            </td>
                                            <td>
                                                {sgst ? `${parseFloat(sgst.amount).toFixed(2)} (${sgst.rate.toFixed(2)}%)` : '0.00(0%)'}
                                            </td>
                                        </>
                                    )}
                                    {hasIGST && (
                                        <td>
                                            {igst ? `${parseFloat(igst.amount).toFixed(2)} (${igst.rate.toFixed(2)}%)` : '0.00(0%)'}
                                        </td>
                                    )}
                                    {hasCustomTax && (
                                        <td>
                                            {customTax ? `${parseFloat(customTax.amount).toFixed(2)} (${customTax.rate.toFixed(2)}%)` : '0.00(0%)'}
                                        </td>
                                    )}
                                    {hasProductDiscount && <td>{discountDisplay}</td>}
                                    <td>{parseFloat(product.totalPrice).toFixed(2)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={6 + (hasCustomTax ? 1 : 0) + (hasGST ? 2 : 0) + (hasIGST ? 1 : 0) + (hasProductDiscount ? 1 : 0)} style={{ textAlign: 'center' }}>
                                No products available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Subtotal Table */}
            <table className="subtotal-table" style={{ position: 'relative', zIndex: 1 }}>
                <tbody>
                    <tr>
                        <td rowSpan={(hasCustomTax ? 1 : 0) + (hasGST ? 2 : 0) + (hasIGST ? 1 : 0) + (hasTotalDiscount ? 1 : 0) + (data.roundOff ? 1 : 0) + 1 + 1} style={{ width: '60%' }}>
                            <p style={{ fontWeight: 'bold' }}>Notes</p>
                            <p>{data.note || '-'}</p>
                        </td>
                        <td className="subtotal">Subtotal(Excl. Tax & Discount)</td>
                        <td style={{ textAlign: 'end' }}>
                            {data.products && data.products.length > 0
                                ? parseFloat(
                                    data.products.reduce((sum, product) => {
                                        const quantity = parseFloat(product.quantity) || 0;
                                        const rate = parseFloat(product.rate) || 0;
                                        return sum + quantity * rate;
                                    }, 0)
                                ).toFixed(2)
                                : '0.00'}
                        </td>
                    </tr>
                    {hasTotalDiscount && (
                        <tr>
                            <td className="subtotal">Discount</td>
                            <td style={{ textAlign: 'end' }}>
                                {data.discountType === 'Flat' && parseFloat(data.discount) > 0 && data.discountValueType === 'Percent'
                                    ? `${parseFloat(data.discount).toFixed(2)}% (-${calculateFlatDiscountAmount()})`
                                    : parseFloat(data.totalAmountOfDiscount).toFixed(2)}
                            </td>
                        </tr>
                    )}
                    {hasGST && (
                        <>
                            <tr>
                                <td className="subtotal">Total CGST</td>
                                <td style={{ textAlign: 'end' }}>{totalCGST}</td>
                            </tr>
                            <tr>
                                <td className="subtotal">Total SGST</td>
                                <td style={{ textAlign: 'end' }}>{totalSGST}</td>
                            </tr>
                        </>
                    )}
                    {hasIGST && (
                        <tr>
                            <td className="subtotal">Total IGST</td>
                            <td style={{ textAlign: 'end' }}>{totalIGST}</td>
                        </tr>
                    )}
                    {hasCustomTax && (
                        <tr>
                            <td className="subtotal">Other Tax</td>
                            <td style={{ textAlign: 'end' }}>{totalCustomTax}</td>
                        </tr>
                    )}
                    {data.roundOff && (
                        <tr>
                            <td className="subtotal">Round Off</td>
                            <td style={{ textAlign: 'end' }}>{parseFloat(data.roundOffAmount).toFixed(2)}</td>
                        </tr>
                    )}
                    <tr>
                        <td className="subtotal">Total</td>
                        <td style={{ textAlign: 'end', fontWeight: 'bold' }}>₹{parseFloat(data.totalAmount).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <table className="header-table" border="1" style={{ position: 'relative', zIndex: 1 }}>
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'start', padding: '10px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Payment Terms</p>
                            <p style={{ marginTop: '0' }}>{data.paymentTerms}</p>
                        </td>
                        <td style={{ textAlign: 'start', padding: '10px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Delivery Terms</p>
                            <p style={{ marginTop: '0' }}>{data.deliveryTerms}</p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Terms and Conditions</p>
                            <p style={{ marginTop: '0' }}>
                                {data.termsAndConditions || 'No terms and conditions provided.'}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="1" style={{ textAlign: 'center', padding: '10px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Authorized Signature</p>
                            <p style={{ marginTop: '0' }}>_________________________</p>
                        </td>
                        <td colSpan="1" style={{ textAlign: 'center', padding: '10px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Vendor Signature</p>
                            <p style={{ marginTop: '0' }}>__________________</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default PurchaseOrderPreview;