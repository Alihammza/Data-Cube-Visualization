import 'rc-slider/assets/index.css';
import React, {Component} from 'react';
import axios from 'axios';
import convert from 'xml-js';
import Slider from 'rc-slider';
import moment from 'moment';
import { API } from '../App';
import '../style/SliderPage.css';

const Range = Slider.Range;

export default class SliderControlled extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ranges: {
                longitude: {
                    start: 0,
                    end: 0
                },
                latitude: {
                    start: 0,
                    end: 0
                },
                unix: {
                    start: 0,
                    end: 0
                }
            },
            values: {
                longitude: {
                    start: 0,
                    end: 0
                },
                latitude: {
                    start: 0,
                    end: 0
                },
                unix: {
                    start: 0,
                    end: 0
                }
            }
        };
    }

    // There we trigger initial min/max range values for the keys (longitude, latitude and unix)
    componentDidMount() {
        const url = API + this.props.query + '&' + this.props.format;
        axios.get(url).then(resp => {
            let xmltojson = JSON.parse(convert.xml2json(resp.data,{compact:false,spaces:4}));
            const lower = xmltojson.elements[0].elements[0].elements[0].elements[0].elements[0].text;
            const upper = xmltojson.elements[0].elements[0].elements[0].elements[1].elements[0].text;
            const startValues = lower.split(' ');
            const endValues = upper.split(' ');
            const minLongitude = startValues[1];
            const maxLongitude = endValues[1];
            const minLatitude = startValues[0];
            const maxLatitude = endValues[0];
            const minUnix = startValues[2];
            const maxUnix = endValues[2];

            this.setState({
                ranges: {
                    longitude: {
                        start: parseInt(minLongitude, 10),
                        end: parseInt(maxLongitude, 10)
                    },
                    latitude: {
                        start: parseInt(minLatitude, 10),
                        end: parseInt(maxLatitude, 10)
                    },
                    unix: {
                        start: moment(minUnix, moment.HTML5_FMT.DATETIME_LOCAL_MS).unix(),
                        end: moment(maxUnix, moment.HTML5_FMT.DATETIME_LOCAL_MS).unix()
                    }
                },
                values: {
                    longitude: {
                        start: parseInt(minLongitude, 10),
                        end: parseInt(maxLongitude, 10)
                    },
                    latitude: {
                        start: parseInt(minLatitude, 10),
                        end: parseInt(maxLatitude, 10)
                    },
                    unix: {
                        start: moment(minUnix, moment.HTML5_FMT.DATETIME_LOCAL_MS).unix(),
                        end: moment(maxUnix, moment.HTML5_FMT.DATETIME_LOCAL_MS).unix()
                    }
                }
            }, () => {
                this.onSaveNewRangeValues();
            })
        }).catch(err => console.log(err))
    }

    // This returns a formatted string in Unix time and appends 00:00:00.000Z to the end.
    getFormattedUnix = (unix) => {
        return moment.unix(unix).format('YYYY-MM-DD[T]00:00:00') + '.000Z';
    }

    onLatitudeChange = (value) => {
        this.setState({
            values: {
                ...this.state.values,
                latitude: {
                    start: value[0],
                    end: value[1],
                }
            }
        });
    };
    onLongitudeChange = (value) => {
        this.setState({
            values: {
                ...this.state.values,
                longitude: {
                    start: value[0],
                    end: value[1],
                }
            }
        });
    };
    onUnixChange = (value) => {
        this.setState({
            values: {
                ...this.state.values,
                unix: {
                    start: value[0],
                    end: value[1],
                }
            }
        });
    };

    onSaveNewRangeValues = () => {
        const { values } = this.state;
        const data = {
            ...values,
            unix: {
                start: this.getFormattedUnix(values.unix.start),
                end: this.getFormattedUnix(values.unix.end)
            }
        };
        this.props.onRangeValuesChange(data);
    }

    render() {
        const { ranges, values } = this.state;

        return (<div className="sliderContainer">
            <div className='sliderWrapper'>
                <Range
                    allowCross={false}
                    min={ranges.longitude.start}
                    max={ranges.longitude.end}
                    value={[values.longitude.start, values.longitude.end]}
                    onChange={this.onLongitudeChange}
                    onAfterChange={this.onSaveNewRangeValues}
                />
            </div>
            <div>
                <p className="valueText">Longitude start: {values.longitude.start}</p>
                <p className="valueText">Longitude end: {values.longitude.end}</p>
            </div>

            <div className='sliderWrapper'>
                <Range
                    allowCross={false}
                    min={ranges.latitude.start}
                    max={ranges.latitude.end}
                    value={[values.latitude.start, values.latitude.end]}
                    onChange={this.onLatitudeChange}
                    onAfterChange={this.onSaveNewRangeValues}
                />
            </div>
            <div>
                <p className="valueText">Latitude start: {values.latitude.start}</p>
                <p className="valueText">Latitude end: {values.latitude.end}</p>
            </div>

            <div className='sliderWrapper'>
                <Range
                    min={ranges.unix.start}
                    max={ranges.unix.end}
                    value={[values.unix.start, values.unix.end]}
                    onChange={this.onUnixChange}
                    onAfterChange={this.onSaveNewRangeValues}
                />
            </div>
            <div>
                <p className="valueText">Unix start: {this.getFormattedUnix(values.unix.start)}</p>
                <p className="valueText">Unix end: { this.getFormattedUnix(values.unix.end)}</p>
            </div>
        </div>);
    }
}
