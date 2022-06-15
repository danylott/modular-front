import './sidebar.css';

import {
  BarcodeOutlined,
  FallOutlined,
  ForkOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  PieChartOutlined,
  UserOutlined,
  PicLeftOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import { useQuery } from '@apollo/react-hooks';
import { Menu } from 'antd';
import React from 'react';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';

import { USER } from '../../queries/users';

export default function SideBar() {
  const history = useHistory();
  const [cookies, removeCookie] = useCookies();
  const { loading, error, data } = useQuery(USER, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
  });

  const logOut = () => {
    removeCookie('token');
    history.push('/');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className="sidebar">
      <Menu>
        <Menu.Item key="0">
          <img alt="Krack logo" style={{ width: '180px' }} src={`${process.env.REACT_APP_IMAGES_URL}krack.svg`} />
        </Menu.Item>

        <Menu.Item key="1" icon={<PieChartOutlined />}>
          <Link to="/classes">Classes</Link>
        </Menu.Item>

        <Menu.Item key="2" icon={<PicLeftOutlined />}>
          <Link to="/improved-class">Improved Class</Link>
        </Menu.Item>

        {/* {data.user.is_admin && (
          <Menu.Item key="2" icon={<FileJpgOutlined />}>
            <Link to="/image">Text Markup</Link>
          </Menu.Item>
        )}
         */}
        {data.user.is_admin && (
          <Menu.Item key="3" icon={<FallOutlined />}>
            <Link to="/demo">Evaluation</Link>
          </Menu.Item>
        )}

        {data.user.is_admin && (
          <Menu.Item key="4" icon={<BarcodeOutlined />}>
            <Link to="/barcode">Barcode Demo</Link>
          </Menu.Item>
        )}

        {data.user.is_admin && (
          <Menu.Item key="5" icon={<ForkOutlined />}>
            <Link to="/models">Models</Link>
          </Menu.Item>
        )}

        {data.user.is_admin && (
          <Menu.Item key="6" icon={<UserOutlined />}>
            <Link to="/users">Users</Link>
          </Menu.Item>
        )}

        <Menu.Item key="7" icon={<OrderedListOutlined />}>
          <Link to="/applications">Applications</Link>
        </Menu.Item>

        <Menu.Item key="8" icon={<LaptopOutlined />}>
          <Link to="/computers">Computers</Link>
        </Menu.Item>

        <Menu.Item key="9" onClick={() => logOut()} icon={<LogoutOutlined />}>
          Log Out
        </Menu.Item>
      </Menu>
    </div>
  );
}
