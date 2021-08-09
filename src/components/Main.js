import React, { Component, Fragment } from 'react';
import TabTitle from './TabTitle';
import Input from './Input';
import CanvasNoise from './CanvasNoise';
import CanvasFPS from './CanvasFPS';
import CanvasSkin from './CanvasSkin';
import { CFG } from '../js/control';

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      run: CFG.run,
      traslationX: CFG.traslationX,
      traslationY: CFG.traslationY,
      showFPS: INPUTS_UI[0].value,
      bg: INPUTS_UI[1].value,
    };
  }

  updateFromChild = async (updates) => {
    this.setState((state) => ({
      ...state, ...updates
    }));
  }

  render() {
    return (
      <main>
        <section className="tfp-v2">
          <div className="output-box">
            <CanvasNoise
              bg={this.state.bg}
              reportToParent={this.updateFromChild} />
            <CanvasSkin bg={this.state.bg} />
            <CanvasFPS visible={this.state.showFPS} />
          </div>
          <div className="input-box">
            {TABS.map((tab, i) =>
              <Fragment key={i}>
                <TabTitle {...tab} />
                <section
                  id={`content--${tab.name}`}
                  className="tab__content"
                  key={i}>
                  {tab.inputs.map((input, j) => (
                    <Input
                      {...input}
                      {...(input.reportsToParent &&
                        { fromParent: this.state[input.prop] })}
                      reportToParent={this.updateFromChild}
                      key={j} />
                  ))}
                </section>
              </Fragment>
            )}
          </div>
        </section>
      </main>
    );
  }
}

const INPUTS_UI = [
  {
    label: 'FPS',
    prop: 'showFPS',
    value: true,
    reportsToParent: true,
    ui: true,
    el: 'checkbox'
  },
  {
    label: 'Fondo',
    prop: 'bg',
    value: 'grid',
    options: [
      ['white', 'Blanco'],
      ['grid', 'Grilla'],
      ['black', 'Negro']
    ],
    reportsToParent: true,
    ui: true,
    el: 'select'
  }
];
const INPUTS_PRINT = [
  {
    label: 'Piel',
    prop: 'skinName',
    setProp: 'setSkinName',
    options: [
      ['arc', 'Arcos'],
      ['water', 'Agua'],
      ['rainbow', 'Arcoíris'],
      ['bw', 'Blanco & Negro'],
      ['bubbles', 'Burbujas'],
      ['default', 'Por defecto'],
      ['stair', 'Escalera'],
      ['fire', 'Fuego'],
      ['iridescent', 'Iridiscente'],
      ['wood', 'Madera'],
      ['marble', 'Mármol'],
      ['metal', 'Metálico'],
      ['clouds', 'Nubes'],
      ['gold', 'Oro'],
      ['rgb', 'RGB'],
      ['earth', 'Tierra']
    ],
    el: 'select'
  }
];
const INPUTS_SETTINGS = [
  {
    label: 'Tipo',
    prop: 'type',
    setProp: 'setType',
    groups: [
      {
        label: 'Base',
        options: [
          ['_1D', '1D'],
          ['_2D', '2D'],
          ['_3D', '3D']
        ]
      },
      {
        label: 'Variaciones',
        options: [
          ['_3DFlow', '3D Fluido'],
          ['_3DRidge', '3D Surcado'],
          ['_3DSinX', '3D Seno de X'],
          ['_3DFlame', '3D Flama'],
          ['_3DSphere', '3D Esfera'],
          ['_3DSphereRidge', '3D Esfera Surcada']
        ]
      }
    ],
    el: 'select'
  },
  {
    label: 'Invertir',
    prop: 'invert',
    el: 'checkbox'
  }
];
const INPUTS_MOVEMENT = [
  {
    label: 'Animar',
    prop: 'run',
    el: 'checkbox'
  },
  {
    label: 'Velocidad',
    prop: 'step',
    step: 0.001,
    min: -1,
    max: 1,
    el: 'number'
  },
  {
    label: 'Semilla',
    prop: 'seed',
    step: 0.001,
    min: -999999,
    max: 999999,
    el: 'number'
  }
];
const INPUTS_NOISE = [
  {
    label: 'Frecuencia',
    prop: 'frequency',
    step: 0.05,
    min: -200,
    max: 200,
    el: 'number'
  },
  {
    label: 'Amplitud',
    prop: 'amplitude',
    step: 0.05,
    min: -100,
    max: 100,
    el: 'number'
  },
  {
    label: 'Octavas',
    prop: 'octaves',
    step: 1,
    min: 1,
    max: 12,
    el: 'number'
  },
  {
    label: 'Lacunaridad',
    prop: 'lacunarity',
    step: 0.05,
    min: -20,
    max: 20,
    el: 'number'
  },
  {
    label: 'Persistencia',
    prop: 'persistence',
    step: 0.05,
    min: -10,
    max: 10,
    el: 'number'
  }
];
const INPUTS_VIEW = [
  {
    label: 'Traslación [x]',
    prop: 'traslationX',
    step: 5,
    min: -999999,
    max: 999999,
    reportsToParent: true,
    el: 'number'
  },
  {
    label: 'Traslación [y]',
    prop: 'traslationY',
    step: 5,
    min: -999999,
    max: 999999,
    reportsToParent: true,
    el: 'number'
  },
  {
    label: 'Resolución [ancho]',
    prop: 'resolutionW',
    setProp: 'setResolutionW',
    step: 2,
    min: 2,
    max: 999999,
    el: 'number'
  },
  {
    label: 'Resolución [alto]',
    prop: 'resolutionH',
    setProp: 'setResolutionH',
    step: 2,
    min: 2,
    max: 999999,
    el: 'number'
  },
  {
    label: 'Zoom',
    prop: 'zoom',
    setProp: 'setZoom',
    step: 0.05,
    min: 0.05,
    max: 100,
    el: 'number'
  },
  {
    label: 'Pixeles por dato',
    prop: 'ppd',
    setProp: 'setPixelsPerData',
    step: 1,
    min: 1,
    max: 256,
    el: 'number'
  }
];

const TABS = [
  {
    name: "base",
    label: "Base",
    inputs: [
      ...INPUTS_UI,
      ...INPUTS_PRINT,
      ...INPUTS_SETTINGS
    ],
    def: true
  },
  {
    name: "time",
    label: "Reloj",
    inputs: INPUTS_MOVEMENT
  },
  {
    name: "wave",
    label: "Onda",
    inputs: INPUTS_NOISE
  },
  {
    name: "view",
    label: "Vista",
    inputs: INPUTS_VIEW
  }
];
