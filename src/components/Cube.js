import React, { Component } from 'react';
import axios from 'axios';
import convert from 'xml-js'
import THREE from '../three'
import 'three/examples/js/controls/OrbitControls';
import { API } from '../App';

function getKeyValueFromMap(obj, key, path) {
    return key + '("' + obj[key][path] + '")';
}

// For scaling
const THRESHOLD = 5000;
let scaleFactor = 1;

class Cube extends Component {
    constructor(props) {
        super(props)
        this.state = {
            axisX: null,
            axisY: null,
            axisZ: null,
            Formtype: props.type,
            ShouldRender: false,
            highValues: null,
            lowValues: null
        }
        this.handleResize = this.handleResize.bind(this);
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
        if (this.props.type === 'wcps' & this.state.ShouldRender === true) {
            this.loadWCPSImages();
        }
    }

    fetchInitialDimensions = () => {
        var fetchQuery = ""
        if (this.props.type === 'wcs') {
            fetchQuery = API + this.props.query + '&' + this.props.format;
            // fetchQuery = fetchQuery.replace('GetCoverage', 'DescribeCoverage');
            axios.get(fetchQuery).then(resp => {
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
        else {
            const newState = {};
            var dimensions = []
            var dimensionsParams = this.props.dimensionsParams;
            for (var i = 0; i < dimensionsParams.length; i++) {
                fetchQuery = API + this.props.query + ', ' + dimensionsParams[i] + ')';
                fetchQuery = fetchQuery.replace("encode", "imageCrsDomain")
                axios.get(fetchQuery).then(resp => {
                    var temp = resp['data'].split(":")
                    temp = parseInt(temp[1].split(")")[0]) - parseInt(temp[0].split("(")[1])
                    dimensions.push(temp);
                }).then(() => {
                    if (dimensions.length === 3) {
                        newState.ShouldRender = true
                    }
                    newState.axisX = dimensions[0]
                    newState.axisY = dimensions[1]
                    newState.axisZ = dimensions[2]

                    this.setState(newState, () => {
                        this.cube.scale.set(dimensions[0], dimensions[1], dimensions[2]);
                        this.camera.position.z = dimensions[1];
                    });
                }).catch(err => console.log(err));
            }
        }
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
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        const textureLoader = new THREE.TextureLoader();

        // You can modify this loading.png image which is a placeholder to show when there are no ranges yet.
        const texture = textureLoader.load('./images/loading.png');
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.MeshBasicMaterial({ map: texture });
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

        if (this.props.type === 'wcs') {
            window.addEventListener('resize', this.handleResize);
        }
        else {
            console.log(window.removeEventListener('resize', this.handleResize));
        }

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    loadCubeMaterial = (longStart, longEnd, latStart, latEnd, unixStartImage, unixEndImage) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "Anonymous";

        const texture0 = textureLoader.load(longStart);
        const texture1 = textureLoader.load(longEnd);
        const texture2 = textureLoader.load(latStart);
        const texture3 = textureLoader.load(latEnd);
        const texture4 = textureLoader.load(unixStartImage);
        const texture5 = textureLoader.load(unixEndImage);

        texture0.minFilter = THREE.LinearFilter;
        texture1.minFilter = THREE.LinearFilter;
        texture2.minFilter = THREE.LinearFilter;
        texture3.minFilter = THREE.LinearFilter;
        texture4.minFilter = THREE.LinearFilter;
        texture5.minFilter = THREE.LinearFilter;

        const material = [
            new THREE.MeshBasicMaterial({ map: texture0 }),
            new THREE.MeshBasicMaterial({ map: texture1 }),
            new THREE.MeshBasicMaterial({ map: texture2 }),
            new THREE.MeshBasicMaterial({ map: texture3 }),
            new THREE.MeshBasicMaterial({ map: texture4 }),
            new THREE.MeshBasicMaterial({ map: texture5 }),
        ];

        this.cube.material = material;
    }

    loadWCPSImages = () => {
        const { query, keyForSet } = this.props;
        var imageFormat = ', "image/png")'
        var keys = keyForSet.split("[")[1].split("]")[0].split(", ")
        var latKey = keys[0]
        var longKey = keys[1]
        var zKey = keys[2]

        // We construct url's by reusing the passed (query, keyForSet) from the form and the ranges from slider component.
        var constructQuery = API + query + imageFormat
        const latStart = (constructQuery).replace(latKey, (latKey.split(":")[0] + ")"))
        const latEnd = (constructQuery).replace(latKey, (latKey.split("(")[0] + "(" + latKey.split(":")[1]))
        const longStart = (constructQuery).replace(longKey, (longKey.split(":")[0] + ")"))
        const longEnd = (constructQuery).replace(longKey, (longKey.split("(")[0] + "(" + longKey.split(":")[1]))
        const unixStartImage = (constructQuery).replace(zKey, (zKey.split(":")[0] + ")"))
        const unixEndImage = (constructQuery).replace(zKey, (zKey.split("(")[0] + "(" + zKey.split(":")[1]))

        this.loadCubeMaterial(longStart, longEnd, latStart, latEnd, unixStartImage, unixEndImage);
    }

    loadImages = () => {
        const { ranges, keyForSet, query, rangeKeys } = this.props;
        const imageFormat = '&FORMAT=image/png';
        const fetchQuery = API + query + '&' + this.props.format;
        axios.get(fetchQuery).then(resp => {
            const xmltojson = convert.xml2json(resp.data, {
                compact: false,
                spaces: 4
            });
            const json = JSON.parse(xmltojson);
            const high = json.elements[0].elements[1].elements[0].elements[0].elements[0].elements[1].elements[0].text;
            const low = json.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].elements[0].text;

            const highValues = high.split(' ');
            const lowValues = low.split(' ');
            var dimensions = []
            for (var i = 0; i < 3; i++) {
                dimensions.push(parseInt(highValues[i], 10) - parseInt(lowValues[i], 10) + 1)
            }
            const max = Math.max(...dimensions)
            if (max > THRESHOLD) {
                scaleFactor = (THRESHOLD / max)
            }
        })

        // We construct url's by reusing the passed (query, keyForSet) from the form and the ranges from slider component.
        const latStart = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[0], 'start') + imageFormat + '&scaleFactor=' + scaleFactor;
        const latEnd = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[0], 'end') + imageFormat + '&scaleFactor=' + scaleFactor;
        const longStart = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[1], 'start') + imageFormat + '&scaleFactor=' + scaleFactor;
        const longEnd = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[1], 'end') + imageFormat + '&scaleFactor=' + scaleFactor;
        const unixStartImage = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[2], 'start') + imageFormat + '&scaleFactor=' + scaleFactor;
        const unixEndImage = API + query + '&' + keyForSet + '=' +
            getKeyValueFromMap(ranges, rangeKeys[2], 'end') + imageFormat + '&scaleFactor=' + scaleFactor;

        this.loadCubeMaterial(longStart, longEnd, latStart, latEnd, unixStartImage, unixEndImage);
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
        return (<div className="vis" ref={mount => { this.mount = mount }} />)
    }
}

export default Cube
