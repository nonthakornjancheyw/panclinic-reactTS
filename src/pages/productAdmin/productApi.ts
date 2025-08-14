import axios from 'axios';
// const BASE_URL = import.meta.env.VITE_API_DOMAIN || `http://localhost:3000`;
const BASE_URL = import.meta.env.VITE_API_DOMAIN || 'http://localhost:3001';

export async function GetFetch() {
  try {
    // const response = await axios.get(`${BASE_URL}/api/productAdmin/GetFetch`);
    const response = await axios.get(`${BASE_URL}/api/productAdmin/GetFetch`);
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}
export async function GetTag() {
  try {
    const response = await axios.get(`${BASE_URL}/api/productAdmin/GetTag`);
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}

export async function GetClass() {
  try {
    const response = await axios.get(`${BASE_URL}/api/productAdmin/GetClass`);
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}

export async function GetProduct(nameProduct?: string, categoryID?: string, brandID?: string[], statusTag?: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/GetProduct`, {
      nameProduct,
      categoryID,
      brandID,
      statusTag,
    });
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}


interface StatusResponse {
  success: boolean;
}
export async function AddTag(newTag: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddTag`, { newTag });
    return response.data;
  } catch (error) {
    console.error(`AddTag error:`, error);
    return { success: false };
  }
}

export async function AddClass(newClass: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddClass`, { newClass });
    return response.data;
  } catch (error) {
    console.error(`AddClass error:`, error);
    return { success: false };
  }
}


export async function SaveProduct(data: any): Promise<StatusResponse> {
  try {
    const response = await axios.post<StatusResponse>(
      `${BASE_URL}/api/productAdmin/SaveProduct`,
      { data }
    );
    return response.data;
  } catch (error) {
    console.error(`SaveProduct error:`, error);
    return { success: false };
  }
}


