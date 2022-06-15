import 'react-image-crop/dist/ReactCrop.css';
import './imagePage.css';

import { InboxOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  Button,
  Divider,
  Form,
  notification,
  Select,
  Spin,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import ReactCrop from 'react-image-crop';
import { useHistory } from 'react-router-dom';

import {
  CLASSES, CROP_IMAGE, UPDATE_CLASS, UPDATE_CLASS_MARKUP,
} from '../../queries/classes';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 20 },
};

const tailLayout = {
  wrapperCol: { offset: 6, span: 1 },
};

const buttons = ['Color', 'Size', 'Model'];

export default function ImagePage() {
  const [image, setImage] = useState(window.currentImage);
  const [currentClass, setCurrentClass] = useState(window.currentClass);
  const [section, setSection] = useState();
  const [crop, setCrop] = useState();
  const [info, setInfo] = useState([]);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [form] = Form.useForm();
  const [cropping, setCropping] = useState(false);
  const [imageCroppedPath, setImageCroppedPath] = useState();
  const history = useHistory();

  const [cropStickerFromImage] = useMutation(CROP_IMAGE);

  /* eslint-disable-next-line consistent-return */
  useEffect(() => {
    if (window.currentImage) {
      setImageCroppedPath(`${window.currentImage.path_cropped}?${new Date().getTime()}`);
      // hardcode here
      const timer = setTimeout(() => {
        const { clientHeight, clientWidth } = document
          .getElementsByClassName('ReactCrop')
          .item(0);
        const selectedClassInfo = currentClass.markup
          ? currentClass.markup.map((el) => ({
            x: el.x * clientWidth,
            y: el.y * clientHeight,
            width: el.w * clientWidth,
            height: el.h * clientHeight,
            section: el.field,
          }))
          : [];
        setInfo(selectedClassInfo);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openNotificationWithIcon = (type) => {
    notification[type]({
      message: type === 'success' ? 'Success' : 'Error',
      duration: 1,
    });
  };

  const [cookies] = useCookies();
  const [updateClass] = useMutation(UPDATE_CLASS, {
    onCompleted: () => openNotificationWithIcon('success'),
    onError: () => openNotificationWithIcon('error'),
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  const [updateClassMarkup] = useMutation(UPDATE_CLASS_MARKUP, {
    onCompleted: () => {
      window.currentImage = null;
      history.push('/class');
    },
    onError: () => openNotificationWithIcon('error'),
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  const { loading, error, data } = useQuery(CLASSES, {
    fetchPolicy: 'network-only',
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  async function processFile(blob) {
    const res = await cropStickerFromImage({ variables: { file: blob } });
    setCropping(false);
    if (res.data.cropImage.success) {
      setImage({ src: `${process.env.REACT_APP_IMAGES_URL}crop.jpg?${new Date().getTime()}` });
    } else {
      console.log('error raised while cropping image');
    }
  }

  async function onChange({ file }) {
    if (!cropping) {
      setCropping(true);
      if (file) {
        processFile(file.originFileObj);
      }
    }
  }

  const onClassSelect = (e) => {
    const { clientHeight, clientWidth } = document
      .getElementsByClassName('ReactCrop')
      .item(0);
    const selectedClass = data.user.classes.find((el) => el.name === e);
    const selectedClassInfo = selectedClass.markup
      ? selectedClass.markup.map((el) => ({
        x: el.x * clientWidth,
        y: el.y * clientHeight,
        width: el.w * clientWidth,
        height: el.h * clientHeight,
        section: el.field,
      }))
      : [];
    setCurrentClass(selectedClass);
    setInfo(selectedClassInfo);
    setSection();
    crop && setCrop({});
  };

  const cropOnChange = (newCrop) => {
    setCrop(newCrop);
    if (!(section && currentClass)) return;

    const sectionInfo = { name: currentClass.name, section, ...newCrop };
    if (info && info.find((el) => el.name === sectionInfo.name)) {
      setInfo([
        sectionInfo,
        ...info.filter((el) => el.section !== sectionInfo.section),
      ]);
    } else {
      setInfo([sectionInfo, ...info]);
    }
    if (info.length === 3 && currentClass) setSaveDisabled(false);
  };

  /* eslint-disable-next-line no-shadow */
  const onSectionClick = (section) => () => {
    setSection(section);
    const sectionInfo = info.find((el) => el.section === section);
    sectionInfo ? setCrop(sectionInfo) : setCrop({});
  };

  const onSaveClick = () => {
    const { clientHeight, clientWidth } = document
      .getElementsByClassName('ReactCrop')
      .item(0);

    const toSave = { name: currentClass.name, make: currentClass.make };
    toSave.markup = info.map((el) => ({
      field: el.section,
      x: Number((el.x / clientWidth).toFixed(2)),
      y: Number((el.y / clientHeight).toFixed(2)),
      w: Number((el.width / clientWidth).toFixed(2)),
      h: Number((el.height / clientHeight).toFixed(2)),
    }));
    if (window.currentImage) {
      toSave.image = window.currentImage._id;
      updateClassMarkup({ variables: toSave });
    } else {
      updateClass({ variables: toSave });
    }
  };

  return (
    <div className="image_page">
      {image ? (
        <div className="editor">
          <div className="image_aria">
            { !window.currentClass && (
              <div>
                <Select
                  style={{ textAlign: 'left', display: 'flex' }}
                  placeholder="Select class"
                  allowClear
                  onSelect={onClassSelect}
                >
                  {data.user.classes.map((el) => (
                    <Select.Option key={el.name} value={el.name}>
                      {el.name}
                    </Select.Option>
                  ))}
                </Select>
                <Divider />
              </div>
            )}
            <ReactCrop
              src={window.currentImage
                ? process.env.REACT_APP_IMAGES_URL + imageCroppedPath
                : image.src}
              crop={crop}
              onChange={cropOnChange}
              imageStyle={{ maxHeight: '400px' }}
            />
            <Divider />
            <Form
              form={form}
              {...layout}
              name="basic"
              initialValues={{ remember: true }}
              labelAlign="left"
              style={{ margin: '50px auto' }}
            >

              <Form.Item {...tailLayout}>
                <Button
                  type="primary"
                  htmlType="button"
                  onClick={onSaveClick}
                  disabled={saveDisabled}
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div className="setion_aria">
            {buttons.map((el) => (
              <Button
                key={el}
                type={info.find((item) => item.section === el) && 'primary'}
                style={{
                  marginBottom: '10px',
                  width: '90%',
                  boxShadow:
                    el === section ? '0 0 15px rgba(0,0,0,0.7)' : 'none',
                }}
                onClick={onSectionClick(el)}
              >
                {el}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '20px', minWidth: '600px' }}>
          {cropping ? <Spin size="large" />
            : (
              <Upload.Dragger name="file" onChange={onChange}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
              </Upload.Dragger>
            )}
        </div>
      )}
    </div>
  );
}
