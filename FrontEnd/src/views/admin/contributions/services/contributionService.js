import api from 'services/apiConfig';

// Contribution Types API
export const getContributionTypes = async () => {
  try {
    const response = await api.get('/contribution-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching contribution types:', error);
    throw error;
  }
};

export const getActiveContributionTypes = async () => {
  try {
    const response = await api.get('/contribution-types/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active contribution types:', error);
    throw error;
  }
};

export const getContributionTypeFormData = async () => {
  try {
    const response = await api.get('/contribution-types/form-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching contribution type form data:', error);
    throw error;
  }
};

export const createContributionType = async (data) => {
  try {
    const response = await api.post('/contribution-types/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating contribution type:', error);
    throw error;
  }
};

export const getContributionTypeById = async (id) => {
  try {
    const response = await api.get(`/contribution-types/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contribution type with ID ${id}:`, error);
    throw error;
  }
};

export const updateContributionType = async (id, data) => {
  try {
    const response = await api.post(`/contribution-types/${id}/edit`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating contribution type:', error);
    throw error;
  }
};

export const deleteContributionType = async (id) => {
  try {
    const response = await api.delete(`/contribution-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contribution type:', error);
    throw error;
  }
};

// Admin Contributions API
export const getAdminContributions = async () => {
  try {
    console.log('Fetching admin contributions data...');
    const response = await api.get('/contributions/admin');
    
    // Kiểm tra và log cấu trúc dữ liệu
    console.log('Admin contributions data structure:', {
      hasContributions: !!response.data.contributions,
      contributionsCount: response.data.contributions ? response.data.contributions.length : 0,
      hasClosedContributions: !!response.data.closedContributions,
      closedContributionsCount: response.data.closedContributions ? response.data.closedContributions.length : 0
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching admin contributions:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Kiểm tra lỗi xác thực
      if (error.response.status === 403) {
        console.error('Authentication issue: No permission to access admin contributions');
      }
    }
    throw error;
  }
};

// API để lấy danh sách resident contributions cho admin
export const getResidentContributions = async () => {
  try {
    console.log('Fetching resident contributions data...');
    const response = await api.get('/contributions/admin/resident-contributions');
    return response.data.contributions || [];
  } catch (error) {
    console.error('Error fetching resident contributions:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const getAdminContributionFormData = async () => {
  try {
    const response = await api.get('/contributions/admin/form-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin contribution form data:', error);
    throw error;
  }
};

export const createAdminContribution = async (data) => {
  try {
    // Ensure field names match backend requirements
    const payload = {
      ...data,
      title: data.title,
      contributionTypeId: Number(data.contributionTypeId),
      targetAmount: data.targetAmount ? Number(data.targetAmount) : null,
    };
    
    console.log('Calling API with data:', payload);
    const response = await api.post('/contributions/admin/create', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating admin contribution:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      // Throw with more detailed error message
      throw new Error(error.response.data || 'Failed to create contribution');
    }
    throw error;
  }
};

export const createAdminContributionForAll = async (data) => {
  try {
    const response = await api.post('/contributions/admin/create-for-all', data);
    return response.data;
  } catch (error) {
    console.error('Error creating admin contribution for all:', error);
    throw error;
  }
};

export const getAdminContributionById = async (id) => {
  try {
    const response = await api.get(`/contributions/admin/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin contribution with ID ${id}:`, error);
    throw error;
  }
};

export const closeContribution = async (id) => {
  try {
    const response = await api.post(`/contributions/admin/${id}/close`);
    return response.data;
  } catch (error) {
    console.error('Error closing contribution:', error);
    throw error;
  }
};

export const cancelContribution = async (id) => {
  try {
    const response = await api.post(`/contributions/admin/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error canceling contribution:', error);
    throw error;
  }
};

export const reactivateContribution = async (id) => {
  try {
    const response = await api.post(`/contributions/admin/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error('Error reactivating contribution:', error);
    throw error;
  }
};

// User Contributions API
export const getAllContributions = async () => {
  try {
    const response = await api.get('/contributions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching all contributions:', error);
    throw error;
  }
};

export const getContributionsList = async () => {
  try {
    const response = await api.get('/contributions/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching contributions list:', error);
    throw error;
  }
};

export const filterContributions = async (filters = {}) => {
  try {
    const response = await api.get('/contributions/filter', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error filtering contributions:', error);
    throw error;
  }
};

export const getActiveContributions = async () => {
  try {
    const response = await api.get('/contributions/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active contributions:', error);
    throw error;
  }
};

export const getClosedContributions = async () => {
  try {
    const response = await api.get('/contributions/closed');
    return response.data;
  } catch (error) {
    console.error('Error fetching closed contributions:', error);
    throw error;
  }
};

export const getContributionById = async (id) => {
  try {
    const response = await api.get(`/contributions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contribution with ID ${id}:`, error);
    throw error;
  }
};

export const getUserFormData = async () => {
  try {
    const response = await api.get('/contributions/user/form-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching user form data:', error);
    throw error;
  }
};

export const createUserContribution = async (data) => {
  try {
    const response = await api.post('/contributions/user/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating user contribution:', error);
    throw error;
  }
};

export const getUserContributionById = async (id) => {
  try {
    const response = await api.get(`/contributions/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user contribution with ID ${id}:`, error);
    throw error;
  }
};

export const getContributeFormData = async (id) => {
  try {
    console.log(`Calling getContributeFormData for ID: ${id}`);
    const response = await api.get(`/contributions/user/${id}/contribute-form`);
    console.log('Contribute form data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching contribute form data:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const contributeToContribution = async (data) => {
  try {
    console.log('Sending contribution data:', data);
    const response = await api.post('/contributions/user/contribute', data);
    return response.data;
  } catch (error) {
    console.error('Error contributing to contribution:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      throw new Error(error.response.data || 'Failed to process your contribution');
    }
    throw error;
  }
};

export const exportContributionsToExcel = async (filters = {}) => {
  try {
    const response = await fetch(`${api.defaults.baseURL}/admin/export/contributions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      // body: JSON.stringify(filters),
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    // Lấy content-type và filename từ headers
    const contentType = response.headers.get('Content-Type');
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'contributions.xlsx';
    console.log('Content-Disposition:', contentDisposition);
    console.log('Content-Type:', contentType);
    console.log('Response:', response);
    console.log('Response headers:', response.headers);

    // Trích xuất filename từ Content-Disposition nếu có
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=?([^"]+)?/);
      if (filenameMatch && filenameMatch[1]) {
        // filename = filenameMatch[1].trim();
        filename = decodeURIComponent(filenameMatch[1]);
      }
    }
    
    // Chuyển response thành blob với content-type từ server
    const blob = await response.blob();
    const blobWithType = new Blob([blob], { 
      type: contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Tạo link tải xuống
    const url = window.URL.createObjectURL(blobWithType);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    
    // Giải phóng URL và xóa element
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting contributions to Excel:', error);
    throw error;
  }
};

export const updateContribution = async (id, data) => {
  try {
    const response = await api.post(`/contributions/admin/${id}/edit`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating contribution:', error);
    throw error;
  }
};

export const exportUserContributionsToExcel = async (filters = {}) => {
  try {
    const response = await fetch(`${api.defaults.baseURL}/contributions/user/export`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      // body: JSON.stringify(filters),
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    // Lấy content-type và filename từ headers
    const contentType = response.headers.get('Content-Type');
    const contentDisposition = response.headers.get('Content-Disposition');
    console.log('Content-Disposition:', contentDisposition);
    console.log('Content-Type:', contentType);
    let filename = 'user-contributions.xlsx';
    
    // Trích xuất filename từ Content-Disposition nếu có
    if (contentDisposition) {
      // Format: "attachment; filename=filename.xlsx"
      const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].trim();
      }
    }
    
    // Chuyển response thành blob với content-type từ server
    const blob = await response.blob();
    const blobWithType = new Blob([blob], { 
      type: contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Tạo link tải xuống
    const url = window.URL.createObjectURL(blobWithType);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    
    // Giải phóng URL và xóa element
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting user contributions to Excel:', error);
    throw error;
  }
};

// Hàm lấy QR code thanh toán cho contribution
export const getContributionPaymentQR = async (contributionId) => {
  try {
    const response = await api.get(`/contributions/user/${contributionId}/payment-qr`);
    return response.data;
  } catch (error) {
    console.error('Error getting contribution payment QR:', error);
    throw error;
  }
};

// Hàm download contribution dưới dạng file
export const downloadContribution = async (id, type) => {
  try {
    let endpoint = '';
    
    switch (type) {
      case 'PDF':
        endpoint = `/contributions/user/${id}/download-pdf`;
        break;
      case 'WORD':
        endpoint = `/contributions/user/${id}/download-word`;
        break;
      case 'EXCEL':
        endpoint = `/contributions/user/${id}/download-excel`;
        break;
      case 'VIEW':
        endpoint = `/contributions/user/${id}/view-pdf`;
        break;
      default:
        throw new Error('Invalid download type');
    }
    
    // Sử dụng fetch với mode: 'cors' để xử lý cross-origin
    const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Đảm bảo gửi token nếu cần
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    // Lấy content-type và filename từ headers
    const contentType = response.headers.get('Content-Type');
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `contribution-${id}`;
    
    // Trích xuất filename từ Content-Disposition nếu có
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      } else if (contentDisposition.includes('attachment')) {
        // Nếu là attachment nhưng không có filename rõ ràng
        if (type === 'PDF') filename += '.pdf';
        else if (type === 'WORD') filename += '.docx';
        else if (type === 'EXCEL') filename += '.xlsx';
      }
    } else {
      // Không có Content-Disposition, thêm extension dựa vào loại
      if (type === 'PDF') filename += '.pdf';
      else if (type === 'WORD') filename += '.docx';
      else if (type === 'EXCEL') filename += '.xlsx';
    }
    
    // Chuyển response thành blob với content-type từ server
    const blob = await response.blob();
    const blobWithType = new Blob([blob], { type: contentType || 'application/octet-stream' });
    
    // Xử lý khác nhau dựa trên loại
    if (type === 'VIEW') {
      // Đối với VIEW, mở PDF trong tab mới
      const url = window.URL.createObjectURL(blobWithType);
      window.open(url, '_blank');
      // Giải phóng URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } else {
      // Đối với DOWNLOAD, tạo link tải xuống
      const url = window.URL.createObjectURL(blobWithType);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      // Giải phóng URL và xóa element
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    
    return true;
  } catch (error) {
    console.error('Error downloading contribution:', error);
    throw error;
  }
}; 
