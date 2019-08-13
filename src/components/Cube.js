import React, {Component} from 'react';
import axios from 'axios';
import convert from 'xml-js'
import THREE from '../three'
import 'three/examples/js/controls/OrbitControls';
import {API} from '../App';

class Cube extends Component {
    constructor(props) {
        super(props)
        this.state = {
            low: [],
            high: []
        }
    }

    /*  - Initial rendering of cube and loading message.
        - Triggers fetching of initial low/high values to try to redimension the cube.
    */
    componentDidMount() {
        this.drawInitialCube();
        this.fetchInitialDimensions();
    }

    // Every time we are provided with new ranges Prop triggers textures/images reloading.
    componentDidUpdate(prevProps) {
        if (prevProps.ranges !== this.props.ranges) {
            this.loadImages();
        }
    }

    fetchInitialDimensions = () => {
        axios.get(API + this.props.query + '&' + this.props.format).then(resp => {
            const xmltojson = convert.xml2json(resp.data, {
                compact: false,
                spaces: 4
            });
            const json = JSON.parse(xmltojson);
            const low = json.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].elements[0].text;
            const high = json.elements[0].elements[1].elements[0].elements[0].elements[0].elements[1].elements[0].text;
            const lowpoints = low.split(' ');
            const highpoints = high.split(' ');
            for (let i = 0; i < highpoints.length; i++) {
                highpoints[i] = + highpoints[i];
            }
            for (let j = 0; j < lowpoints.length; j++) {
                lowpoints[j] = + lowpoints[j];
            }
            this.setState({
                low: lowpoints,
                high: highpoints
            }, () => {
                this.cubeRedimension();
            });
        }).catch(err => console.log(err));
    }

    cubeRedimension = () => {
        const lat = this.state.high[0] - this.state.low[0];
        const long = this.state.high[1] - this.state.low[1];
        const unix = this.state.high[2] - this.state.low[2];
        this.cube.geometry.scale(lat, long, unix);
        this.camera.position.z = long;
    }

    drawInitialCube = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({antialias: true});
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        const textureLoader = new THREE.TextureLoader();

        // You can modify this loading.png image which is a placeholder to show when there are no ranges yet.
        const texture = textureLoader.load('./images/loading.png');
        const material = new THREE.MeshBasicMaterial({map: texture});
        var cubegeometry = new THREE.BoxGeometry(0, 0, 0);
        let cube = new THREE.Mesh(cubegeometry, material);

        camera.position.z = 4;
        controls.update();

        scene.add(cube);
        renderer.setClearColor('#000000');
        renderer.setSize(width, height);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.cube = cube;
        this.controls = controls;

        window.addEventListener('resize', this.handleResize);

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    loadImages = () => {
        const {ranges, keyForSet, query} = this.props;
        const textureLoader = new THREE.TextureLoader();
        const imageFormat = '&FORMAT=image/png';
        textureLoader.crossOrigin = "Anonymous";

        // We construct url's by reusing the passed (query, keyForSet) from the form and the ranges from slider component.
        const unixStartImage = API + query + '&' + keyForSet + '=' + 'unix("' + ranges.unix.start + '")' + imageFormat;
        const unixEndImage = API + query + '&' + keyForSet + '=' + 'unix("' + ranges.unix.end + '")' + imageFormat;
        const longStart = API + query + '&' + keyForSet + '=' + 'Long(' + ranges.longitude.start + ')' + imageFormat;
        const longEnd = API + query + '&' + keyForSet + '=' + 'Long(' + ranges.longitude.end + ')' + imageFormat;
        const latStart = API + query + '&' + keyForSet + '=' + 'Lat(' + ranges.latitude.start + ')' + imageFormat;
        const latEnd = API + query + '&' + keyForSet + '=' + 'Lat(' + ranges.latitude.end + ')' + imageFormat;

        const texture0 = textureLoader.load(longStart);
        const texture1 = textureLoader.load(longEnd);
        const texture2 = textureLoader.load(latStart);
        const texture3 = textureLoader.load(latEnd);
        const texture4 = textureLoader.load(unixStartImage);
        const texture5 = textureLoader.load(unixEndImage);

        const material = [
            new THREE.MeshBasicMaterial({map: texture0}),
            new THREE.MeshBasicMaterial({map: texture1}),
            new THREE.MeshBasicMaterial({map: texture2}),
            new THREE.MeshBasicMaterial({map: texture3}),
            new THREE.MeshBasicMaterial({map: texture4}),
            new THREE.MeshBasicMaterial({map: texture5}),
        ];

        this.cube.material = material;
    }

    handleResize = () => {
        const width = this.mount.clientWidth
        const height = this.mount.clientHeight
        this.renderer.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    animate = () => {
        this.controls.update();
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    renderScene = () => {
        this.renderer.render(this.scene, this.camera)
    }

    render() {
        return (<div className="vis" ref={ mount => { this.mount = mount }}/>)
    }
}

export default Cube
