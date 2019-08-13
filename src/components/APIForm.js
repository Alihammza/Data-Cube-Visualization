import React, {Component} from 'react';

export default class APIForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: props.query,
            format: props.format,
            keyForSet: props.keyForSet
        }
        this.handleQueryChange = this.handleQueryChange.bind(this);
        this.handleKeyChange = this.handleKeyChange.bind(this);
        this.handleFormatChange = this.handleFormatChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleQueryChange(event) {
        this.setState({query: event.target.value});
    }

    handleKeyChange(event) {
        this.setState({keyForSet: event.target.value});
    }

    handleFormatChange(event) {
        this.setState({format: event.target.value});
    }

    handleSubmit(event) {
        this.props.onSubmit(this.state);
        event.preventDefault();
    }

    render() {
        const disabled = !(this.state.query.length > 0 && this.state.format.length > 0 && this.state.keyForSet.length > 0);
        return (<form onSubmit={this.handleSubmit}>
            <div className="form-group">
                <label htmlFor="query">Query:</label>
                <input onChange={this.handleQueryChange} type="text" className="form-control" id="query" value={this.state.query}/>
            </div>
            <div className="form-group">
                <label htmlFor="keyForSet">Key string:</label>
                <input onChange={this.handleKeyChange} type="text" className="form-control" id="keyForSet" value={this.state.keyForSet}/>
            </div>
            <div className="form-group">
                <label htmlFor="format">Default format:</label>
                <input onChange={this.handleFormatChange} type="text" className="form-control" id="format" value={this.state.format}/>
            </div>
            <button disabled={disabled} onSubmit={this.handleSubmit} type="submit" className="btn btn-primary">Submit</button>
        </form>);
    }
}
