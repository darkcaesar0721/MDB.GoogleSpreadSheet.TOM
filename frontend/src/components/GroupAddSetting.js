import {Breadcrumb, Button, Checkbox, Col, Form, Input, InputNumber, message, Modal, Radio, Row} from "antd";
import MDBPath from "./MDBPath";
import {connect} from "react-redux";
import {getCampaigns, updateCampaign} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

const columnLayout = {
    labelCol: {
        span: 12,
    },
    wrapperCol: {
        span: 11,
    },
}

const randomLayout = {
    labelCol: {
        span: 13,
    },
    wrapperCol: {
        span: 3,
    },
};

const GroupAddSetting = (props) => {
    const [way, setWay] = useState('all'); //all,static,random
    const [columnForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [staticCount, setStaticCount] = useState(1);

    const {index} = useParams();
    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
    }, []);

    useEffect(function() {
        if (props.campaigns.data.length > 0) {
            const selectedCampaign = props.campaigns.data[index];
            let _columns = selectedCampaign.group.columns;
            _columns = _columns.map(c => {
                return Object.assign({...c}, {display: c.display ==='true'})
            })
            setColumns(_columns);

            let data = {};
            selectedCampaign.group.columns.forEach((c, i) =>{
                data[c.name + '_order'] = c.order;
                data[c.name + '_name'] = c.field;
            });
            columnForm.setFieldsValue(data);

            setWay(selectedCampaign.group.way);
            setStaticCount(selectedCampaign.group.staticCount);
            mainForm.setFieldsValue(selectedCampaign.group);
        }
    }, [props.campaigns.data]);

    const handleSubmit = (form) => {
        form.columns = columns;

        if (validation(form)) {
            let campaign = props.campaigns.data[index];
            campaign.group = form;
            props.updateCampaign(campaign);

            messageApi.success('save success');
            setTimeout(function() {
                navigate('/groups/add');
            }, 1000);
        }
    }

    const validation = (form) => {
        if (form.way === 'static') {
            if (!form.staticCount) {
                messageApi.warning('Please input static count.');
                return false;
            }
        }
        if (form.way === 'random') {
            if (!form.randomStart) {
                messageApi.warning('Please input random start count.');
                return false;
            }
            if (!form.randomEnd) {
                messageApi.warning('Please input random end count.');
                return false;
            }
            if (parseInt(form.randomStart) > parseInt(form.randomEnd)) {
                messageApi.warning('Random start count must be less than random end count.');
                return false;
            }
        }
        if (columns.length === 0) {
            messageApi.warning('Please select columns.');
            return false;
        }
        return true;
    }

    const handleWayChange = (e) => {
        setWay(e.target.value);
    }

    const handleColumnCheck = function(e, column) {
        if (column.name === 'Phone') return;

        let _columns = columns;
        _columns = _columns.map((c, i) => c === column ? Object.assign({...c}, {display: e.target.checked}) : c);
        setColumns(_columns);
    }

    const handleColumnOrderChange = function(e, column) {
        let _columns = columns;
        _columns = _columns.map((c, i) => c === column ? Object.assign({...c}, {order: e.target.value}) : c);
        _columns = _columns.sort((a, b) => {
            if (parseInt(a.order) < parseInt(b.order)) return -1;

            return 0;
        });
        setColumns(_columns);
    }

    const handleColumnFieldChange = function(e, column) {
        let _columns = columns;
        _columns = _columns.map((c, i) => c === column ? Object.assign({...c}, {field: e.target.value}) : c);
        setColumns(_columns);
    }

    const handleViewColumnClick = function() {
        let _columns = columns;
        _columns = _columns.sort((a, b) => {
            if (parseInt(a.order) < parseInt(b.order)) return -1;

            return 0;
        });
        setColumns(_columns);

        setOpen(true);
    }

    return (
        <>
            {contextHolder}
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a href="">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="" className="selected">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        props.campaigns.data.length  > 0 ?
                            <Form
                                {...layout}
                                name="add_group_form"
                                onFinish={handleSubmit}
                                className="group-setting-form"
                                form={mainForm}
                            >
                                <Form.Item
                                    name={['query']}
                                    label="Query"
                                >
                                    <span>{props.campaigns.data[index].query}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['url']}
                                    label="Sheet URL"
                                >
                                    <span>{props.campaigns.data[index].url}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['schedule']}
                                    label="Schedule Name"
                                >
                                    <span>{props.campaigns.data[index].schedule}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Select Way"
                                >
                                    <Radio.Group onChange={handleWayChange} defaultValue="all" value={way}>
                                        <Radio value="all">All Select</Radio>
                                        <Radio value="static">Static Select</Radio>
                                        <Radio value="random">Random Select</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {
                                    way === 'static' ?
                                        <Form.Item
                                            name={['staticCount']}
                                            label="Static Count"
                                        >
                                            <Col span={3}>
                                                <InputNumber placeholder="Static Count" value={staticCount} onChange={(e) => {setStaticCount(e.target.value)}}/>
                                            </Col>
                                        </Form.Item> : ''
                                }
                                {
                                    way === 'random' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomStart']}
                                                label="Random Count"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <InputNumber placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(5% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <InputNumber placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                <Form.Item
                                    name={['column']}
                                    label="Custom Column"
                                >
                                    <Button type="dashed" onClick={handleViewColumnClick}>
                                        Custom Column
                                    </Button>
                                </Form.Item>
                                <Form.Item
                                    wrapperCol={{
                                        ...layout.wrapperCol,
                                        offset: 11,
                                    }}
                                >
                                    <Button type="primary" htmlType="submit">
                                        Save Setting
                                    </Button>
                                </Form.Item>
                            </Form> : ''
                    }
                    <Modal
                        title="CUSTOM COLUMN"
                        centered
                        open={open}
                        onOk={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                        width={500}
                    >
                        <Form
                            {...columnLayout}
                            name="group_add_setting_column_form"
                            form={columnForm}
                        >
                            {
                                columns.map((c, i) => {
                                    return (
                                        <div key={i}>
                                            <br/>
                                            <Checkbox style={{position: 'absolute', marginTop: '0.3rem'}} checked={c.display} onChange={(e) => {handleColumnCheck(e, c)}}/>
                                            <Form.Item
                                                name={[c.name + '_name']}
                                                label={c.name}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(70% - 5px)',
                                                }}
                                            >
                                                {
                                                    c.name === 'Phone' ? c.name : <Input disabled={!c.display} onChange={(e) => {handleColumnFieldChange(e, c)}} value={c.field}/>
                                                }
                                            </Form.Item>
                                            <Form.Item
                                                name={[c.name + '_order']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input disabled={!c.display} onChange={(e) => {handleColumnOrderChange(e, c)}} value={c.order}/>
                                            </Form.Item>
                                        </div>
                                    )
                                })
                            }
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign }
)(GroupAddSetting);