const color = { //Mood lady hobby retro
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
}
const color2 = { //Mood2
  main: "#d2282c",
  sub: "#163b4c",
  bg: "#ece0a0",
  bg2: '#dea93e',
  card: "#ece0a0",
  maintext: "#d2282c",
  text: "#603913",
  subtext: "#ece0a0",
  white: "#fcf4e2",
  black: "#603913",
  gray: "#ccc",
}
const color3 = { //Mood3
  main: "#e3242e",
  sub: "#f9db95",
  bg: "#b65656",
  bg2: '#b05c5b',
  card: "#e3242e",
  maintext: "#f9db95",
  text: "#f9db95",
  subtext: "#f9db95",
  white: "#f9db95",
  black: "#603913",
  gray: "#ccc",
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
  },

  shadow: {
    lv1: "box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.25);",
    lv2: `box-shadow: 3px 3px 0 ${color.bg2};`,
  },

  font: {
    tool: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: ${color.subtext};
      font-size: 24px;
    `,
    main: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: ${color.text};
      font-size: 22px;
    `,
    menu: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: ${color.text};
      font-size: 22px;
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
      font-family: 'Anchan';
      font-weight: normal; 
      color: ${color.bg};
      font-size: 24px;
    `,
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
