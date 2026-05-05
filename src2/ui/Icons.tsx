import type { SvgIconProps } from '@mui/material';
import { darken, lighten, SvgIcon, useTheme } from '@mui/material';
import { memo } from 'react';

//*****************************************************************************************
// AssemblylineIcon
//*****************************************************************************************

export const AssemblylineIcon = memo((props: SvgIconProps) => {
  const theme = useTheme();

  return (
    <SvgIcon viewBox="0 0 76.896033 76.896003" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <style>
          {`
      .cls-shade, .cls-circle {
        stroke-width: 0px;
      }
      .cls-shade {
        fill: ${darken(theme.palette.primary.main, 0.5)};
        transition: fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
      .cls-circle {
        fill: url(#radial-gradient);
      }`}
        </style>
        <radialGradient
          id="radial-gradient"
          cx="38.880001"
          cy="32.040001"
          fx="38.880001"
          fy="32.040001"
          r="32.040001"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1.2,0,0,1.2,-8.208,0)"
        >
          <stop offset="0" stopColor={lighten(theme.palette.primary.main, 0.4)} />
          <stop offset=".51" stopColor={lighten(theme.palette.primary.main, 0.2)} />
          <stop offset=".7" stopColor={lighten(theme.palette.primary.main, 0.1)} />
          <stop offset=".83" stopColor={lighten(theme.palette.primary.main, 0.05)} />
          <stop offset=".93" stopColor={lighten(theme.palette.primary.main, 0.025)} />
          <stop offset="1" stopColor={theme.palette.primary.main} />
        </radialGradient>
      </defs>
      <g transform="translate(-1.1150504,7.211)">
        <path
          className="cls-circle"
          d="M 38.447266 0 C 17.219266 0 -9.4739031e-15 17.207266 0 38.447266 C 0 46.677636 2.5911892 54.297849 6.9921875 60.550781 L 7.0175781 60.291016 C 7.0476946 59.974444 7.3340448 59.898438 7.4394531 59.898438 L 8.3574219 59.898438 L 17.769531 59.898438 L 17.783203 59.898438 L 27.195312 59.898438 L 28.115234 59.898438 C 28.220646 59.898438 28.489976 59.974442 28.535156 60.291016 L 30.193359 74.808594 C 30.208418 74.899041 30.296935 74.974609 30.402344 74.974609 L 32.511719 74.974609 C 32.918307 74.974609 33.232266 75.125331 33.234375 75.5625 L 33.238281 76.535156 C 34.942997 76.76607 36.679062 76.896484 38.447266 76.896484 C 58.401551 76.867544 76.92518 59.827349 76.896484 38.447266 C 76.896484 17.207266 59.675266 -4.7369516e-15 38.447266 0 z"
          transform="translate(1.1150504,-7.211)"
        />
        <g id="g92492" transform="matrix(1.2405354,0,0,1.2242582,-10.493398,-8.8414519)">
          <path
            d="m 29.916198,62.291641 c 2.598638,1.005794 3.803263,1.107139 6.396729,1.564531 l -0.01594,-0.803606 c -0.0071,-0.357021 -0.254917,-0.480228 -0.582669,-0.480228 H 34.01487 c -0.08497,0 -0.157806,-0.06157 -0.169945,-0.135449 L 32.509643,50.578944 c -0.03642,-0.258584 -0.254917,-0.320152 -0.33989,-0.320152 h -0.740475 -1.517367"
            className="cls-shade"
          />
          <path
            d="m 31.465695,16.310346 c -0.861865,-1.243669 -0.57053,-2.955251 0.655502,-3.829513 1.226033,-0.874262 2.913345,-0.578737 3.775209,0.664931 0.861865,1.243668 0.57053,2.955251 -0.655502,3.829513 -1.226033,0.874262 -2.913345,0.578737 -3.775209,-0.664931 z"
            className="cls-shade"
          />
          <path
            d="m 40.788398,33.142963 c -0.242779,1.810091 -1.881535,3.0907 -3.665959,2.844429 -1.784424,-0.246271 -3.046873,-1.9086 -2.804094,-3.718691 0.242778,-1.810091 1.881535,-3.0907 3.665958,-2.844429 1.784424,0.246271 3.046873,1.9086 2.804095,3.718691 z"
            className="cls-shade"
          />
          <path
            d="m 54.614646,15.965566 c -0.861865,0.233958 -1.735868,-0.295525 -1.954369,-1.157473 -0.23064,-0.874262 0.291334,-1.760837 1.14106,-1.982481 0.861864,-0.233957 1.735868,0.295525 1.954369,1.157473 0.230639,0.874262 -0.291335,1.760837 -1.14106,1.982481 z"
            className="cls-shade"
          />
        </g>
      </g>
    </SvgIcon>
  );
});

AssemblylineIcon.displayName = 'AssemblylineIcon';
