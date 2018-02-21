const fontFamily = 'SILPAKORN70yr'

const color2 = { //Mood lady hobby retro
  main: "#eb7985",
  sub: "#72c6aa",
  bg: "#f4e4d1",
  bg2: '#f3d5bc',
  card: "#fcf4e2",
  maintext: "#eb7985",
  text: "#603913",
  subtext: "#f4e4d1",
  white: "#fcf4e2",
  black: "#603913",
  gray: "#ccc",
  border: "#72c6aa",
}
const color = { //YELLOW
  main: "#9c2828",
  sub: "#2e5388",
  bg: "#faf5b2",
  bg2: '#f4cc72',
  card: "#faf5b2",
  maintext: "#d2282c",
  text: "#442916",
  subtext: "#faf5b2",
  white: "#faf5b2",
  black: "#442916",
  gray: "#ccc",
  border: "#72c6aa",

  green: '#72c6aa',
  red: '#9c2828',
}


const AppStyle = {
  color: {
    main: color.main,
    sub: color.sub,
    bg: color.bg,
    bg2: color.bg2,
    card: color.card,
    maintext: color.maintext,
    text: color.text,
    subtext: color.subtext,
    white: color.white,
    black: color.black,
    gray: color.gray,
    border: color.border,

    green: color.green,
    red: color.red,
  },

  shadow: {
    lv1: "box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.25);",
    lv2: `box-shadow: 3px 3px 0 ${color.bg2};`,
  },

  font: {
    tool: `
      font-family: ${fontFamily};
      font-weight: normal; 
      color: ${color.subtext};
      font-size: 20px;
    `,
    main: `
      font-family: ${fontFamily};
      font-weight: normal; 
      color: ${color.text};
      font-size: 18px;
    `,
    menu: `
      font-family: ${fontFamily};
      font-weight: normal; 
      color: ${color.text};
      font-size: 18px;
    `,
    read1: `
      font-family: 'TH Sarabun New';
      font-weight: bold; 
      color: ${color.text};
      font-size: 20px;
    `,
    read2: `
      font-family: 'TH Sarabun New';
      color: ${color.text};
      font-size: 20px;
    `,
    read3: `
      font-family: 'TH Sarabun New';
      font-size: 18px;
    `,
    hilight: `
      font-family: 'TH Sarabun New';
      font-weight: bold; 
      color: ${color.maintext};
      font-size: 20px;
    `,
    button: `
      font-family: ${fontFamily};
      font-weight: normal; 
      color: ${color.white};
      font-size: 20px;
    `,
  },

  family: {
    main: fontFamily,
  },

  animate: {
    "inLeft": `
      animation-name: 'fadeInLeft';
      animation-duration: 0.2s;
    `,
    "outLeft": `
      animation-name: 'fadeOutLeft';
      animation-duration: 0.2s;
    `,
    
    "inRight": `
      animation-name: 'fadeInRight';
      animation-duration: 0.2s;
    `,
    "outRight": `
      animation-name: 'fadeOutRight';
      animation-duration: 0.2s;
    `,
  }
}


export default AppStyle
