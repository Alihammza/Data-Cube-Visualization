import React, { Component, Fragment } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import SliderControlled from './components/SliderPage'
import Cube from './components/Cube';
import APIForm from './components/APIForm';
import WcpsAPIForm from './components/WcpsApiForm';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';

import './App.css';
// import { stat } from 'fs';

/* Default api parameters from ows.rasdaman.org user can later input a different query.
    query - This is the part where you pick a service, version, request and coverageId
    format - This is only to obtain initial values for sliders by default we use xml but user can input other.
    keyForSet - This key value is needed to construct a query to get images per specific ranges key, it is by
    default SUBSET which will translate later when obtaining images into `SUBSET=Long(??)`.
    API - This value is the default server which is providing OWS services.
*/
let defaultQuery = 'SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=AverageChlorophyllScaled';
let defaultFormat = 'FORMAT=application/gml+xml';
let defaultKeyForSet = 'SUBSET';
export const API = 'http://ows.rasdaman.org/rasdaman/ows?';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: defaultQuery,
            format: defaultFormat,
            keyForSet: defaultKeyForSet,
            ranges: null,
            rangeKeys: null,
            renderWCPS: false,
            formtype: "wcs",
            dimensions: [],
            querywcps: [],
            keyForSetWcps: ''
        };

        this.handleFormChange = this.handleFormChange.bind(this);
    }

    handleRangeValuesChange = (values) => {
        this.setState({ ranges: values });
    }

    handleRangeKeysLoad = (keys) => {
        this.setState({ rangeKeys: keys });
    };

    handleSubmit = (data) => {
        this.setState(data);
    }
    handleFormChange(event) {
        if (event.target.value === 'wcps') {
            this.setState({
                formtype: event.target.value,
            })
        }
        else {
            window.location.reload();
        }
    }

    render() {
        return (
            <Fragment>

                <RadioGroup
                    className="add-margin"
                    aria-label="form type"
                    name="formtype"
                    value={this.state.formtype}
                    onChange={this.handleFormChange}
                    row
                >
                    <FormLabel component="legend">Choose the Form Type</FormLabel>
                    <FormControlLabel
                        value="wcs"
                        control={<Radio color="primary" />}
                        label="WCS"
                        labelPlacement="end"
                    />
                    <FormControlLabel
                        value="wcps"
                        control={<Radio color="primary" />}
                        label="WCPS"
                        labelPlacement="end"
                    />
                </RadioGroup>
                {this.state.formtype === "wcs" ?
                    <div className="app-container">
                        <div className="sidebar col-sm-12 col-md-3">
                            <APIForm
                                query={this.state.query}
                                format={this.state.format}
                                keyForSet={this.state.keyForSet}
                                onSubmit={this.handleSubmit}
                            />
                            <SliderControlled
                                query={this.state.query}
                                format={this.state.format}
                                onRangeValuesChange={this.handleRangeValuesChange}
                                onRangeKeysLoad={this.handleRangeKeysLoad}
                            />
                        </div>
                        <div className="cube-container col-sm-12 col-md-9">
                            <Cube
                                query={this.state.query}
                                keyForSet={this.state.keyForSet}
                                format={this.state.format}
                                ranges={this.state.ranges}
                                rangeKeys={this.state.rangeKeys}
                                type='wcs'
                            />
                        </div>
                    </div>
                    :
                    <div className="app-container">
                        <div className="sidebar col-sm-12 col-md-3">
                            <WcpsAPIForm
                                querywcps={this.state.querywcps}
                                keyForSetWcps={this.state.keyForSetWcps}
                                onSubmit={this.handleSubmit}
                                dimensions={this.state.dimensions}
                            />
                        </div>
                        <div className="cube-container col-sm-12 col-md-9">
                            {this.state.renderWCPS ?
                                <Cube
                                    query={this.state.querywcps}
                                    keyForSet={this.state.keyForSetWcps}
                                    format={this.state.format}
                                    type='wcps'
                                    dimensionsParams={this.state.dimensions}
                                />
                                :
                                null
                            }
                        </div>
                    </div>
                }
            </Fragment>
        );
    }
}

export default App;
