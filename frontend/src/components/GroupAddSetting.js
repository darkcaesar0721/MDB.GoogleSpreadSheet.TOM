import {Button, Checkbox, Col, Form, Input, message, Modal, Radio, Row, Select, Spin, Table} from "antd";
import Path from "./Path/Path";
import {connect} from "react-redux";
import {getCampaigns, updateCampaign} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import MenuList from "./MenuList";
import moment from "moment";
import axios from "axios";
import {APP_API_URL} from "../constants";
import dragula from "dragula";
import "dragula/dist/dragula.css";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

const randomLayout = {
    labelCol: {
        span: 14,
    },
    wrapperCol: {
        span: 8,
    },
};

const meridiemOption = [
    {value: 'AM', label: 'AM'},
    {value: 'PM', label: 'PM'},
];

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

const GroupAddSetting = (props) => {
    const [way, setWay] = useState('all'); //all,static,random
    const [mainForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [staticCount, setStaticCount] = useState(1);
    const [isTime, setIsTime] = useState(false);
    const [time, setTime] = useState('');
    const [meridiem, setMeridiem] = useState('AM');
    const [dayOld, setDayOld] = useState(1);
    const [loading, setLoading] = useState(false);
    const [tblColumns, setTblColumns] = useState([]);

    const {index} = useParams();
    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
    }, []);

    useEffect(() => {
        if (open === true) {
            let start;
            let end;
            const container = document.querySelector(".ant-table-tbody");
            const drake = dragula([container], {
                moves: (el) => {
                    start = getIndexInParent(el);
                    return true;
                },
            });

            drake.on("drop", (el) => {
                end = getIndexInParent(el);
                handleReorder(start, end);
            });
        }
    }, [open]);

    useEffect(function() {
        setTblColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                render: (_, r) => {
                    if (r.index === undefined || r.index === "") {
                        columns.forEach((c, i) => {
                            if (c.name === r.name) {
                                r.index = i; return;
                            }
                        })
                    }
                    return (
                        <>
                            <span>{(parseInt(r.index) + 1)}</span>
                        </>
                    )
                }
            },
            {
                title: 'Display',
                key: 'display',
                width: 50,
                render: (_, c) => {
                    return <Checkbox checked={c.display} onChange={(e) => {handleColumnCheck(e, c)}}/>
                }
            },
            {
                title: 'MDB Column Name',
                dataIndex: 'name',
                key: 'mdb',
            },
            {
                title: 'Sheet Column Name',
                dataIndex: 'field',
                key: 'sheet',
                render: (_, c) => {
                    return c.name === 'Phone' ? c.name : ((c.isInputDate == "true" || c.isInputDate == true)
                        ? c.field : <Input disabled={!c.display} onChange={(e) => {handleColumnFieldChange(e, c)}} value={c.field}/>)
                }
            },
        ])
    }, [columns]);

    useEffect(function() {
        if (props.campaigns.data.length > 0) {
            const selectedCampaign = props.campaigns.data[index];
            setColumns(selectedCampaign.group.columns.map(c => {
                if (c.key === undefined || c.key === "") return Object.assign({...c}, {display: c.display ==='true', key: c.name})
                else return Object.assign({...c}, {display: c.display ==='true'})
            }));

            mainForm.setFieldsValue(selectedCampaign.group);

            setWay(selectedCampaign.group.way);
            setStaticCount(selectedCampaign.group.staticCount);
            setDayOld(selectedCampaign.group.dayOld);
            setMeridiem(!selectedCampaign.group.meridiem ? 'AM' : selectedCampaign.group.meridiem);
            setTime(selectedCampaign.group.time);
            setIsTime(selectedCampaign.group.isTime == "true");
        }
    }, [props.campaigns.data]);

    const handleSubmit = (form) => {
        if (validation(form)) {
            let campaign = props.campaigns.data[index];

            let group = {};
            group.way = way;
            group.columns = columns;
            switch (way) {
                case 'static':
                    group['staticCount'] = staticCount;
                    break;
                case 'random':
                    group['randomStart'] = form.randomStart;
                    group['randomEnd'] = form.randomEnd;
                    break;
                case 'random_first':
                    group['randomFirst'] = form.randomFirst;
                    group['randomStart'] = form.randomStart;
                    group['randomEnd'] = form.randomEnd;
                    break;
                case 'date':
                    group['isTime'] = isTime;
                    group['dayOld'] = !dayOld ? 0: dayOld;
                    group['time'] = time;
                    group['meridiem'] = meridiem;
                    if (isTime) {
                        group['date'] = moment(Date.now()).add(0 - dayOld, 'day').format('MM/DD/YYYY');
                    } else {
                        group['date'] = moment(Date.now()).add(0 - (parseInt(dayOld) + 1), 'day').format('MM/DD/YYYY');
                    }
                    break;
            }
            props.updateCampaign(campaign['file_name'], {}, group, function() {
                messageApi.success('save success');
                setTimeout(function() {
                    navigate('/groups/add');
                }, 1000);
            });
        }
    }

    const validation = (form) => {
        if (form.way === 'static') {
            if (!staticCount) {
                messageApi.warning('Please input static count.');
                return false;
            }
        }
        if (form.way === 'random' || form.way === 'random_first') {
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
        if (form.way === 'random_first') {
            if (!form.randomFirst) {
                messageApi.warning('Please input random first count.');
                return false;
            }
            if (parseInt(form.randomEnd) > parseInt(form.randomFirst)) {
                messageApi.warning('Random end count must be less than random first count.');
                return false;
            }
        }
        if (form.way === 'date') {
            if (!dayOld && !isTime) {
                messageApi.warning('Please input time field');
                return false;
            }
            if (isTime && !time) {
                messageApi.warning('Please input time field.');
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

        setColumns((oldState) => {
            const newState = [...oldState];
            return newState.map((c, i) => c === column ? Object.assign({...c}, {display: e.target.checked}) : c);
        });
    }

    const handleColumnFieldChange = function(e, column) {
        setColumns((oldState) => {
            const newState = [...oldState];
            return newState.map((c, i) => c === column ? Object.assign({...c}, {field: e.target.value}) : c);
        });
    }

    const handleViewColumnClick = function() {
        checkInputDateField(openColumnModal);
    }

    const openColumnModal = function() {
        setOpen(true);
    }

    const checkInputDateField = function(callback) {
        let isInputDateField = false;
        columns.forEach(c => {
            if (c.isInputDate == "true" || c.isInputDate == true) {
                isInputDateField = true;
            }
        })
        if (isInputDateField) {
            setLoading(true);
            axios.post(APP_API_URL + 'api.php?class=Mdb&fn=get_input_date')
                .then((resp) => {
                    setColumns(columns.map(c => (c.isInputDate == "true" || c.isInputDate == true) ? Object.assign(c, {field: resp.data}) : c));
                    callback();
                    setLoading(false);
                })
        } else {
            callback();
        }
    }

    const handleIsTimeCheck = function(e) {
        setIsTime(e.target.checked);
    }

    const handleTimeChange = function(e) {
        setTime(e.target.value);
    }

    const handleDayOldChange = function(e) {
        setDayOld(e.target.value);
    }

    const handleMeridiemChange = function(value) {
        setMeridiem(value);
    }

    const handleReorder = (dragIndex, draggedIndex) => {
        setColumns((oldState) => {
            const newState = [...oldState];
            const item = newState.splice(dragIndex, 1)[0];
            newState.splice(draggedIndex, 0, item);
            return newState.map((s, i) => {return Object.assign(s, {index: i})});
        });
    };

    return (
        <Spin spinning={loading} tip="Get input date from 002_DateInput query ..." delay={300}>
            {contextHolder}
            <MenuList
                currentPage="group"
            />
            <Path/>
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
                                    label="Query Name"
                                >
                                    <span>{props.campaigns.data[index].query}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['urls']}
                                    label="Sheet URLS"
                                >
                                    {
                                        props.campaigns.data[index].urls.map(url => {
                                            return (
                                                <div key={url}>
                                                    <span>{url}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </Form.Item>
                                <Form.Item
                                    name={['schedule']}
                                    label="Sheet Name"
                                >
                                    <span>{props.campaigns.data[index].schedule}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Send Type"
                                >
                                    <Radio.Group onChange={handleWayChange} defaultValue="all" value={way}>
                                        <Radio value="all">All Select</Radio>
                                        <Radio value="static">Static Select</Radio>
                                        <Radio value="random">Random Select</Radio>
                                        <Radio value="random_first">Random First Select</Radio>
                                        <Radio value="date">Date & Time</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {
                                    way === 'static' ?
                                        <Form.Item
                                            name={['staticCount']}
                                            label="Static Count"
                                        >
                                            <Row>
                                                <Col span={4}>
                                                    <Input style={{width: '100%'}} placeholder="Static Count" value={staticCount} onChange={(e) => {setStaticCount(e.target.value)}}/>
                                                </Col>
                                            </Row>
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
                                                <Input placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(3% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(13% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                {
                                    way === 'random_first' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomFirst']}
                                                label="Random First"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="First"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomStart']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(10% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(3% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(10% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                {
                                    way === 'date' ?
                                        <Form.Item label="Days Old" name={['date']} valuePropName="checked">
                                            <Row>
                                                <Col span={3}>
                                                    <Input placeholder="Days Old" value={dayOld} onChange={handleDayOldChange}/>
                                                </Col>
                                                <Col span={1} offset={1}>
                                                    <Checkbox checked={isTime} onChange={handleIsTimeCheck} style={{paddingTop: '0.3rem'}}></Checkbox>
                                                </Col>
                                                <Col span={2}>
                                                    <Input disabled={!isTime} placeholder="Time" value={time} onChange={handleTimeChange}/>
                                                </Col>
                                                <Col span={2}>
                                                    <Select
                                                        size="middle"
                                                        defaultValue="AM"
                                                        onChange={handleMeridiemChange}
                                                        style={{ width: 70 }}
                                                        options={meridiemOption}
                                                        value={meridiem}
                                                        disabled={!isTime}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Item> : ''
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
                                        offset: 10,
                                    }}
                                >
                                    <Button type="primary" htmlType="submit" style={{marginRight: 5}}>
                                        Save Setting
                                    </Button>
                                    <Button type="dashed" href="#/groups/add">
                                        Cancel
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
                        width={700}
                    >
                        <Table
                            bordered={true}
                            size="small"
                            columns={tblColumns}
                            dataSource={columns}
                            pagination={false}
                        />
                    </Modal>
                </Col>
            </Row>
        </Spin>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign }
)(GroupAddSetting);