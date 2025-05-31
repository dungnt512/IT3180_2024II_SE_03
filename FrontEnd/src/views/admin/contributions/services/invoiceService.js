import api from 'services/apiConfig';

/**
 * Get invoice details by ID
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Invoice details
 */
export const getInvoiceById = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

/**
 * Mark invoice as paid
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Result of the operation
 */
export const markInvoiceAsPaid = async (id) => {
  try {
    const response = await api.post(`/invoices/${id}/mark-paid`);
    return response.data;
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }
};

/**
 * View invoice details (wrapper function for getInvoiceById)
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Invoice details
 */
export const viewInvoice = async (id) => {
  return getInvoiceById(id);
};

/**
 * Download invoice as PDF
 * @param {number} id - Invoice ID
 * @returns {Promise<Blob>} PDF blob
 */
export const downloadInvoicePdf = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}/downloadPdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    throw error;
  }
};

export default {
  getInvoiceById,
  markInvoiceAsPaid,
  viewInvoice,
  downloadInvoicePdf
}; 