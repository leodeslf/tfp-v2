import React, { Component } from 'react';
import Tab from './Tab';
import { S as settings, setContextNoise, resetLoop } from '../js/control';
import { setContextFPS } from '../js/fps';

const DEF_SKIN = new Image(256, 32);
const DEF_SKIN_SRC = './skins/default.png';

const TABS = [
  { name: "base", label: "Base", def: true },
  { name: "clock", label: "Reloj" },
  { name: "wave", label: "Onda" },
  { name: "view", label: "Vista" },
];

let skinCtx = undefined;

export default class Box extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...settings,
      bg: "grid",
      showFPS: false
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.setSkin = this.setSkin.bind(this);
    this.windowOnMouseMove = this.windowOnMouseMove.bind(this);
  }

  componentDidMount() {
    setContextNoise(document.getElementById('canvas-noise').getContext('2d'));
    setContextFPS(document.getElementById('canvas-fps').getContext('2d'));
    skinCtx = document.getElementById('canvas-skin').getContext('2d');
    this.setSkin(settings.skin);
  }

  onInputChange(e) {
    const NAME = e.target.name;
    let value = undefined;
    if (e.target.type === 'number') {
      value = Number(e.target.value);
      if (value < e.target.min) {
        value = e.target.min
      }
      else if (value > e.target.max) {
        value = e.target.max
      }
    } else if (e.target.type === 'checkbox') {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    this.setState({ [NAME]: value }, resetLoop(NAME, value));
    // special cases
    if (NAME === 'run' && value === false) {
      this.setState({ specSeed: Math.round(settings.seed * 1000) * 0.001 });
    } else if (NAME === 'specSeed') {
      resetLoop('seed', value);
    }
  }

  windowOnMouseMove() {
    window.onmousemove = (m) => {
      const dragX = -m.movementX;
      const dragY = -m.movementY;
      resetLoop('traX', settings.traX + dragX);
      resetLoop('traY', settings.traY + dragY);
      this.setState({
        traX: settings.traX,
        traY: settings.traY
      });
      window.onmouseup = () => {
        window.onmousemove = null;
      }
    }
  }

  setSkin(skinName) {
    if (skinName !== 'default') {
      const NEW_SKIN = new Image(256, 32);
      NEW_SKIN.src = './skins/' + skinName + '.png';
      NEW_SKIN.onload = async () => {
        skinCtx.clearRect(0, 0, 256, 32);
        skinCtx.drawImage(NEW_SKIN, 0, 0);
        const NEW_SKIN_DATA = await
          skinCtx.getImageData(0, 0, 256, 1).data;
        this.setState({ skin: skinName });
        resetLoop('skin', skinName);
        resetLoop('skinData', [...NEW_SKIN_DATA]);
      }
    } else if (skinName === 'default') {
      DEF_SKIN.src = DEF_SKIN_SRC;
      DEF_SKIN.onload = () => {
        skinCtx.clearRect(0, 0, 256, 32);
        skinCtx.drawImage(DEF_SKIN, 0, 0);
        this.setState({ skin: 'default' });
        resetLoop('skin', 'default');
        resetLoop('skinData', []);
      }
    }
  }

  render() {
    return (
      <section className="box">
        <div className="box__output">
          <canvas id="canvas-noise" width={256} height={256}
            className={this.state.bg}
            onMouseDown={this.windowOnMouseMove} />
          <canvas id="canvas-skin" width={256} height={16}
            className={this.state.bg} />
          <canvas id="canvas-fps" width={49} height={18}
            style={{ display: this.state.showFPS ? "block" : "none" }} />
        </div>
        <div className="box__tab">
          {TABS.map((tab, i) => (<Tab {...tab} key={i} />))}

          {/* 
          base start
           */}

          <section id="content--base" className="tab-content">
            <span className="tab-content__item">
              <label htmlFor="type">Tipo</label>
              <select id="type" name="type"
                value={this.state.type}
                onChange={this.onInputChange}>
                <optgroup label="Principales">
                  <option value="printAndgenData1D">1D</option>
                  <option value="genData2D">2D</option>
                  <option value="genData3D">3D</option>
                </optgroup>
                <optgroup label="Variaciones">
                  <option value="genData3DFlow">3D Fluido</option>
                  <option value="genData3DRidge">3D Surcado</option>
                  <option value="genData3DSin">3D Seno</option>
                  <option value="genData3DFlame">3D Flama</option>
                  <option value="genData3DCenter">3D Centro</option>
                  <option value="genData3DCenterRidge">3D Centro S. </option>
                </optgroup>
              </select>
            </span>
            {(this.state.type === 'genData3DFlow') &&
              <span className="tab-content__item">
                <label htmlFor="flowFac" className="opt">Factor</label>
                <input id="flowFac" name="flowFac" type="number"
                  value={this.state.flowFac}
                  step={0.5} min={-9999} max={9999}
                  onChange={this.onInputChange} />
              </span>}
            {(this.state.type === 'genData3DRidge') &&
              <span className="tab-content__item">
                <label htmlFor="ridgeInv" className="opt">Invertir</label>
                <input id="ridgeInv" name="ridgeInv" type="checkbox"
                  defaultChecked={this.state.ridgeInv}
                  onChange={this.onInputChange} />
              </span>}
            {(this.state.type === 'genData3DFlame') &&
              <span className="tab-content__item">
                <label htmlFor="flameFac" className="opt">Factor</label>
                <input id="flameFac" name="flameFac" type="number"
                  value={this.state.flameFac}
                  step={0.1} min={0.1} max={100}
                  onChange={this.onInputChange} />
              </span>}
            {(this.state.type === 'genData3DCenter' ||
              this.state.type === 'genData3DCenterRidge') &&
              <span className="tab-content__item">
                <label htmlFor="centerFac" className="opt">Factor</label>
                <input id="centerFac" name="centerFac" type="number"
                  value={this.state.centerFac}
                  step={0.01} min={0.01} max={10}
                  onChange={this.onInputChange} />
              </span>}
            <span className="tab-content__item">
              <label htmlFor="skin">Piel</label>
              <select id="skin" name="skin"
                value={this.state.skin}
                onChange={e => this.setSkin(e.target.value)}>
                <option value="arc">Arcos</option>
                <option value="water">Agua</option>
                <option value="rainbow">Arcoíris</option>
                <option value="bw">Blanco & Negro</option>
                <option value="bubbles">Busbujas</option>
                <option value="default">Por defecto</option>
                {/* <option value="demo">DEMO</option> */}
                <option value="stair">Escalera</option>
                <option value="fire">Fuego</option>
                <option value="iridescent0">Iridiscente</option>
                <option value="marble">Mármol</option>
                <option value="metal0">Metálico</option>
                <option value="clouds">Nubes</option>
                <option value="gold">Oro</option>
                <option value="rgb">RGB</option>
                <option value="earth">Tierra</option>
              </select>
            </span>
            {/* <span className="tab-content__item">
              <label htmlFor="skinRotation" className="opt">Desplazamiento</label>
              <input id="skinRotation" name="skinRotation" type="checkbox"
                value={this.state.skinRotation}
                defaultChecked={this.state.skinRotation}
                disabled={this.state.skin !== 'default' ? false : true}
                onChange={this.onInputChange} />
            </span>
            {(this.state.skinRotation === true) &&
              <span className="tab-content__item">
                <label htmlFor="pixelsToRotate" className="opt">Pixeles a desplazar</label>
                <input id="pixelsToRotate" name="pixelsToRotate" type="number"
                  value={this.state.pixelsToRotate}
                  step={1} min={-16} max={16}
                  onChange={this.onInputChange} />
              </span>} */}
            <span className="tab-content__item">
              <label htmlFor="bg">Fondo</label>
              <select id="bg" name="bg" value={this.state.bg}
                onChange={this.onInputChange}>
                <option value="white">Blanco</option>
                <option value="grid">Cuadriculado</option>
                <option value="black">Negro</option>
              </select>
            </span>
            <span className="tab-content__item">
              <label htmlFor="showFPS">FPS</label>
              <input id="showFPS" name="showFPS" type="checkbox"
                defaultChecked={this.state.showFPS}
                onChange={this.onInputChange} />
            </span>
          </section>

          {/* 
          base clock
           */}

          <section id="content--clock" className="tab-content">
            <span className="tab-content__item">
              <label htmlFor="run">Animar</label>
              <input id="run" name="run" type="checkbox"
                defaultChecked={this.state.run}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="step" >Velocidad</label>
              <input id="step" name="step" type="number"
                value={this.state.step}
                step={0.001} min={-1} max={1}
                disabled={!this.state.run}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="specSeed" >Semilla</label>
              <input id="specSeed" name="specSeed" type="number"
                value={this.state.specSeed}
                step={0.001} min={-999999} max={999999}
                disabled={this.state.run}
                onChange={this.onInputChange} />
            </span>
          </section>

          {/* 
          base wave
           */}

          <section id="content--wave" className="tab-content">
            <span className="tab-content__item">
              <label htmlFor="fre" >Frecuancia</label>
              <input
                id="fre" name="fre" type="number"
                step={0.05} min={-200} max={200}
                value={this.state.fre}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="amp" >Amplitud</label>
              <input id="amp" name="amp" type="number"
                value={this.state.amp}
                step={0.05} min={-100} max={100}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="oct" >Octavas</label>
              <input id="oct" name="oct" type="number"
                value={this.state.oct}
                step={1} min={1} max={16}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="lac" >Lacunaridad</label>
              <input id="lac" name="lac" type="number"
                value={this.state.lac}
                step={0.05} min={-20} max={20}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="per" >Persistencia</label>
              <input id="per" name="per" type="number"
                value={this.state.per}
                step={0.05} min={-10} max={10}
                onChange={this.onInputChange} />
            </span>
          </section>

          {/* 
          base view
           */}

          <section id="content--view" className="tab-content">
            <span className="tab-content__item">
              <label htmlFor="traX" >Traslación [x]</label>
              <input
                id="traX" name="traX" type="number"
                step={1} min={-999999} max={999999}
                value={this.state.traX}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="traY" >Traslación [y]</label>
              <input id="traY" name="traY" type="number"
                value={this.state.traY}
                step={1} min={-999999} max={999999}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="resW" >Resolución [ancho]</label>
              <input id="resW" name="resW" type="number"
                value={this.state.resW}
                step={2} min={2} max={999999}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="resH" >Resolución [alto]</label>
              <input id="resH" name="resH" type="number"
                value={this.state.resH}
                step={2} min={2} max={999999}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="zoom" >Zoom</label>
              <input id="zoom" name="zoom" type="number"
                value={this.state.zoom}
                step={0.05} min={0.05} max={100}
                onChange={this.onInputChange} />
            </span>
            <span className="tab-content__item">
              <label htmlFor="ppd" >Pixeles por dato</label>
              <input id="ppd" name="ppd" type="number"
                value={this.state.ppd}
                step={1} min={1} max={256}
                onChange={this.onInputChange} />
            </span>
          </section>
        </div>
      </section>
    );
  }
}
