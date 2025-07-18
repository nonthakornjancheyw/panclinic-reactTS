import { Layout, Menu, Button, Dropdown, Space, message} from 'antd';
import type { ReactNode } from 'react';
import {
  WalletOutlined,
  InfoCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo-txtBlue.png';

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
      <Sider collapsible collapsed={collapsed} trigger={null}>
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
          items={[
            { key: '/', icon: <WalletOutlined />, label: 'การเงิน' },
            { key: '/about', icon: <InfoCircleOutlined />, label: 'เกี่ยวกับ' },           
            { key: '/prodctAdmin', icon: <InfoCircleOutlined />, label: 'prodctAdmin' },
            { key: '/test', icon: <InfoCircleOutlined />, label: 'test' },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', zIndex: 1, position: 'sticky', top: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
            <img src={logo} alt="Panclinic Logo" style={{ height: 40 }} />

            <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                <Space style={{ color: '#004080' }}>
                  {userInfo.employeeId}: {userInfo.name} [{userInfo.branch}] <UserOutlined />
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>

          {/* เส้นขั้นนี้อยู่ล่าง header และจะติดอยู่ตลอด */}
          <div style={{
            height: 4,
            width: '100%',
            backgroundColor: '#004080',
            marginTop: 0,
          }} />
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
