# Transparency
From what I know, first theme to use window transparency.

This requires my [Transparency Patcher](/Plugins/transparency_patcher.plugin.js), without it the theme will look very black.

### Download
[Source](/Themes/Transparency.theme.css)
[Raw](https://raw.githubusercontent.com/HoLLy-HaCKeR/BetterDiscord-Themes-and-Plugins/master/Themes/Transparency.theme.css)

### Background
You can set a semi-transparent background using this css I [found on the internet](https://css-tricks.com/snippets/css/transparent-background-images/), which you should throw in your Custom CSS window:
```css
body::after {
  content: "";
  background: url(https://i.redd.it/ljf70pg0z76y.jpg);
  opacity: 0.3;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  z-index: -1;   
}
```

### Screenshots
![Transparency screenshot](https://i.imgur.com/Cmgop0v.png)