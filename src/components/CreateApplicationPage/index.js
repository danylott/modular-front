import './classes.css';

import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  Button, DatePicker, Spin, Table,
} from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { CREATE_APPLICATION } from '../../queries/applications';
import { CLASSES } from '../../queries/classes';

const { RangePicker } = DatePicker;

export default function CreateApplicationPage() {
  const [cookies] = useCookies();
  const [createApplication] = useMutation(CREATE_APPLICATION, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });
  const history = useHistory();

  const [selectedClasses, setSelectedClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dateStart, setDateStart] = useState();
  const [dateEnd, setDateEnd] = useState();
  const { loading, error, data } = useQuery(CLASSES, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedClasses([...selectedRows.map((cls) => cls.name)]);
    },
  };

  const dataSource = data.user.classes
    .filter((image) => image.count_labeled_images
      >= process.env.REACT_APP_MIN_COUNT_ANNOTATED_IMAGES_FOR_APPLICATION_CLASS)
    .map((cls) => ({
      key: cls._id,
      name: cls.name,
      brand: cls.make,
      status: cls.status,
      author: cls.author ? cls.author.name : 'No author',
      images: `${cls.count_labeled_images}/${cls.images.length}`,
    }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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

  async function Application() {
    setSaving(true);
    const cls = [...selectedClasses];
    const res = await createApplication(
      { variables: { date_start: dateStart, date_end: dateEnd, classes: cls } },
    );
    if (res.data.createApplication.date_created) {
      setSaving(false);
      setSelectedClasses([]);
      history.push('/applications');
    }
  }

  const disabledDate = (current) => current && current <= moment().endOf('day');

  return (
    <div className="application">
      { saving
        ? <Spin size="large" />
        : (
          <div>
            <h1>Select Classes to Create Application:</h1>
            <p>
              *note that only classes with text markup can be at application and amount
              of annotated images should be more or equal to
              {process.env.REACT_APP_MIN_COUNT_ANNOTATED_IMAGES_FOR_APPLICATION_CLASS}
            </p>
            <Table dataSource={dataSource} columns={columns} rowSelection={{ ...rowSelection }} />

            <h1>Select Time Period of Application:</h1>
            <div className="range_picker">
              <RangePicker
                onCalendarChange={(value) => {
                  value && setDateStart(value[0]);
                  value && setDateEnd(value[1]);
                }}
                disabledDate={disabledDate}
              />
            </div>

            <Button disabled={!dateEnd || !dateStart || selectedClasses.length === 0} style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }} onClick={Application}>
              Create Application
            </Button>
          </div>
        )}
    </div>
  );
}
