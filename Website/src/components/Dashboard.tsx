import React, { Component } from 'react';
import Card from './Card';

import '../style/Dashboard.scss';

interface Sensor {
    id: number;
    name: string;
    category: string;
    description: string;

    type: string;
    value: number;
    created_at: Date;
}

interface IProp {}

interface IState {
    error: null;
    isLoaded: Boolean;
    items: Map<Number, Sensor[]>;
}

export default class Dashboard extends Component<IProp, IState> {
    intervalID: any;

    state = {
        error: null,
        isLoaded: false,
        items: new Map<Number, Sensor[]>(),
    };

    componentDidMount() {
        // call getData() again in 60 seconds
        this.getData();
        this.intervalID = setInterval(this.getData, 60000);
    }

    componentWillUnmount() {
        /*
          stop getData() from continuing to run even
          after unmounting this component. Notice we are calling
          'clearTimeout()` here rather than `clearInterval()` as
          in the previous example.
        */
        clearInterval(this.intervalID);
    }

    getData = async () => {
        await fetch('http://92.35.19.153:5423/api/v1/latest')
            .then((response) => response.json())
            .then(
                (responseJson) => {
                    let status = responseJson.status;
                    let items: Sensor[] = responseJson.data;

                    if (status !== 'success') {
                        console.log(`Error: ${responseJson.error}`);

                        this.setState({
                            isLoaded: false,
                            error: responseJson.error,
                        });
                    }

                    items = items.map((item: Sensor) => {
                        item.created_at = new Date(item.created_at);
                        return item;
                    });

                    if (items && items.length > 0) {
                        items.sort((a, b) => a.id - b.id);

                        console.table([...items]);

                        const keep = new Map<number, Sensor[]>();
                        for (const item of items) {
                            let list: Sensor[] = [item];

                            if (keep.has(item.id)) {
                                const temp: any = keep.get(item.id);
                                list.push(...temp);
                            }
                            keep.set(item.id, list);
                        }

                        this.setState({
                            error: null,
                            isLoaded: true,
                            items: keep,
                        });
                    } else {
                        this.setState({
                            isLoaded: false,
                        });
                    }
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

    componentDidUpdate() {
        let numberOfSensors = 0;
        Array.from(this.state.items).map(
            ([key, items]) => (numberOfSensors += items.length)
        );

        document.title = `Awot | Watching ${numberOfSensors} Sensors`;
    }

    render() {
        const itemsMap = this.state.items;

        return (
            <React.Fragment>
                {this.state.isLoaded ? (
                    <ul className="container">
                        {Array.from(itemsMap).map(([key, items]) => (
                            <Card items={items} />
                        ))}
                    </ul>
                ) : (
                    <div>
                        {' '}
                        <br /> Calling sensor API...{' '}
                    </div>
                )}
            </React.Fragment>
        );
    }
}
