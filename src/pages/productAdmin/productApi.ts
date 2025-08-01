import axios from 'axios';
// const BASE_URL = import.meta.env.VITE_API_DOMAIN || `http://localhost:3000`;


export async function GetFetch() {
  try {
    // const response = await axios.get(`http://localhost:3000/api/productAdmin/GetFetch`);
    const response = await axios.get(`http://localhost:3000/api/productAdmin/GetFetch`);
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}
export async function GetTag() {
  try {
    const response = await axios.get(`http://localhost:3000/api/productAdmin/GetTag`);
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}

export async function GetProduct(nameProduct?: string, categoryID?: string, brandID?: string[], statusTag?: string, page: number = 1, pageSize: number = 150) {
  try {
    const response = await axios.post(`http://localhost:3000/api/productAdmin/GetProduct`, {
      nameProduct,
      categoryID,
      brandID,
      statusTag,
      page,
      pageSize,
    });
    return response.data;
  } catch (error) {
    console.error(`fetchProducts error:`, error);
    throw error;
  }
}


interface AddTagResponse {
  success: boolean;
}
export async function AddTag(newTag: string): Promise<AddTagResponse> {
  try {
    const response = await axios.post<AddTagResponse>(`http://localhost:3000/api/productAdmin/AddTag`, { newTag });
    return response.data;
  } catch (error) {
    console.error(`AddTag error:`, error);
    return { success: false };
  }
}

export async function SaveProduct(data: any): Promise<AddTagResponse> {
  try {
    const response = await axios.post<AddTagResponse>(
      `http://localhost:3000/api/productAdmin/SaveProduct`,
      { data }
    );
    return response.data;
  } catch (error) {
    console.error(`SaveProduct error:`, error);
    return { success: false };
  }
}


