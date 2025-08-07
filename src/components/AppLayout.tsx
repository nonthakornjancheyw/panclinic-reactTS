import { Layout, Menu, Button, Dropdown, Space, message} from 'antd';
import type { ReactNode } from 'react';
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
import { useState } from 'react';
import logo from '../assets/logo-txtBlue.png';
import './component_style.css';
const { Header, Sider, Content } = Layout;

interface Props {
  children: ReactNode;
}

function AppLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const userInfo = {
    name: 'นนทกร จั่นเชย',
    employeeId: '53800001',
    branch: 'ร้อยเอ็ด',
  };
  const userMenuItems = [
    { key: 'changePassword', label: 'เปลี่ยนรหัสผ่าน' },
    { key: 'logout', label: 'Logout' },
  ];
  
  const onUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // ตัวอย่าง logout
      console.log('Logout clicked');
      message.info('Logging out...');
    } else if (key === 'changePassword') {
      console.log('Change Password clicked');
      message.info('Redirect to change password page...');
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
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
          onClick={({ key }) => navigate(key)}
          style={{ backgroundColor: '#0e8dd6ff' }}
          rootClassName="custom-menu"
          items={[
            {
              key: '/',
              icon: <WalletOutlined style={{ color: '#fff' }} />,
              label: <span style={{ color: '#fff', fontWeight: 'bold' }}>การเงิน</span>,
            },
            {
              key: '/about',
              icon: <InfoCircleOutlined style={{ color: '#fff' }} />,
              label: <span style={{ color: '#fff', fontWeight: 'bold' }}>เกี่ยวกับ</span>,
            },
            {
              key: '/productAdmin',
              icon: <AppstoreOutlined style={{ color: '#fff' }} />,
              label: <span style={{ color: '#fff', fontWeight: 'bold' }}>บริการ</span>,
            },
          ]}
        />

      </Sider>


      <Layout>
        <Header style={{ background: '#ffffffff', padding: '0 16px', zIndex: 999, 
          position: 'sticky', top: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
            <img src={logo} alt="Panclinic Logo" style={{ height: 40 }} />

            <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                <Space style={{ color: '#0e8dd6ff' }}>
                  {userInfo.employeeId}: {userInfo.name} [{userInfo.branch}] <UserOutlined />
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>

          
        </Header>
   
        <Content style={{
          padding: '8px 8px',
          overflowY: 'auto',
          height: 'calc(100vh - 64px)', // ลบความสูง header ออก (ถ้า Header สูง 64px)
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
