import './classes.css';

import { PlusCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/react-hooks';
import { Button, Input, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';

import { COMPUTERS } from '../../queries/computers';

export default function ComputersPage() {
  const [cookies] = useCookies();
  const { loading, error, data } = useQuery(COMPUTERS, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const computers = data && data.computers.map((computer) => ({
    key: computer._id,
    position: computer.position,
    name: computer.name,
    type: computer.type,
    active_model: computer.active_model.path,
  }));

  const columns = [
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Active Model',
      dataIndex: 'active_model',
      key: 'active_model',
    },
  ];

  return (
    <div className="computers-page">
      <h1>
        Computers:
      </h1>
      <Table dataSource={computers} columns={columns} />

    </div>
  );
}
