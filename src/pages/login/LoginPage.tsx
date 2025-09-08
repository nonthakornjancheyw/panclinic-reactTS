import { useState, useEffect } from "react";
import * as loginApi from './loginApi'; 
import { Button, Input, Card, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../../assets/logo-holistic.png";

const { Option } = Select;

interface Branch {
  BranchID: string;
  BranchName: string;
}

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const navigate = useNavigate();

  // 🔹 ดึง list สาขาจาก API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data: Branch[] = await loginApi.GetBranches();
        setBranches(prev => {
          const all = [...prev, ...data];
          const unique = Array.from(
            new Map(all.map(b => [b.BranchID, b])).values()
          );
          return unique;
        });
      } catch (err) {
        message.error("ไม่สามารถโหลดสาขาได้ > " + err);
      }
    };
    fetchBranches();
  }, []);



  // 🔹 handle login
  const handleLogin = async () => {
    if (!username || !password || !branch) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const data = await loginApi.Login(username, password, branch);
      const encodePassword = (pwd: string) => btoa(pwd); 
      if (data.success && data.user) {
        message.success("Login สำเร็จ! คุณ " + data.user.Name);

        // เก็บ user / authen ไว้ใน localStorage
        localStorage.setItem("branches", JSON.stringify(branches));
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("authen", JSON.stringify(data.authen));
        localStorage.setItem("loginDate", data.loginDate || "");
        localStorage.setItem("passwordMemory", encodePassword(password));
        navigate("/productAdmin");
      } else {
        message.error(data.message || "Login ไม่สำเร็จ");
      }
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการ login: " + err);
    }
  };




  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #edeef0ff, #b0e5fdff)",
        //backgroundImage: "linear-gradient(45deg, #93a5cf 0%, #e4efe9 100%)",
      }}
    >
      <Card
        style={{
          width: 350,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          textAlign: "center",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 35,
          }}
        >
          <img
            src={logo}
            alt="Holistic Logo"
            style={{ height: 70, objectFit: "contain" }}
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          autoComplete="on"
        >
          <Input
            prefix={<UserOutlined style={{ color: "#1398d6ff" }} />}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 20, borderRadius: 8 }}
            autoComplete="username"
            name="username"
          />

          <Input.Password
            prefix={<LockOutlined style={{ color: "#1398d6ff" }} />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 20, borderRadius: 8 }}
            autoComplete="current-password"
            name="password" 
          />

          <Select
            placeholder="เลือกสาขา"
            value={branch || undefined}
            onChange={(val) => setBranch(val)}
            style={{ width: "100%", marginBottom: 30, textAlign: "left" }}
          >
            {branches.map((b) => (
              <Option key={b.BranchID} value={b.BranchID}>
                {b.BranchName}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            block
            htmlType="submit"
            style={{
              fontSize: 14,
              fontWeight: "bold",
              height: 40,
              borderRadius: 8,
            }}
          >
            Log in
          </Button>
        </form>
      </Card>
    </div>
  );

}

export default LoginPage;
