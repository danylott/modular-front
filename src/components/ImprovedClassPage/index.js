import 'react-image-crop/dist/ReactCrop.css';
import './classes.css';

import { useMutation, useQuery } from '@apollo/react-hooks';
import { debounce } from 'lodash';
import {Button, Form, Upload, Card, Layout, Input, Modal, Col, Row, message, Spin, Alert, Affix} from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';
import { CameraOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import ReactCrop from 'react-image-crop';
import ReactImageAnnotate from "react-image-annotate";
import {CREATE_CLASS, UPDATE_CLASS_MARKUP} from "../../queries/classes";
import {CREATE_ANNOTATION, SAVE_IMAGE, CROP_STICKER} from "../../queries/images";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const buttons = ['Color', 'Size', 'Model'];


export default function ImprovedClassPage() {

    const [error, setError] = useState();
    const [currentClass, setCurrentClass] = useState();
    const [isClassSaving, setIsClassSaving] = useState(false);

    const [images, setImages] = useState([]);
    const areImagesLoaded = useMemo(() => images.filter(image => image.src === '').length === 0, [images]);
    const [isBusySnapshotting, setIsBusySnapshotting] = useState(false);

    const [currentMarkupImage, setCurrentMarkupImage] = useState([]);
    const [isLabelMarkupSaving, setIsLabelMarkupSaving] = useState(false);
    const [isLabelMarkupModalVisible, setIsLabelMarkupModalVisible] = useState(false);
    const isLabelMarkupCompleted = useMemo(() => images.filter(image => !image.path_labeled).length === 0, [images]);

    const [isTextMarkupSaving, setIsTextMarkupSaving] = useState(false);
    const [textMarkupImage, setTextMarkupImage] = useState();

    const [textMarkupCrop, setTextMarkupCrop] = useState();
    const [section, setSection] = useState();
    const [textMarkups, setTextMarkups] = useState([]);

    const [cookies] = useCookies();
    const history = useHistory()
    const context = {
        context: {
            headers: {
                token: `${cookies.token}`,
            },
        },
    };
    const [createClass] = useMutation(CREATE_CLASS, context);
    const [saveImage] = useMutation(SAVE_IMAGE, context);
    const [createAnnotation] = useMutation(CREATE_ANNOTATION, context);
    const [cropSticker] = useMutation(CROP_STICKER, context);
    const [updateClassMarkup] = useMutation(UPDATE_CLASS_MARKUP, context);

    const [form] = Form.useForm();
    
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

        return () => {
            window.Webcam.reset();
        };
    };

    useEffect(() => {
        let emptyImages = [];
        for (let i = 0; i < process.env.REACT_APP_MIN_COUNT_ANNOTATED_IMAGES_FOR_APPLICATION_CLASS; i++) {
            emptyImages.push({
                _id: i,
                path: "",
                src: "",
                markup: {},
            })
        }
        setImages(emptyImages);
        return startWebCam();
    }, [])

    function ImprovedImage({src}) {
  const [cropSticker] = useMutation(CROP_STICKER, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });
        return (
            <>
                {src ?
                    (
                        <img
                            className={'improved-image'}
                            src={src}
                            alt={src}/>
                    ) :
                    (
                        <div style={{width: '100%', textAlign: 'center'}}
                        >

                            <CameraOutlined
                                className="no-image"
                            />
                        </div>
                    )
                }
            </>
        );
    }

    const handleError = (err) => {
        console.log(err);
        err && setError(err.message);
        setIsClassSaving(false);
    };

    const createClassClick = () => {
        setIsClassSaving(true);
        const formData = form.getFieldsValue();
        console.log(formData);
        createClass({ variables: formData })
            .then((cls) => cls.data.createClass)
            .then((cls) => {
                setCurrentClass(cls);
                setIsClassSaving(false);
                setError(null);
            })
            .catch((err) => handleError(err));
    }

    const saveImageToList = (newImage) => {
        let alreadyAdded = false;
        setImages(images.map(image => {
            if(!image.path && !alreadyAdded) {
                alreadyAdded = true;
                newImage.src = process.env.REACT_APP_IMAGES_URL + newImage.path;
                return newImage;
            }
            return image;
        }));
        setIsBusySnapshotting(false);
    }

    const alertIfNoCurrentClass = () => {
        if (!currentClass) {
            message.warning('Please, create Class at first');
            return true;
        }
        return false;
    }
    
    async function snapshot() {
        if (alertIfNoCurrentClass()) {
            return;
        }
        setIsBusySnapshotting(true);
        window.Webcam.snap((resp) => {
            fetch(resp)
                .then((res) => res.blob())
                .then((blob) => saveSnapshotImage(blob))
                .catch(err => console.log(err))
        });
    }

    async function saveSnapshotImage(blob) {
        if (!areImagesLoaded) {
            saveImage({ variables: { file: blob, cls_id: currentClass._id } })
                .then(res => res.data.createImage)
                .then(image => saveImageToList(image))
                .catch(err => console.log(err))
        }
    }

    const openLabelMarkupModal = (image) => {
        if (!areImagesLoaded) {
            message.warning('Please, upload (or take snapshot) of all images first');
            return;
        }
        setIsLabelMarkupModalVisible(true);
        setCurrentMarkupImage(image);
    }

    const editImageInList = (newImage, imagePosition) => {
        setImages(images.map((image, index) => {
            if(imagePosition === index) {
                newImage.src = process.env.REACT_APP_IMAGES_URL + newImage.path;
                return newImage;
            }
            return image;
        }));
    }

    const uploadClick = (info, imagePosition) => {
        if (alertIfNoCurrentClass()) {
            return;
        }
        if(info.file) {
            saveImage({ variables: { file: info.file.originFileObj, cls_id: currentClass._id } })
                .then(res => res.data.createImage)
                .then(image => editImageInList(image, imagePosition))
                .catch(err => console.log(err))
        }
    }

    /* eslint-disable-next-line no-shadow */
    async function saveLabelMarkups(images) {
        let markedImages = [];
        for (const image of images) {
            if (image.regions && image.regions.length > 0) {
                const { points } = image.regions[0];
                const annotation = points.reduce((acc, point) => {
                    acc.push(point[0]);
                    acc.push(point[1]);
                    return acc;
                }, []);
                if (annotation.length > 2) {
                    /* eslint-disable-next-line no-await-in-loop */
                    let res = await createAnnotation({
                    variables: {
                        id: image._id,
                        annotation,
                    }})
                    markedImages.push(res.data.createAnnotation);
                }
            }
        }
        setImages(markedImages);
    }

    const saveLabelMarkupClick = (markups) => {
        setCurrentMarkupImage(null);
        console.log(markups);
        if (markups.images.filter(image => image.regions && image.regions.length > 0).length
                !== +process.env.REACT_APP_MIN_COUNT_ANNOTATED_IMAGES_FOR_APPLICATION_CLASS) {
            message.warning('Please, markup all images before saving');
            setIsLabelMarkupModalVisible(false);
            return;
        }
        setIsLabelMarkupSaving(true);
        saveLabelMarkups(markups.images)
            .then(() => {
                cropSticker({ variables: { id: images[0]._id } })
                    .then((res) => {
                        images[0].path_cropped = process.env.REACT_APP_IMAGES_URL + res.data.createSticker.path_cropped;
                        setTextMarkupImage(images[0]);
                    })
                    .catch((err) => console.log(err));
                setIsLabelMarkupSaving(false);
                setIsLabelMarkupModalVisible(false);
            })
            .catch((err) => console.log(err));
    };

    const cropOnChange = (newCrop) => {
        setTextMarkupCrop(newCrop);
        if (!(section && currentClass)) return;

        const sectionInfo = { name: currentClass.name, section, ...newCrop };
        if (textMarkups && textMarkups.find((el) => el.name === sectionInfo.name)) {
            setTextMarkups([
                sectionInfo,
                ...textMarkups.filter((el) => el.section !== sectionInfo.section),
            ]);
        } else {
            setTextMarkups([sectionInfo, ...textMarkups]);
        }
    };

    const onSectionClick = (section) => () => {
        setSection(section);
        const sectionInfo = textMarkups.find((el) => el.section === section);
        sectionInfo ? setTextMarkupCrop(sectionInfo) : setTextMarkupCrop({});
    };

    const onSaveClick = () => {
        setIsTextMarkupSaving(true);
        const { clientHeight, clientWidth } = document
            .getElementsByClassName('ReactCrop')
            .item(0);
        const toSave = { name: currentClass.name, make: currentClass.make };
        toSave.markup = textMarkups.map((el) => ({
            field: el.section,
            x: Number((el.x / clientWidth).toFixed(2)),
            y: Number((el.y / clientHeight).toFixed(2)),
            w: Number((el.width / clientWidth).toFixed(2)),
            h: Number((el.height / clientHeight).toFixed(2)),
        }));
        toSave.image = textMarkupImage._id;
        updateClassMarkup({ variables: toSave })
            .then(res => {
                setIsTextMarkupSaving(false);
                window.currentClass = currentClass;
                history.push('/class')
            })
            .catch(err => console.log(err));
    };

    return (
        <Layout className="improved-page">
            <h1>Crear nueva clase</h1>
            {error && <Alert style={{ maxWidth: 600, margin: 'auto' }} message={error.slice(15)} type="error" />}
            <Modal
                width={"70%"}
                visible={isLabelMarkupModalVisible}
                onOk={() => setIsLabelMarkupModalVisible(false)}
                onCancel={() => setIsLabelMarkupModalVisible(false)}
                footer={null}
            >
                {isLabelMarkupSaving ? <div style={{margin: "auto"}}>Labeling in process, please wait <Spin size="large" /></div>  : (
                    <div>
                        <h1>Label Markup</h1>
                        <div>
                            {currentMarkupImage && (
                                <ReactImageAnnotate
                                    className={'markup-window'}
                                    regionTagList={[]}
                                    regionClsList={[]}
                                    imageTagList={[]}
                                    imageClsList={[]}
                                    selectedImage={currentMarkupImage ? currentMarkupImage.src : ''}
                                    taskDescription="Draw Only one Polygon - label annotation"
                                    images={images}
                                    enabledTools={['create-polygon']}
                                    showTags={false}
                                    onExit={(textMarkups) => saveLabelMarkupClick(textMarkups)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            <Row>

                <Col span={16} className={'left-tab'}>
                    <Form
                        form={form}
                        {...layout}
                        name="basic"
                        initialValues={{ remember: false }}
                        onFinish={() => createClassClick()}
                        onFinishFailed={(err) => message.error(err)}
                    >
                        <Form.Item

                            className="small-input"
                            label="Nombre de la clase:"
                            name="name"
                            rules={[{ required: true, message: 'Por favor, introduce el nombre de la class' }]}
                        >
                          <Input disabled={currentClass} size="large" placeholder='Por favor, introduce el nombre de la class' />
                        </Form.Item>

                        <Form.Item
                          className="small-input"
                          label="Marca:"
                          name="make"
                          rules={[{ required: true, message: 'Por favor, ntroduce el nombre de la marca' }]}
                        >
                          <Input disabled={currentClass} size="large" placeholder='Por favor, ntroduce el nombre de la marca' />
                        </Form.Item>

                        {isClassSaving ? <Spin size="large" /> : (
                            <>
                                { !currentClass && (
                                    <Form.Item shouldUpdate={true}>
                                        {() => (
                                            <Button
                                                className="button"
                                                type="primary"
                                                htmlType="submit"
                                                disabled={!form.isFieldsTouched(true) ||
                                                form.getFieldsError().filter(({ errors }) => errors.length).length}
                                            >
                                                Create Class
                                            </Button>
                                        )}

                                    </Form.Item>
                                )}
                            </>
                            ) }

                    </Form>

                    <Row>
                        {images.map((image, index) =>
                            (
                                <Col
                                    key={image._id}
                                    span={12}
                                >
                                    <Card
                                        onClick={() => !isLabelMarkupCompleted && openLabelMarkupModal(image)}
                                        className={'image-card'}
                                        hoverable
                                        cover={<ImprovedImage src={
                                            !isLabelMarkupCompleted ?
                                                (image.path ? process.env.REACT_APP_IMAGES_URL + image.path : '') :
                                                (process.env.REACT_APP_IMAGES_URL + image.path_labeled)
                                        }/>}
                                    >
                                        <Upload
                                            showUploadList={false}
                                            disabled={!currentClass || areImagesLoaded || isLabelMarkupCompleted}
                                            onChange={debounce((info) => uploadClick(info, index), 100)}
                                            className={'upload-button'}
                                        >
                                            <Button
                                                disabled={areImagesLoaded || isLabelMarkupCompleted}
                                                icon={<UploadOutlined />}
                                            >
                                                upload
                                            </Button>
                                        </Upload>
                                        <Button
                                            onClick={() => openLabelMarkupModal(image)}
                                            disabled={!areImagesLoaded || isLabelMarkupCompleted}
                                            className={'markup-button'}
                                        >
                                            markup
                                        </Button>
                                    </Card>
                                </Col>
                            ))
                        }
                    </Row>
                </Col>

                <Col span={8} className={'right-tab'}>

                    <Card
                        className={'camera-snapshot'}
                    >
                        <div style={{margin: "auto"}} id="stream"/>
                        {isBusySnapshotting ? <Spin size="large" /> : (
                            <Button disabled={areImagesLoaded} onClick={snapshot} className={'take-snapshot'}>Take snapshot</Button>
                        )}
                    </Card>

                    <h1>Text Markup</h1>
                    <Col span={24}>
                        <Card
                            className={'image-card text-markup'}
                            cover={!textMarkupImage ?
                                (<ImprovedImage src={''} />) :
                            (<ReactCrop
                                src={textMarkupImage.path_cropped}
                                crop={textMarkupCrop}
                                onChange={cropOnChange}
                                imageStyle={{ maxHeight: '400px' }}
                                />)}
                        >

                        {buttons.map((el) => (
                            <Button
                                key={el}
                                disabled={!isLabelMarkupCompleted}
                                type={textMarkups.find((item) => item.section === el) && 'primary'}
                                style={{
                                    marginBottom: '10px',
                                    width: '30%',
                                    boxShadow:
                                        el === section ? '0 0 15px rgba(0,0,0,0.7)' : 'none',
                                }}
                                onClick={onSectionClick(el)}
                            >
                                {el}
                            </Button>
                        ))}
                        </Card>

                    </Col>
                    <Row>
                        <Col span={8}>
                            <div className="section_aria">
                            </div>
                        </Col>


                        <Affix className={'save-class'}>
                            {isTextMarkupSaving ? <Spin size="large" /> : (
                                <Button
                                    className={'save-class'}
                                    disabled={textMarkups.length !== 3}
                                    onClick={() => onSaveClick()}
                                    icon={<SaveOutlined style={{fontSize: "100px"}} />} />
                            )}
                        </Affix>
                    </Row>
                </Col>
            </Row>
        </Layout>
    );
}
