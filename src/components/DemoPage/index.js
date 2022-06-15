import './demoPage.css';

import { InboxOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/react-hooks';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Row,
  Spin,
  Statistic,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';

import { FIND_ON_IMAGE } from '../../queries/classes';
import { LAST_RECOGNITION } from '../../queries/recognitions';
import CheckAdmin from '../CheckAdmin';

const LAST_STREAM_RECOGNITION_UPDATE_INTERVAL = 1000;
const LAST_STREAM_RECOGNITION_VISIBILITY_TIMEOUT = 5000;

export default function DemoPage() {
  const [findStickerOnImage] = useMutation(FIND_ON_IMAGE);
  const [getLastStreamRecognition] = useMutation(LAST_RECOGNITION);

  const [loading, setLoading] = useState(false);
  const [lastStreamRecognitionInterval, setLastStreamRecognitionInterval] = useState();
  const [lastStreamRecognitionDate,
    setLastStreamRecognitionDate] = useState((new Date()).toISOString());
  const [data, setData] = useState();
  const [barcode, setBarcode] = useState();
  const [barcodeReader, setBarcodeReader] = useState();
  const [useBarcode, setUseBarcode] = useState(false);
  const [useStreamAutoRecognition, setUseStreamAutoRecognition] = useState(true);
  const [markedImage, setMarkedImage] = useState(
      `${process.env.REACT_APP_IMAGES_URL}marked.jpg`,
  );

  async function processFile(blob) {
    setBarcode(null);
    setLoading(true);

    if (useBarcode) {
      const results = await barcodeReader.decode(blob);
      if (results.length > 0) {
        setBarcode(
            `${results[0].barcodeFormatString} found: ${results[0].barcodeText}`,
        );
        setLoading(false);
        return;
      }
    }

    const res = await findStickerOnImage({ variables: { file: blob } });
    setData(res.data.findOnImage);
    setMarkedImage(
        `${process.env.REACT_APP_IMAGES_URL}marked.jpg?${new Date().getTime()}`,
    );
    setLoading(false);
  }

  async function onChange({ file }) {
    if (file) {
      processFile(file.originFileObj);
    }
  }

  async function snapshot() {
    window.Webcam.snap((resp) => {
      fetch(resp)
          .then((res) => res.blob())
          .then((blob) => processFile(blob));
    });
  }

  const startWebCam = () => {
    window.Webcam.set({
      dest_width: 2880,
      dest_height: 1620,
      width: 480,
      height: 270,
      image_format: 'jpeg',
      jpeg_quality: 90,
      constraints: {
        width: { ideal: 3840 },
        height: { ideal: 2160 },
      },
    });
    window.Webcam.attach('#stream');
    window.Dynamsoft.BarcodeReader.createInstance().then((reader) => {
      setBarcodeReader(reader);
      console.log('barcode reader ready');
    });

    return () => {
      window.Webcam.reset();
    };
  };

  const pollGetLastStreamRecognitionData = () => {
    setLoading(true);

    const interval = setInterval(async () => {
      const res = await getLastStreamRecognition({
        variables: {
          createdAfterDate: lastStreamRecognitionDate,
        },
      });

      if (!res.data.lastRecognition) {
        return;
      }

      const {
        /* eslint-disable-next-line no-shadow */
        recognized, classId, score, barcode,
      } = res.data.lastRecognition;
      const { model, size, color } = recognized || {};
      const { name, make, status } = classId || {};

      console.log('lastRecognition', res.data.lastRecognition);

      const recognizedData = {
        found: true,
        class: {
          name,
          make,
          status,
        },
        score,
        color,
        size,
        model,
      };

      setData(recognizedData);
      setBarcode(barcode ? `Barcode found: "${barcode.replace(/^([0-9*]+)\. .+/, '$1')}"` : null);

      setMarkedImage(
          `${process.env.REACT_APP_IMAGES_URL}marked.jpg?${new Date().getTime()}`,
      );
      setLoading(false);
      /* eslint-disable-next-line no-use-before-define */
      clearLastStreamRecognitionInterval();
      setLastStreamRecognitionDate((new Date()).toISOString());
    }, LAST_STREAM_RECOGNITION_UPDATE_INTERVAL);

    const clearLastStreamRecognitionInterval = () => {
      clearInterval(interval);
      setLastStreamRecognitionInterval(null);
      setLoading(false);
    };

    setLastStreamRecognitionInterval(interval);

    return clearLastStreamRecognitionInterval;
  };

  useEffect(() => {
    if (useStreamAutoRecognition) {
      window.Webcam.reset();
      return pollGetLastStreamRecognitionData();
    }

    if (lastStreamRecognitionInterval) {
      clearInterval(lastStreamRecognitionInterval);
      setLastStreamRecognitionInterval(null);
    }

    return startWebCam();
  }, [useStreamAutoRecognition]);

  useEffect(() => {
    if (!data || !useStreamAutoRecognition) {
      return;
    }

    setTimeout(() => {
      pollGetLastStreamRecognitionData(data);
    }, LAST_STREAM_RECOGNITION_VISIBILITY_TIMEOUT);
  }, [data]);

  let content = <div />;
  if (barcode) {
    content = <h2>{barcode}</h2>;
  } else if (data) {
    if (data.found) {
      content = (
          <Card cover={<img src={markedImage} alt="marked" />}>
            {data.class ? (
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="Class" value={data.class.name} />
                      <Statistic title="Brand" value={data.class.make} />
                      <Statistic
                          title="Score"
                          value={data.score}
                          formatter="number"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Color" value={data.color} />
                      <Statistic title="Size" value={data.size} />
                      <Statistic title="Model" value={data.model} />
                    </Col>
                  </Row>
                </div>
            ) : (
                <Alert
                    message={
                      `Sticker was found but no class in DB or class has no proper markup: ${
                          data.model}`
                    }
                    type="warning"
                />
            )}
          </Card>
      );
    } else {
      content = <Empty description="No sticker found" />;
    }
  }

  return (
      <Row gutter={16} style={{ flexFlow: 'row' }}>
        <CheckAdmin />
        <Col flex={2}>
          {!useStreamAutoRecognition && (
              <div id="stream" />
          )}
          <Checkbox
              style={{ margin: '20px 0' }}
              onChange={(e) => setUseBarcode(e.target.checked)}
          >
            Use Barcode Scanner
          </Checkbox>
          <Checkbox
              style={{ margin: '20px 0' }}
              defaultChecked
              onChange={(e) => setUseStreamAutoRecognition(e.target.checked)}
          >
            Use Stream Auto Recognition
          </Checkbox>

          {!loading && (
              <div>
                <Button style={{ marginBottom: '20px' }} onClick={snapshot}>
                  Take Snapshot
                </Button>
                <Upload.Dragger name="file" onChange={debounce(onChange, 1000)}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload.Dragger>
              </div>
          )}

        </Col>

        <Col flex={3}>
          <div style={{ marginTop: '20px', minWidth: '600px' }}>
            {loading ? <Spin size="large" /> : content}
          </div>
        </Col>
      </Row>
  );
}
