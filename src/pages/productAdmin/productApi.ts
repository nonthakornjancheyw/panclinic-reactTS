import axios from 'axios';

export async function GetFetch() {
  try {
    const response = await axios.get('http://localhost:3000/api/productAdmin/GetFetch');
    return response.data;
  } catch (error) {
    console.error('fetchProducts error:', error);
    throw error;
  }
}

export async function GetProduct(nameProduct?: string, categoryID?: string, brandID?: string[], statusTag?: string, page: number = 1, pageSize: number = 150) {
  try {
    const response = await axios.post('http://localhost:3000/api/productAdmin/GetProduct', {
      nameProduct,
      categoryID,
      brandID,
      statusTag,
      page,
      pageSize,
    });
    return response.data;
  } catch (error) {
    console.error('fetchProducts error:', error);
    throw error;
  }
}

