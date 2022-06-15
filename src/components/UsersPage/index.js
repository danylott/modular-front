import './classes.css';

import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { message, Popconfirm, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

import { DELETE_USER, USERS } from '../../queries/users';
import CheckAdmin from '../CheckAdmin';

export default function UsersPage() {
  const [cookies] = useCookies();
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    window.message && message.success(window.message);
    window.message = null;
  }, []);

  const [deleteU] = useMutation(DELETE_USER, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  const { loading, error } = useQuery(USERS, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    onCompleted: (data) => {
      setDataSource(data.users.map((user, idx) => ({
        id: user._id,
        key: idx,
        company: user.company,
        name: user.name,
        email: user.email,
        delete: user,
      })));
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const deleteUser = (user) => {
    deleteU({ variables: { id: user._id } })
      .then(() => {
        setDataSource([...dataSource.filter((old) => old.id !== user._id)]);
      })
      .catch((err) => console.log(err));
  };

  const columns = [
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      render: (user) => !user.is_admin
        && (
        <Popconfirm placement="leftTop" title="Are you sure you want to delete this user?" onConfirm={() => deleteUser(user)} okText="Yes" cancelText="No">
          <CloseCircleOutlined
            style={{ fontSize: 'x-large', borderRadius: '25px' }}
            className="button"
          />
        </Popconfirm>
        ),
    },
  ];

  return (
    <div className="user_page">
      <CheckAdmin />
      <h1>
        Users:
        <Link style={{ float: 'right', margin: 'auto 20px' }} to="/create-user">
          <PlusCircleOutlined
            style={{ fontSize: 'xxx-large', borderRadius: '25px' }}
            className="button"
          />
        </Link>
      </h1>

      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
}
