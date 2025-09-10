import axios from "axios";
import { BASE_URL } from '../../config/api';

const authen = JSON.parse(localStorage.getItem("authen") || "{}");
const branchID = authen?.Info?.[0]?.BranchIDLogin;

export async function GetMenu() {
  try {
    const res = await axios.get(`${BASE_URL}/api/finance/GetMenu`, {
      params: { BranchID: branchID } // ส่งเป็น query string
    });

    return res.data;
  } catch (err) {
    console.error("GetBranches error:", err);
    throw err;
  }
}

export async function GetProduct(href: string, maingroup: string, brand: string, cls: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/finance/GetProduct`, { href, branchID, maingroup, brand, class: cls });
    return response.data;
  } catch (error) {
    console.error(`GetProduct error:`, error);
    return { success: false };
  }
}

export async function GetCustomer(customerID: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/finance/GetCustomer`, { customerID });
    return response.data;
  } catch (error) {
    console.error(`GetCustomer error:`, error);
    return { success: false };
  }
}

export async function SaveReceipt(customerID: string, allTotal: number, paymentDetail: any[], productDetail: any[]) {
  try {
    const response = await axios.post(`${BASE_URL}/api/finance/SaveReceipt`, { branchID, customerID, allTotal, paymentDetail, productDetail });
    return response.data;
  } catch (error) {
    console.error(`SaveReceipt error:`, error);
    return { success: false };
  }
}