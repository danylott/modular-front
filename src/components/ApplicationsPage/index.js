import './classes.css';

import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Input, Popconfirm, Table } from 'antd';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

import { APPLICATIONS, DELETE_APPLICATION } from '../../queries/applications';

export default function ApplicationsPage() {
  const [cookies] = useCookies();
  const [filterTable, setFilterTable] = useState();
  const [dataSource, setDataSource] = useState();

  const { loading, error, data } = useQuery(APPLICATIONS, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    onCompleted: (resp) => {
      setDataSource(resp.user.applications.map((app) => ({
        id: app._id,
        key: app._id,
        dateStart: app.date_start,
        dateEnd: app.date_end,
        dateCreated: app.date_created,
        classes: app.classes.join(', '),
        author: app.author ? app.author.name : 'No author',
        status: app.status,
        delete: app,
      })));
    },
    fetchPolicy: 'network-only',
  });

  const [deleteApp] = useMutation(DELETE_APPLICATION, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  const search = (value) => {
    setFilterTable([...dataSource.filter((app) => String(app.classes)
      .toLowerCase()
      .includes(value.toLowerCase())
        || String(app.author)
          .toLowerCase()
          .includes(value.toLowerCase())),
    ]);
  };

  const checkEmpty = (evt) => {
    evt?.target?.value === '' && search('');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const deleteApplication = (app) => {
    deleteApp({ variables: { id: app._id } })
      .then(() => {
        setDataSource([...dataSource.filter((old) => old.id !== app._id)]);
        setFilterTable([...filterTable.filter((old) => old.id !== app._id)]);
      })
      .catch((err) => console.log(err));
  };

  const columns = [
    {
      title: 'Date Start',
      dataIndex: 'dateStart',
      key: 'dateStart',
    },
    {
      title: 'Date End',
      dataIndex: 'dateEnd',
      key: 'dateEnd',
    },
    {
      title: 'Classes',
      dataIndex: 'classes',
      key: 'classes',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
    },
  ];

  data.user.is_admin && columns.push({
    title: 'Author',
    dataIndex: 'author',
    key: 'author',
  });

  columns.push({
    title: 'Delete',
    dataIndex: 'delete',
    render: (app) => (
      <Popconfirm placement="leftTop" title="Are you sure you want to delete this application?" onConfirm={() => deleteApplication(app)} okText="Yes" cancelText="No">
        <CloseCircleOutlined
          style={{ fontSize: 'x-large', borderRadius: '25px' }}
          className="button"
        />
      </Popconfirm>
    ),
  });

  return (
    <div className="user_page">
      <h1>
        Applications:
        <Link style={{ float: 'right', margin: 'auto 20px' }} to="/create-application">
          <PlusCircleOutlined
            style={{ fontSize: 'xxx-large', borderRadius: '25px' }}
            className="button"
          />
        </Link>
      </h1>

      {data.user && data.user.is_admin
        && (
        <Input.Search
          onChange={checkEmpty}
          style={{ border: '1px solid lightgrey', margin: '0 0 10px 0' }}
          placeholder="Search by classes or author..."
          enterButton
          onSearch={search}
        />
        )}

      <Table dataSource={filterTable == null ? dataSource : filterTable} columns={columns} />
    </div>
  );
}
