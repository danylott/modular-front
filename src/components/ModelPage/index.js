import './classes.css';

import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, Button, Popconfirm, message } from 'antd';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';

import { ACTIVATE_MODEL, MODELS } from '../../queries/models';
import CheckAdmin from '../CheckAdmin';

export default function ModelPage() {
  const [cookies] = useCookies();
  const [dataSource, setDataSource] = useState([]);

  const { loading, error } = useQuery(MODELS, {
    fetchPolicy: 'network-only',
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    onCompleted: (data) => {
      setDataSource(data.models.map((model) => ({
        key: model._id,
        id: model._id,
        path: model.path,
        isActive: model.is_active ? 'active' : 'not active',
        dateCreated: model.date_created,
        classes: model.classes.join(', '),
        activate: model,
      })));
    },
  });

  const [activateModel] = useMutation(ACTIVATE_MODEL, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });


  const activateModelClick = (model) => {
    activateModel({ variables: { path: model.path } })
      .then(() => {
        message.success("Model has starting activation. Please wait up to 20 sec. and restart the Page to check, if everything goes fine.")
      })
      .catch((err) => console.log(err));
  };

  const columns = [
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Is active',
      dataIndex: 'isActive',
      key: 'isActive',
    },
    {
      title: 'Classes',
      dataIndex: 'classes',
      key: 'classes',
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
    },
    {
      title: 'Activate',
      dataIndex: 'activate',
      render: (model) => (
        <Popconfirm placement="leftTop" title="Are you sure you want to activate this model?" onConfirm={() => activateModelClick(model)} okText="Yes" cancelText="No">
          <Button type="dashed" disabled={model.is_active}>
            {model.is_active ? 'Active' : 'Activate'}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className="model_page">
      <CheckAdmin />
      <h1>List of Models:</h1>
      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
}
