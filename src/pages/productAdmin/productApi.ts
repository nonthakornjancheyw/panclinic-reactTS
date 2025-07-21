import axios from 'axios';

export async function GetRptCategory() {
  try {
    const response = await axios.get('http://localhost:3000/api/productAdmin/GetRptCategory');
    return response.data;
  } catch (error) {
    console.error('fetchProducts error:', error);
    throw error;
  }
}

export async function GetProduct() {
  try {
    const response = await axios.get('http://localhost:3000/api/productAdmin/GetProduct');
    return response.data;
  } catch (error) {
    console.error('fetchProducts error:', error);
    throw error;
  }
}