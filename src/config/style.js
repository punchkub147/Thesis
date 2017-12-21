const AppStyle = {
  color: {
    main: "#eb7985",
    sub: "#72c6aa",
    bg: "#f4e4d1",
    card: "#fcf4e2",
    maintext: "#eb7985",
    text: "#603913",
    subtext: "#f4e4d1",
  },

  shadow: {
    lv1: "box-shadow: 0 0 15px #aaa;"
  },

  font: {
    text1: `
      font-size: 14px; 
      font-weight: bold; 
    `,
    text2: `
      font-size: 12px; 
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