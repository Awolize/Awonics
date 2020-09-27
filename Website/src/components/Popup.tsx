import React, { Component } from 'react';
import '../style/Popup.scss';

import Graph from './Graph';

interface Sensor {
    id: number;
    name: string;
    category: string;
    description: string;

    type: string;
    value: number;
    created_at: Date;
}

interface Reading {
    created_at: Date;
    id: number;
    sensorid: number;
    type: string;
    value: string;
}

interface IProp {
    text: string;
    closePopup: any;
    item: Sensor;
}

const Interval = {
    Day: 1,
    Week: 7,
    Month: 30,
    Year: 365,
};

interface IState {
    showPopup: boolean;
    error: null;
    isLoaded: Boolean;
    data: Reading[];
    interval: number;
}

export default class Popup extends Component<IProp, IState> {
    toggleShow(params: boolean) {
        console.log(params);

        this.props.closePopup();
    }

    state = {
        showPopup: true,
        error: null,
        isLoaded: false,
        data: [
            {
                id: 0,
                sensorid: 1,
                type: 'Temperature',
                value: '15',
                created_at: new Date(),
            },
        ],
        interval: Interval.Month,
    };

    getData = async (interval: number) => {
        await fetch(
            // CHANGE DB FETCH / SELECT
            // TO GROUP BY DATE AND LIMIT BASED ON DATE INSTEAD eg last 30 days
            `http://92.35.19.153:5423/api/v1/readings/id` +
                `?id=${this.props.item.id}` +
                `&type=${this.props.item.type}` +
                `&days=${interval}` +
                `&limit=99999`
        )
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    let status = responseJson.status;

                    let data: Reading[] = responseJson.data;

                    if (status !== 'success') {
                        console.log(`Error: ${responseJson.error}`);

                        this.setState({
                            isLoaded: false,
                            error: responseJson.error,
                        });
                        return;
                    }

                    data = data.map((item: Reading) => {
                        item.created_at = new Date(item.created_at);
                        return item;
                    });

                    this.setState({
                        isLoaded: true,
                        data: data,
                    });
                },
                (error) => {
                    console.log(`Error: ${error}`);
                    this.setState({
                        isLoaded: false,
                        error,
                    });
                    return;
                }
            );
    };

    componentDidMount() {
        this.getData(Interval.Month);
    }

    randomReading(value: number) {
        let lastId: number = Math.max.apply(
            Math,
            this.state.data.map(function (o: Reading) {
                return o.id;
            })
        );

        let item: Reading = {
            id: lastId + 1,
            sensorid: 1,
            type: 'Temperature',
            value: value.toString(),
            created_at: new Date(),
        };

        return item;
    }

    handleIntervalClick(interval: number) {
        this.setState({
            interval: interval,
        });

        this.getData(interval);
    }

    render() {
        return (
            <div className="popup">
                <div
                    className="shadowArea"
                    onClick={() => this.toggleShow(true)}
                ></div>

                <div className="popup_inner">
                    {/* Header*/}
                    <div style={{ border: '0px solid red' }}>
                        {this.props.item.name}
                    </div>

                    {/* Graph*/}
                    <div
                        style={{
                            border: '0px solid yellow',
                            padding: '20px',
                            overflow: 'auto',
                            boxSizing: 'border-box',
                            width: '100%',

                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {this.state.isLoaded ? (
                            <Graph
                                data={this.state.data}
                                type={this.props.item.type}
                            />
                        ) : (
                            'Loading <Graph>...'
                        )}
                    </div>

                    <div
                        style={{
                            border: '0px solid red',
                        }}
                    >
                        <div className="dataSize">
                            <span>
                                {this.state.isLoaded
                                    ? this.state.data.length
                                    : ''}
                            </span>
                        </div>

                        <button
                            style={{
                                padding: '20px',
                                width: '50%',
                            }}
                            onClick={this.props.closePopup}
                        >
                            Back
                        </button>

                        <div className="dropdown">
                            <button className="dropbtn">
                                <span>{this.state.interval} Days</span>
                            </button>
                            <div className="dropdown-content">
                                {Object.values(Interval).map((key: any) => {
                                    return (
                                        <a
                                            onClick={() =>
                                                this.handleIntervalClick(key)
                                            }
                                        >
                                            {key} Days
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
