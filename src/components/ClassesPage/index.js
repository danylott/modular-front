import './classes.css';

import { PlusCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/react-hooks';
import { Button, Input, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';

import { CLASSES } from '../../queries/classes';

export default function ClassesPage() {
  useEffect(() => {
    window.currentClass = null;
  });

  const [cookies] = useCookies();
  const { loading, error, data } = useQuery(CLASSES, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
  });
  const history = useHistory();
  const [filterTable, setFilterTable] = useState();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const dataSource = data && data.user.classes.map((cls) => ({
    key: cls._id,
    name: cls.name,
    brand: cls.make,
    author: cls.author ? cls.author.name : 'No author',
    images: `${cls.count_labeled_images}/${cls.images.length}`,
    detail: cls,
  }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Marked Images',
      dataIndex: 'images',
      key: 'images',
    },
  ];

  data?.user.is_admin && columns.push({
    title: 'Author',
    dataIndex: 'author',
    key: 'author',
  });

  const classClick = (curentClass) => () => {
    window.currentClass = curentClass;
    history.push('/class');
  };

  columns.push({
    title: 'Details',
    dataIndex: 'detail',
    render: (cls) => (
      <Button onClick={classClick(cls)} type="primary">
        Details
      </Button>
    ),
  });

  const search = (value) => {
    setFilterTable([...dataSource.filter((o) => Object.keys(o).some((k) => k !== 'key' && k !== 'id'
        && String(o[k])
          .toLowerCase()
          .includes(value.toLowerCase())))]);
  };

  const checkEmpty = (evt) => {
    evt?.target?.value === '' && search('');
  };

  return (
    <div className="cards_page">
      <h1>
        Classes:
        <Link style={{ float: 'right', margin: 'auto 20px' }} to="/create-class">
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
          placeholder="Search by..."
          enterButton
          onSearch={search}
        />
        )}
      <Table dataSource={filterTable == null ? dataSource : filterTable} columns={columns} />

    </div>
  );
}
