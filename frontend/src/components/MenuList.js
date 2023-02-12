import {Breadcrumb, Col, Row} from "antd";
import React from "react";

const MenuList = function(props) {
    return (
        <Row>
            <Col span={20} offset={1}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        {
                            props.currentPage === 'campaign' ?
                                <a className="selected"  href="#/campaigns">Manage Campaign Page</a> : <a href="#/campaigns">Manage Campaign Page</a>
                        }
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {
                            props.currentPage === 'group' ?
                                <a className="selected" href="#/groups">Manage Campaign Action Group Page</a> : <a href="#/groups">Manage Campaign Action Group Page</a>
                        }
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {
                            props.currentPage === 'upload' ?
                                <a className="selected" href="#/">Upload Page</a> : <a href="#/">Upload Page</a>
                        }
                    </Breadcrumb.Item>
                </Breadcrumb>
            </Col>
        </Row>
    )
}

export default MenuList;