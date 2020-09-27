import React, { Component, StyleHTMLAttributes } from 'react';

import Popup from './Popup';

import '../style/Card.scss';

interface Sensor {
    id: number;
    name: string;
    category: string;
    description: string;

    type: string;
    value: number;
    created_at: Date;
}

interface IProp {
    items: Sensor[];
}

interface IState {
    currItem: Sensor;
    showPopup: boolean;
}

export default class Dashboard extends Component<IProp, IState> {
    intervalID: any;

    state = {
        currItem: this.props.items[0],
        showPopup: false,
    };

    componentDidMount() {}

    componentWillUnmount() {}

    componentDidUpdate() {
        console.log(`Card Updated`);
    }

    generateColor(sensor: Sensor) {
        let backgroundColor: string = 'gray';

        if (sensor.type === 'Humidity') {
            if (sensor.value > 65) {
                backgroundColor = 'firebrick';
            } else if (sensor.value > 55) {
                backgroundColor = 'peru';
            } else {
                backgroundColor = 'darkslategrey';
            }
        } else if (sensor.type === 'Temperature') {
            if (sensor.value > 30) {
                backgroundColor = 'firebrick';
            } else if (sensor.value > 25) {
                backgroundColor = 'peru';
            } else if (sensor.value > 18) {
                backgroundColor = 'darkslategrey';
            } else {
                backgroundColor = 'darkslateblue';
            }
        }

        return backgroundColor;
    }

    async togglePopup(item: Sensor) {
        this.setState({
            showPopup: !this.state.showPopup,
            currItem: item,
        });
    }

    render() {
        const items: Sensor[] = this.props.items;
        const day = 1000 * 60 * 60 * 24;
        const aDayAgo = Date.now() - day;

        return (
            <React.Fragment>
                <li key={String(items[0].id)} className="container-item">
                    <div className="header-item">{items[0].name}</div>

                    <div className="content-item">
                        {items.map((item: Sensor, i: number) => (
                            <React.Fragment>
                                <ul
                                    className="list-item"
                                    style={{
                                        backgroundColor: this.generateColor(
                                            item
                                        ),
                                    }}
                                    onClick={this.togglePopup.bind(this, item)}
                                >
                                    <li className="sensor">
                                        <div className="value">
                                            {item.value}
                                        </div>
                                        <div className="typeWrapper">
                                            <sup className="type">
                                                {item.type === 'Humidity'
                                                    ? '%'
                                                    : item.type ===
                                                      'Temperature'
                                                    ? '°C'
                                                    : 'Null'}
                                            </sup>
                                        </div>
                                    </li>

                                    <li className="itemTime">
                                        (
                                        {item.created_at.getTime() > aDayAgo
                                            ? item.created_at
                                                  .toLocaleTimeString()
                                                  .substr(0, 5)
                                            : item.created_at.toLocaleDateString()}
                                        )
                                    </li>
                                </ul>

                                {i + 1 === items.length ? (
                                    ''
                                ) : (
                                    <div className="hr"></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="footer-item"> </div>
                </li>

                {this.state.showPopup ? (
                    <Popup
                        text="Close Me"
                        closePopup={this.togglePopup.bind(this)}
                        item={this.state.currItem}
                    />
                ) : null}
            </React.Fragment>
        );
    }
}
