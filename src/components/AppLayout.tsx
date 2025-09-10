// --------------------------- imports ---------------------------

import { Layout, Menu, Button, Dropdown, Space, message, Modal, Grid, Avatar, Select } from 'antd';
import {
  WalletOutlined,
  InfoCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo-txtBlue.png';
import './component_style.css';
import * as loginApi from '../pages/login/loginApi';

// --------------------------- constants ---------------------------
const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface Props {
  children: React.ReactNode;
  hasUnsavedChanges?: (() => boolean);
}

export interface Branch {
  BranchID: string;
  BranchName: string;
}

// --------------------------- component ---------------------------
function AppLayout({ children, hasUnsavedChanges }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const authen = JSON.parse(localStorage.getItem("authen") || "{}");

  // --------------------------- ตรวจสอบ session ---------------------------
  useEffect(() => {
    const isLoggedIn = authen && authen.Info && authen.Info.length > 0;
    if (!isLoggedIn) {
      // message.warning("กรุณาเข้าสู่ระบบก่อน");
      // navigate("/login");
    }
  }, []); // run once on mount

  // --------------------------- user info ---------------------------
  const userInfo = {
    name: authen?.Info?.[0]?.Name || "ไม่ทราบชื่อ",
    employeeId: authen?.Info?.[0]?.EmployeeID || "-",
    branch: authen?.Info?.[0]?.BranchNameLogin || "-",
  };

  // --------------------------- branches ---------------------------
  const [branches] = useState(() => {
    const stored = localStorage.getItem("branches");
    return stored ? JSON.parse(stored) as Branch[] : [];
  });

  // --------------------------- password memory ---------------------------
  // 🔹 เก็บรหัสผ่านชั่วคราวใน memory และ decode มาจาก localStorage
  const [passwordMemory] = useState<string>(() => {
    const pwd = localStorage.getItem("passwordMemory");
    return pwd ? atob(pwd) : '';
  });

  // --------------------------- user menu ---------------------------
  const userMenuItems = [
    { key: 'changeBranch', label: 'เปลี่ยนสาขา' },
    // { key: 'changePassword', label: 'เปลี่ยนรหัสผ่าน' },
    { key: 'logout', label: 'Logout' },
  ];

  // --------------------------- handle user menu ---------------------------
  const onUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      message.success("ออกจากระบบแล้ว");
      navigate("/login");
    } else if (key === "changeBranch") {
      let tempBranch = userInfo.branch;
      Modal.confirm({
        title: "เลือกสาขาใหม่",
        content: (
          <Select
            style={{ width: "100%" }}
            defaultValue={userInfo.branch}
            onChange={(val) => tempBranch = val}
          >
            {branches.map((b) => (
              <Select.Option key={b.BranchID} value={b.BranchID}>
                {b.BranchName}
              </Select.Option>
            ))}
          </Select>
        ),
        okText: "ตกลง",
        cancelText: "ยกเลิก",
        onOk: async () => {
          if (!tempBranch) return;

          // 🔹 ใช้ passwordMemory ที่ decode แล้ว ลง API
          try {
            const data = await loginApi.Login(userInfo.employeeId, passwordMemory, tempBranch);
            if (data.success && data.user) {

              console.log(data,'<<<')
              message.success("เปลี่ยนสาขาเป็น " + data.authen?.Info?.[0]?.BranchNameLogin);

              // อัปเดต localStorage / authen
              localStorage.setItem("branches", JSON.stringify(branches));
              localStorage.setItem("user", JSON.stringify(data.user));
              localStorage.setItem("authen", JSON.stringify(data.authen));
              localStorage.setItem("loginDate", data.loginDate || "");

              // รีเฟรชหน้าใหม่
              navigate(location.pathname);
            } else {
              message.error(data.message || "เปลี่ยนสาขาไม่สำเร็จ");
            }
          } catch (err) {
            message.error("เกิดข้อผิดพลาด: " + err);
          }
        }
      });
    }
  };

  // --------------------------- handle menu click ---------------------------
  const handleMenuClick = ({ key }: { key: string }) => {
    if (location.pathname !== '/productAdmin') {
      navigate(key);
      return;
    }
    if (location.pathname === key) return;

    if (hasUnsavedChanges) {
      Modal.confirm({
        title: "มีการแก้ไขที่ยังไม่ได้บันทึก",
        content: "คุณต้องการออกจากหน้านี้หรือไม่? ข้อมูลที่แก้ไขจะหายไป กรุณากดบันทึกก่อนย้ายหน้า",
        okText: "ออกจากหน้านี้",
        cancelText: "ยกเลิก",
        onOk: () => navigate(key),
      });
    } else {
      navigate(key);
    }
  };

  // --------------------------- render ---------------------------
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{ backgroundColor: '#0e8dd6ff' }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '0 8px',
            color: '#fff',
          }}
        >
          {!collapsed && <span style={{ fontWeight: 'bold' }}>Pan Clinic</span>}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#fff' }}
          />
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{ backgroundColor: '#0e8dd6ff' }}
          rootClassName="custom-menu"
          items={[
            {
              key: '/productAdmin',
              icon: <AppstoreOutlined style={{ color: '#fff' }} />,
              label: <span style={{ color: '#fff', fontWeight: 'bold' }}>บริการ</span>,
            },
            {
              key: '/finance',
              icon: <WalletOutlined style={{ color: '#fff' }} />,
              label: <span style={{ color: '#fff', fontWeight: 'bold' }}>การเงิน</span>,
            },
            {
              key: '/about',
              icon: <InfoCircleOutlined style={{ color: '#fff' }} />,
              label: <span style={{ color: '#fff', fontWeight: 'bold' }}>เกี่ยวกับ</span>,
            },
          ]}
        />
      </Sider>

      {/* Main layout */}
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            zIndex: 999,
            position: 'sticky',
            top: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
            <img src={logo} alt="Panclinic Logo" style={{ height: 40 }} />

            <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                <Space style={{ color: '#0e8dd6ff' }}>
                  {screens.md ? (
                    <>
                      {userInfo.employeeId}: {userInfo.name} [{userInfo.branch}] <UserOutlined />
                      <DownOutlined />
                    </>
                  ) : (
                    <>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <DownOutlined />
                    </>
                  )}
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            padding: '8px 8px',
            overflowY: 'auto',
            height: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
