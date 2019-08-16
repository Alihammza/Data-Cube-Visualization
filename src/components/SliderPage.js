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
            coefficients: null,
            rangeKeys: null,
            ranges: null,
            values: null
        };
    }

    // There we trigger initial min/max range values for the keys (longitude, latitude and unix)
    componentDidMount() {
        const url = API + this.props.query + '&' + this.props.format;
        axios.get(url).then(resp => {
            let xmltojson = JSON.parse(convert.xml2json(resp.data,{compact:false,spaces:4}));
            const lower = xmltojson.elements[0].elements[0].elements[0].elements[0].elements[0].text;
            const upper = xmltojson.elements[0].elements[0].elements[0].elements[1].elements[0].text;
            const rangeKeys = (xmltojson.elements[0].elements[1].elements[0].elements[1].elements[0].text).split(' ');
            const startValues = lower.split(' ');
            const endValues = upper.split(' ');
            const minLatitude = startValues[0];
            const maxLatitude = endValues[0];
            const minLongitude = startValues[1];
            const maxLongitude = endValues[1];
            const coefficients = (xmltojson.elements[0].elements[1].elements[0].elements[5].elements[0].elements[1].elements[0].text).split(' ');
            const unixRange = [];
            coefficients.forEach((val, i) => {
                let value = val.replace(/[ "/]/g, '');
                value = moment(value, moment.HTML5_FMT.DATETIME_LOCAL_MS).unix();
                unixRange.push(value);
            });

            this.setState({
                coefficients: unixRange,
                ranges: {
                    [rangeKeys[0]]: {
                        start: parseInt(minLatitude, 10),
                        end: parseInt(maxLatitude, 10)
                    },
                    [rangeKeys[1]]: {
                        start: parseInt(minLongitude, 10),
                        end: parseInt(maxLongitude, 10)
                    },
                    [rangeKeys[2]]: {
                        start: 0,
                        end: unixRange.length-1
                    }
                },
                values: {
                    [rangeKeys[0]]: {
                        start: parseInt(minLatitude, 10),
                        end: parseInt(maxLatitude, 10)
                    },
                    [rangeKeys[1]]: {
                        start: parseInt(minLongitude, 10),
                        end: parseInt(maxLongitude, 10)
                    },
                    [rangeKeys[2]]: {
                        start: unixRange[0],
                        end: unixRange[unixRange.length-1]
                    }
                },
                rangeKeys: rangeKeys
            }, () => {
                this.onSaveNewRangeValues();
                this.props.onRangeKeysLoad(this.state.rangeKeys);
            })
        }).catch(err => console.log(err))
    }

    // This returns a formatted string in Unix time and appends 00:00:00.000Z to the end.
    getFormattedUnix = (unix) => {
        return moment.unix(unix).format('YYYY-MM-DD[T]00:00:00') + '.000Z';
    }

    onChange = (value, key) => {
        this.setState({
            values: {
                ...this.state.values,
                [key]: {
                    start: value[0],
                    end: value[1],
                }
            }
        });
    }

    onUnixChange = (value, key) => {
        this.setState({
            values: {
                ...this.state.values,
                [key]: {
                    start: this.state.coefficients[value[0]],
                    end: this.state.coefficients[value[1]],
                }
            }
        });
    }

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
        const { ranges, values, rangeKeys } = this.state;

        if (!rangeKeys) {
            return <div className="sliderContainer">Loading sliders...</div>;
        }
        return (<div className="sliderContainer">
            <div className='sliderWrapper'>
                <Range
                    allowCross={false}
                    min={ranges[rangeKeys[0]].start}
                    max={ranges[rangeKeys[0]].end}
                    value={[values[rangeKeys[0]].start, values[rangeKeys[0]].end]}
                    onChange={(values) => this.onChange(values, rangeKeys[0])}
                    onAfterChange={this.onSaveNewRangeValues}
                />
            </div>
            <div>
                <p className="valueText">{rangeKeys[0]} start: {values[rangeKeys[0]].start}</p>
                <p className="valueText">{rangeKeys[0]} end: {values[rangeKeys[0]].end}</p>
            </div>

            <div className='sliderWrapper'>
                <Range
                    allowCross={false}
                    min={ranges[rangeKeys[1]].start}
                    max={ranges[rangeKeys[1]].end}
                    value={[values[rangeKeys[1]].start, values[rangeKeys[1]].end]}
                    onChange={(values) => this.onChange(values, rangeKeys[1])}
                    onAfterChange={this.onSaveNewRangeValues}
                />
            </div>
            <div>
                <p className="valueText">{rangeKeys[1]} start: {values[rangeKeys[1]].start}</p>
                <p className="valueText">{rangeKeys[1]} end: {values[rangeKeys[1]].end}</p>
            </div>

            <div className='sliderWrapper'>
                <Range
                    allowCross={false}
                    min={ranges[rangeKeys[2]].start}
                    max={ranges[rangeKeys[2]].end}
                    onChange={(value) => this.onUnixChange(value, rangeKeys[2])}
                    onAfterChange={this.onSaveNewRangeValues}
                />
            </div>
            <div>
                <p className="valueText">{rangeKeys[2]} start: {this.getFormattedUnix(values[rangeKeys[2]].start)}</p>
                <p className="valueText">{rangeKeys[2]} end: {this.getFormattedUnix(values[rangeKeys[2]].end)}</p>
            </div>

        </div>);
    }
}
