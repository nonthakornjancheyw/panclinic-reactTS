import axios from 'axios';
// const BASE_URL = import.meta.env.VITE_API_DOMAIN || `http://localhost:3000`;
import { BASE_URL } from '../../config/api';

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

export async function GetOption() {
  try {
    const response = await axios.get(`${BASE_URL}/api/productAdmin/GetOption`);
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

// #region Tag ========================//#
export async function AddTag(newTag: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddTag`, { newTag });
    return response.data;
  } catch (error) {
    console.error(`AddTag error:`, error);
    return { success: false };
  }
}
export async function EditTag(tagId: string, tagName: string) {
  try {
    const response = await axios.put(`${BASE_URL}/api/productAdmin/EditTag`, {
      tagId,
      tagName,
    });
    return response.data;
  } catch (error) {
    console.error("EditTag error:", error);
    return { success: false };
  }
}
export async function DeleteTag(tagId: string) {
  try {
    const response = await axios.request({
      url: `${BASE_URL}/api/productAdmin/DeleteTag`,
      method: "delete",
      data: { tagId }
    });
    return response.data;
  } catch (error) {
    console.error("DeleteTag error:", error);
    return { success: false };
  }
}
// #endregion


// #region Class ========================//
export async function AddClass(newClass: string, categoryID?: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddClass`, { newClass, categoryID });
    return response.data;
  } catch (error) {
    console.error(`AddClass error:`, error);
    return { success: false };
  }
}
export async function EditClass(rptClassID: string, rptClassName: string, rptCategoryID?: string) {
  try {
    const response = await axios.put(`${BASE_URL}/api/productAdmin/EditClass`, { rptClassID, rptClassName, rptCategoryID });
    return response.data;
  } catch (error) {
    console.error(`EditClass error:`, error);
    return { success: false };
  }
}
export async function DeleteClass(rptClassID: string) {
  try {
    const response = await axios.request({
      url: `${BASE_URL}/api/productAdmin/DeleteClass`,
      method: "delete",
      data: { rptClassID }
    });
    return response.data;
  } catch (error) {
    console.error("DeleteClass error:", error);
    return { success: false };
  }
}
// #endregion


// #region DayUse ========================//
export async function AddDayUse(DayValue: string, Label: string, Color: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddDayUse`, { DayValue, Label, Color });
    return response.data;
  } catch (error) {
    console.error(`AddDayUse error:`, error);
    return { success: false };
  }
}
export async function EditDayUse(oldDayValue: string, newDayValue: string, Label: string, Color: string)  {
  try {
    const response = await axios.put(`${BASE_URL}/api/productAdmin/EditDayUse`, { oldDayValue, newDayValue, Label, Color });
    return response.data;
  } catch (error) {
    console.error(`EditDayUse error:`, error);
    return { success: false };
  }
}
export async function DeleteDayUse(DayValue: string)  {
  try {
    const response = await axios.request({
      url: `${BASE_URL}/api/productAdmin/DeleteDayUse`,
      method: "delete",
      data: { DayValue }
    });
    return response.data;
  } catch (error) {
    console.error(`DeleteDayUse error:`, error);
    return { success: false };
  }
}
// #endregion


// #region Frequency ========================//
export async function AddFrequency(FrequencyValue: string, Label: string, Color: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddFrequency`, { FrequencyValue, Label, Color });
    return response.data;
  } catch (error) {
    console.error(`AddFrequency error:`, error);
    return { success: false };
  }
}
export async function EditFrequency(oldFrequencyValue: string, newFrequencyValue: string, Label: string, Color: string) {
  try {
    const response = await axios.put(`${BASE_URL}/api/productAdmin/EditFrequency`, { oldFrequencyValue, newFrequencyValue, Label, Color });
    return response.data;
  } catch (error) {
    console.error(`EditFrequency error:`, error);
    return { success: false };
  }
}
export async function DeleteFrequency(FrequencyValue: string) {
  try {
    const response = await axios.request({
      url: `${BASE_URL}/api/productAdmin/DeleteFrequency`,
      method: "delete",
      data: { FrequencyValue }
    });
    return response.data;
  } catch (error) {
    console.error(`DeleteFrequency error:`, error);
    return { success: false };
  }
}
// #endregion


// #region Time ========================//
export async function AddTime(TimeValue: string, Label: string, Color: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/productAdmin/AddTime`, { TimeValue, Label, Color });
    return response.data;
  } catch (error) {
    console.error(`AddTime error:`, error);
    return { success: false };
  }
}
export async function EditTime(oldTimeValue: string, newTimeValue: string, Label: string, Color: string) {
  try {
    const response = await axios.put(`${BASE_URL}/api/productAdmin/EditTime`, { oldTimeValue, newTimeValue, Label, Color });
    return response.data;
  } catch (error) {
    console.error(`EditTime error:`, error);
    return { success: false };
  }
}
export async function DeleteTime(TimeValue: string) {
  try {
    const response = await axios.request({
      url: `${BASE_URL}/api/productAdmin/DeleteTime`,
      method: "delete",
      data: { TimeValue }
    });
    return response.data;
  } catch (error) {
    console.error(`DeleteTime error:`, error);
    return { success: false };
  }
}
// #endregion


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


