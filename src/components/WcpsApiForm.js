import React, { Component } from 'react';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

var id = 1;
var previousId = 0;

export default class WcpsAPIForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            querywcps: props.querywcps,
            queryWCPS: props.querywcps,
            keyForSetWcps: props.keyForSetWcps,
            inputBoxes: [0],
            renderWCPS: this.props.renderWCPS,
            dimensions: []
        }
        this.handleQueryChange = this.handleQueryChange.bind(this);
        this.handleKeyChange = this.handleKeyChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addInput = this.addInput.bind(this);
    }

    handleQueryChange(event) {
        var queryWCPS = this.state.queryWCPS;
        var index = event.target.id;
        queryWCPS[index] = event.target.value;
        previousId = parseInt(index);
        this.setState({ queryWCPS: queryWCPS });
    }

    handleKeyChange(event) {
        previousId = null
        this.setState({ keyForSetWcps: event.target.value });
    }

    handleSubmit(event) {
        var queryParams = ""
        var parseQuery = "query=for ";

        for (var i=0; i< this.state.querywcps.length; i++) {
            queryParams = this.state.querywcps[i].split(" ");
            parseQuery += queryParams[0] + " in " + queryParams[1] + " ,"
        }
        parseQuery = parseQuery.substring(0, parseQuery.length - 2);
        parseQuery += " return encode(" + this.state.keyForSetWcps;

        var dimensions = []
        var splitkeyForSet = this.state.keyForSetWcps.split(",");
        
        splitkeyForSet[0] = splitkeyForSet[0].split("[")[1]
        dimensions[0] = splitkeyForSet[0].split("(")[0]
        dimensions[1] = splitkeyForSet[1].split("(")[0].split(" ")[1]
        dimensions[2] = splitkeyForSet[2].split("(")[0].split(" ")[1]

        this.state.dimensions = dimensions;
        this.state.querywcps = parseQuery;
        this.state.renderWCPS = true
        this.props.onSubmit(this.state);
        event.preventDefault();
    }

    addInput() {
        this.setState({
            inputBoxes: this.state.inputBoxes.concat(id)
        })
        id = id + 1;
    }

    render() {
        const disabled = !(this.state.queryWCPS.length > 0 && this.state.keyForSetWcps.length > 0);
        // let zipped = this.state.inputBoxes.map((x, i) => [x, this.state.query[i]]);
        const Input = () => (
            this.state.inputBoxes.map((input) => (
                <input
                    onChange={this.handleQueryChange}
                    type="text"
                    className="form-control"
                    id={input}
                    key={input.toString()}
                    value={this.state.queryWCPS[input]}
                    placeholder="$c (AvgLandTemp)"
                    autoFocus={previousId === parseInt(input) ? true : false}
                />
            ))
        );
        return (
            <form key="my-form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="query">Query:</label>
                    <Fab onClick={this.addInput} style={{ marginLeft: '60%' }} size="small" aria-label="add">
                        <AddIcon />
                    </Fab>
                    <Input />
                </div>
                <div className="form-group">
                    <label htmlFor="keyForSet">Key string:</label>
                    <input
                        onChange={this.handleKeyChange}
                        type="text"
                        className="form-control"
                        id="keyForSet"
                        value={this.state.keyForSetWcps}
                        placeholder='$c[Lat(0:10), Long(0:10), ansi("2014-01":"2014-12")]' />
                </div>
                <button disabled={disabled} onSubmit={this.handleSubmit} type="submit" className="btn btn-primary">Submit</button>
            </form>
        );
    }
}
