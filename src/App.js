import React, {Component} from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import SliderControlled from './components/SliderPage'
import Cube from './components/Cube';
import APIForm from './components/APIForm';
import './App.css';

/* Default api parameters from ows.rasdaman.org user can later input a different query.
    query - This is the part where you pick a service, version, request and coverageId
    format - This is only to obtain initial values for sliders by default we use xml but user can input other.
    keyForSet - This key value is needed to construct a query to get images per specific ranges key, it is by
    default SUBSET which will translate later when obtaining images into `SUBSET=Long(??)`.
    API - This value is the default server which is providing OWS services.
*/
const defaultQuery = 'SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=AverageChlorophyllScaled';
const defaultFormat = 'FORMAT=application/gml+xml';
const defaultKeyForSet = 'SUBSET';
export const API = 'http://ows.rasdaman.org/rasdaman/ows?';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: defaultQuery,
            format: defaultFormat,
            keyForSet: defaultKeyForSet,
            ranges: null
        };
    }

    handleRangeValuesChange = (values) => {
        this.setState({ ranges: values });
    }

    handleSubmit = (data) => {
        this.setState(data);
    }

    render() {
        return (
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
                    />
                </div>
                <div className="cube-container col-sm-12 col-md-9">
                    <Cube
                        query={this.state.query}
                        keyForSet={this.state.keyForSet}
                        format={this.state.format}
                        ranges={this.state.ranges}
                    />
                </div>
            </div>
        );
    }
}

export default App;
