import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Upload and analyze a resume
 * @param {File} file - The resume file to upload
 * @param {string} token - Optional authentication token
 * @returns {Promise} - The analysis result
 */
export const analyzeResume = async (file, token = null) => {
  const formData = new FormData();
  formData.append('resume', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await axios.post(
      `${API_URL}/resume/analyze`,
      formData,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error.response?.data || { message: 'Failed to analyze resume' };
  }
};

/**
 * Get resume analysis status
 * @param {string} jobId - The job ID to check status for
 * @param {string} token - Authentication token
 * @returns {Promise} - The status information
 */
export const getAnalysisStatus = async (jobId, token) => {
  try {
    const response = await axios.get(`${API_URL}/resume/status/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting analysis status:', error);
    throw error.response?.data || { message: 'Failed to get analysis status' };
  }
};

/**
 * Extract skills from text
 * @param {string} text - The text to extract skills from
 * @returns {Promise} - The extracted skills
 */
export const extractSkills = async (text) => {
  try {
    const response = await axios.post(`${API_URL}/resume/skills`, { text });
    return response.data;
  } catch (error) {
    console.error('Error extracting skills:', error);
    throw error.response?.data || { message: 'Failed to extract skills' };
  }
};

/**
 * Upload and extract text from resume (simplified version)
 * @param {File} file - The resume file to upload
 * @param {string} token - Optional authentication token
 * @returns {Promise} - The extracted text
 */
export const uploadAndExtract = async (file, token = null) => {
  const formData = new FormData();
  formData.append('resume', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await axios.post(
      `${API_URL}/resume/upload`,
      formData,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error.response?.data || { message: 'Failed to upload resume' };
  }
};
