import React, { Component } from 'react';

import {
    Crosshair,
    XYPlot,
    LineSeries,
    VerticalGridLines,
    HorizontalGridLines,
    XAxis,
    YAxis,
} from 'react-vis';

import '../style/react-vis.css';

export default class Graph extends Component<
    {
        data: any[];
        type: string;
    },
    { crosshairValues: any[] }
> {
    constructor(props: any) {
        super(props);
        this.state = {
            crosshairValues: [],
        };
    }

    componentDidMount() {}

    _onMouseLeave = () => {
        this.setState({ crosshairValues: [] });
    };

    _onNearestX = (value: any, { index }: any) => {
        this.setState({
            crosshairValues: [this.props.data].map((d) => d[index]),
        });
    };

    render() {
        return (
            <XYPlot
                style={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    overflow: 'auto',
                }}
                onMouseLeave={this._onMouseLeave}
                width={1000}
                height={400}
                xType="time"
                getX={(item: any) => item.created_at}
                getY={(item: any) => item.value}
                yDomain={
                    this.props.type === 'Temperature'
                        ? [0, 40]
                        : this.props.type === 'Humidity'
                        ? [0, 100]
                        : null
                }
            >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis title="Time" />
                <YAxis title={this.props.type} />
                <LineSeries
                    onNearestX={this._onNearestX}
                    data={this.props.data}
                    curve={'curveMonotoneX'}
                />
                <Crosshair
                    values={this.state.crosshairValues}
                    titleFormat={(d) => ({
                        title: 'Reading',
                        value: d[0].id,
                    })}
                    itemsFormat={(d) => [
                        { title: d[0].type, value: d[0].value },
                        {
                            title: 'Date',
                            value: d[0].created_at.toLocaleDateString(),
                        },
                        {
                            title: 'Time',
                            value: d[0].created_at.toLocaleTimeString(),
                        },
                    ]}
                />
            </XYPlot>
        );
    }
}
