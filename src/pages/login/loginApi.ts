import axios from "axios";
// const BASE_URL = import.meta.env.VITE_API_DOMAIN || "http://localhost:3001";
import { BASE_URL } from '../../config/api';

export interface Branch {
  BranchID: string;
  BranchName: string;
}

export async function GetBranches(): Promise<Branch[]> {
  try {
    const res = await axios.get<Branch[]>(`${BASE_URL}/api/login/GetBranches`);
    return res.data;
  } catch (err) {
    console.error("GetBranches error:", err);
    throw err;
  }
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    EmployeeID: string;
    Name: string;
    Surname?: string;
    [key: string]: any;
  };
  authen?: {
    Info: any[];
    RolePage: any[];
    DistinctRoles: string[];
    Branch: any[];
  };
  loginDate?: string;
}

export async function Login(username: string, password: string, branchID: string): Promise<LoginResponse> 
{
  try {
    let ip = window.location.hostname;
    // ถ้าเป็น localhost
    if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
      ip = "172.16.1.101";
    }
    const res = await axios.post<LoginResponse>(`${BASE_URL}/api/login/Login`, {
      username,
      password,
      branchID,
      ip,
    });

    return res.data;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

