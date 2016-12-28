# Discord Themes
Collection of my Discord themes


### Transparency
From what I know, first theme to use window transparency.
![Transparency screenshot](https://i.imgur.com/Cmgop0v.png)

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
