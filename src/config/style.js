const AppStyle = {
  color: {
    main: "#eb7985",
    sub: "#72c6aa",
    bg: "#f4e4d1",
    card: "#fcf4e2",
    maintext: "#eb7985",
    text: "#603913",
    subtext: "#f4e4d1",
    white: "#f4e4d1",
    black: "#603913",
  },

  shadow: {
    lv1: "box-shadow: 0 0 15px #ccc;",
    lv2: "box-shadow: 3px 3px 0 #ccc;",
  },

  font: {
    tool: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: #f4e4d1;
      font-size: 24px;
    `,
    main: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: #603913;
      font-size: 22px;
    `,
    menu: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: #603913;
      font-size: 22px;
    `,
    read1: `
      font-family: 'TH Sarabun New';
      font-weight: bold; 
      color: #603913;
      font-size: 20px;
    `,
    read2: `
      font-family: 'TH Sarabun New';
    `,
    read3: `
      font-family: 'TH Sarabun New';
    `,
    hilight: `
      font-family: 'TH Sarabun New';
      font-weight: bold; 
      color: #eb7985;
    `,
    button: `
      font-family: 'Anchan';
      font-weight: normal; 
      color: #f4e4d1;
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