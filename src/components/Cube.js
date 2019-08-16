import React, {Component} from 'react';
import axios from 'axios';
import convert from 'xml-js'
import THREE from '../three'
import 'three/examples/js/controls/OrbitControls';
import {API} from '../App';

function getKeyValueFromMap(obj, key, path) {
    return key + '("' + obj[key][path] + '")';
}

class Cube extends Component {
    constructor(props) {
        super(props)
        this.state = {
            axisX: null,
            axisY: null,
            axisZ: null,
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
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.ranges !== this.props.ranges) {
            this.cubeRedimension();
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
            const set1 = json.elements[0].elements[1].elements[0].elements[3].elements[0].elements[0].elements[0].text;
            const set2 = json.elements[0].elements[1].elements[0].elements[4].elements[0].elements[0].elements[0].text;

            const high = json.elements[0].elements[1].elements[0].elements[0].elements[0].elements[1].elements[0].text;
            const low = json.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].elements[0].text;

            const highValues = high.split(' ');
            const lowValues = low.split(' ');

            const lat = parseInt(highValues[0], 10) - parseInt(lowValues[0], 10);
            const long = parseInt(highValues[1], 10) - parseInt(lowValues[1], 10);
            const z = parseInt(highValues[2], 10) - parseInt(lowValues[2], 10);

            if (set1 && set2) {
                const set1Values = set1.split(' ');
                const set2Values = set2.split(' ');
                const newState = {};
                if (set1Values[0] !== "0") {
                    newState.axisX = Math.abs(parseFloat(set1Values[0]));
                }
                if (set1Values[1] !== "0") {
                    newState.axisY = Math.abs(parseFloat(set1Values[1]));
                }
                if (set2Values[0] !== "0") {
                    newState.axisX = Math.abs(parseFloat(set2Values[0]));
                }
                if (set2Values[1] !== "0") {
                    newState.axisY = Math.abs(parseFloat(set2Values[1]));
                }
                newState.axisZ = z;
                this.setState(newState, () => {
                    this.cube.scale.set(lat, long, z);
                    this.camera.position.z = long;
                });
            }

        }).catch(err => console.log(err));
    }

    cubeRedimension = () => {
        const { ranges, rangeKeys } = this.props;
        const lat = (ranges[rangeKeys[0]].end - ranges[rangeKeys[0]].start) / this.state.axisX;
        const long = (ranges[rangeKeys[1]].end - ranges[rangeKeys[1]].start) / this.state.axisY;

        if (this.state.axisX !== null || this.state.axisY !== null) {
            this.cube.scale.set(lat, long, this.state.axisZ || 5);
            this.camera.position.z = long;
        }
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
        renderer.setClearColor('#ffffff');
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
        const {ranges, keyForSet, query, rangeKeys} = this.props;
        const textureLoader = new THREE.TextureLoader();
        const imageFormat = '&FORMAT=image/png';
        textureLoader.crossOrigin = "Anonymous";

        // We construct url's by reusing the passed (query, keyForSet) from the form and the ranges from slider component.
        const latStart = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[0], 'start') + imageFormat;
        const latEnd = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[0], 'end') + imageFormat;
        const longStart = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[1], 'start') + imageFormat;
        const longEnd = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[1], 'end') + imageFormat;
        const unixStartImage = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[2], 'start') + imageFormat;
        const unixEndImage = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[2], 'end') + imageFormat;

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
