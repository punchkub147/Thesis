const AppStyle = {
  color: {
    main: "#dc5f6d",
    sub: "#d0be85",
    bg: "#e0eaea",
    card: "white",
    maintext: "#dc5f6d",
    text: "#d6d6d6",
    subtext: "#666",
  },
  shadow: {
    lv1: "box-shadow: 0 0 15px #aaa;"
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