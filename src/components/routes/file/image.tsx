import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { alpha, IconButton, Slider } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const MIN = 100;
const MAX = 900;
const ZOOM_CLASS = 'zooming';
const PIXELATED_CLASS = 'pixelated';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center'
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    minHeight: `128px`,
    minWidth: `128px`,
    objectFit: 'contain',
    cursor: 'pointer',
    imageRendering: 'auto',
    [`&.${ZOOM_CLASS}`]: {
      objectFit: 'initial',
      maxHeight: 'none',
      maxWidth: 'none'
    },
    [`&.${PIXELATED_CLASS}`]: {
      imageRendering: 'pixelated'
    }
  },
  zoom: {
    position: 'absolute',
    right: `calc(50px - ${theme.spacing(1)})`,
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    borderRadius: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: theme.spacing(1),
    height: '250px',
    width: '50px',
    padding: `${theme.spacing(2)} 0`,
    [theme.breakpoints.down('md')]: {
      right: `calc(50px - ${theme.spacing(3)})`
    },
    '@media (max-height: 600px)': {
      display: 'none'
    }
  },
  zoomSlider: {
    '& .MuiSlider-thumb': {
      boxShadow: 'none'
    }
  }
}));

type Data = {
  isDown: boolean;
  prevZoom?: number;
  curZoom?: number;
  distance?: number;
  startX?: number;
  startY?: number;
  prevX?: number;
  prevY?: number;
  curX?: number;
  curY?: number;
  imgX?: number;
  imgY?: number;
};

type ImageViewerProps = {
  src: string;
  alt: string;
};

const WrappedImageViewer = React.forwardRef(({ src = null, alt = null }: ImageViewerProps, ref) => {
  const classes = useStyles();

  const [zoom, setZoom] = useState<number>(MIN);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [isPixelated, setIsPixelated] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragTimer = useRef<number>(null);
  const animationID = useRef<number>();
  const data = useRef<Data>({
    isDown: false,
    prevZoom: 0,
    curZoom: 0,
    distance: 0,
    startX: 0,
    startY: 0,
    prevX: 0,
    prevY: 0,
    curX: 0,
    curY: 0,
    imgX: 0,
    imgY: 0
  });

  const resize = useCallback(() => {
    if (!containerRef.current || !imgRef.current) return;

    const { curZoom, prevZoom, imgX, curX, prevX, imgY, curY, prevY } = data.current;
    const { naturalWidth, naturalHeight } = imgRef.current;
    const { clientHeight: ctnHeight, clientWidth: ctnWidth } = containerRef.current;

    // Calculate new width and height based on zoom value
    const aspectRatio = naturalHeight / naturalWidth;
    let width: number, height: number;

    // tall image
    if (aspectRatio > 1) {
      height = (curZoom / 100) * Math.max(128, Math.min(naturalHeight, ctnHeight));
      width = height / aspectRatio;
    }
    // wide image
    else {
      width = (curZoom / 100) * Math.max(128, Math.min(naturalWidth, ctnWidth));
      height = width * aspectRatio;
    }

    if (curZoom <= MIN) {
      setIsZooming(false);
      setZoom(MIN);
      data.current.curZoom = MIN;
      imgRef.current.style.width = `auto`;
      imgRef.current.style.height = `auto`;
      imgRef.current.style.maxWidth = null;
      imgRef.current.style.maxHeight = null;
    } else {
      setIsZooming(true);
      setZoom(curZoom);
      imgRef.current.style.width = `${width}px`;
      imgRef.current.style.height = `${height}px`;
      imgRef.current.style.maxWidth = `none`;
      imgRef.current.style.maxHeight = `none`;
    }

    // Calculate horizontal scroll
    const thresholdX = width - ctnWidth;
    if (thresholdX <= 0) {
      data.current = { ...data.current, imgX: 0, curX: 0, prevX: 0 };
    } else {
      data.current.imgX = Math.min(0, Math.max(-thresholdX, (imgX + curX - prevX) * (curZoom / prevZoom)));
      data.current.prevX = curX;
    }

    // Calculate vertical scroll
    const thresholdY = height - ctnHeight;
    if (thresholdY <= 0) {
      data.current = { ...data.current, imgY: 0, curY: 0, prevY: 0 };
    } else {
      data.current.imgY = Math.min(0, Math.max(-thresholdY, (imgY + curY - prevY) * (curZoom / prevZoom)));
      data.current.prevY = curY;
    }

    data.current.prevZoom = data.current.curZoom;
    imgRef.current.style.transform = `translate(${data.current.imgX}px, ${data.current.imgY}px)`;
  }, []);

  const animate = useCallback(() => {
    // Calculate dragging speed
    const timeDiff = (new Date() as any) - dragTimer.current;
    const { curX, curY, startX, startY } = data.current;
    let speedY = ((curY - startY) / timeDiff) * 15;
    let speedX = ((curX - startX) / timeDiff) * 15;
    let speedYAbsolute = Math.abs(speedY);
    let speedXAbsolute = Math.abs(speedX);

    // Request delayed drawing of the scroll
    const draw = () => {
      if (!containerRef.current || !imgRef.current) return;

      const thresholdY = imgRef.current.clientHeight - containerRef.current.clientHeight;
      if (speedYAbsolute > 0 && thresholdY > 0) {
        if (speedY > 0) {
          data.current.imgY = Math.min(0, Math.max(-thresholdY, data.current.imgY + speedYAbsolute--));
        } else {
          data.current.imgY = Math.min(0, Math.max(-thresholdY, data.current.imgY - speedYAbsolute--));
        }
      }
      const thresholdX = imgRef.current.clientWidth - containerRef.current.clientWidth;
      if (speedXAbsolute > 0 && thresholdX > 0) {
        if (speedX > 0) {
          data.current.imgX = Math.min(0, Math.max(-thresholdX, data.current.imgX + speedXAbsolute--));
        } else {
          data.current.imgX = Math.min(0, Math.max(-thresholdX, data.current.imgX - speedXAbsolute--));
        }
      }

      // Resize the elements
      resize();

      // Cancel the animation if there are no more speeds
      if (speedXAbsolute <= 0 && speedYAbsolute <= 0) cancelAnimationFrame(animationID.current);
      else animationID.current = requestAnimationFrame(draw);
    };
    draw();
  }, [resize]);

  const calculate = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    // Find the middle point of all points
    let midX = 0;
    let midY = 0;
    for (let i = 0; i < event.touches.length; i++) {
      midX += event.touches.item(i).pageX;
      midY += event.touches.item(i).pageY;
    }
    midX /= event.touches.length;
    midY /= event.touches.length;

    // Find the distance between all points and the middle point
    let dist = 0;
    for (let i = 0; i < event.touches.length; i++) {
      dist += Math.sqrt(
        Math.pow(event.touches.item(i).pageX - midX, 2) + Math.pow(event.touches.item(i).pageY - midY, 2)
      );
    }

    dist /= event.touches.length;

    return { x: midX, y: midY, distance: dist };
  }, []);

  const handleLoad = useCallback((event: any) => {
    setIsLoaded(true);
    if (event.target?.naturalWidth <= 128 || event.target?.naturalHeight <= 128) {
      setIsPixelated(true);
    } else {
      setIsPixelated(false);
    }
  }, []);

  const handleZoomChange = useCallback(
    (value: number, delta: number) => {
      if (!isLoaded) return;
      if (animationID.current) cancelAnimationFrame(animationID.current);
      if (value) data.current.curZoom = value;
      if (delta) data.current.curZoom += delta;
      data.current.curZoom = Math.max(MIN, Math.min(MAX, Math.floor(data.current.curZoom)));
      resize();
    },
    [isLoaded, resize]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!isLoaded) return;
      data.current.curZoom = Math.max(MIN, Math.min(MAX, data.current.curZoom - Math.floor(event.deltaY / 10)));
      resize();
    },
    [isLoaded, resize]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!isLoaded || event.button !== 0) return;
      dragTimer.current = new Date().valueOf();
      data.current = {
        ...data.current,
        isDown: true,
        startX: event.pageX,
        startY: event.pageY,
        curX: event.pageX,
        curY: event.pageY,
        prevX: event.pageX,
        prevY: event.pageY
      };
      if (animationID.current) cancelAnimationFrame(animationID.current);
    },
    [isLoaded]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!isLoaded || !data.current.isDown) return;
      data.current = { ...data.current, curX: event.pageX, curY: event.pageY };
      resize();
    },
    [isLoaded, resize]
  );

  const handleMouseUp = useCallback(() => {
    data.current.isDown = false;
    if (!containerRef.current || !imgRef.current) return;
    animate();
  }, [animate]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isLoaded) return;
      const { x, y, distance } = calculate(event);
      dragTimer.current = new Date().valueOf();
      data.current = {
        ...data.current,
        distance: distance,
        isDown: true,
        startX: x,
        startY: y,
        curX: x,
        curY: y,
        prevX: x,
        prevY: y
      };
      if (animationID.current) cancelAnimationFrame(animationID.current);
    },
    [calculate, isLoaded]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isLoaded || !data.current.isDown) return;
      const { x, y, distance } = calculate(event);

      if (distance > 0 && data.current.distance > 0) {
        let z = (data.current.curZoom * distance) / data.current.distance;
        z = Math.max(MIN, Math.min(MAX, Math.floor(z)));
        data.current = { ...data.current, curZoom: Math.max(MIN, Math.min(MAX, Math.floor(z))), distance: distance };
      }

      data.current = { ...data.current, curX: x, curY: y };
      resize();
    },
    [calculate, isLoaded, resize]
  );

  useEffect(() => {
    if (!isLoaded) return;

    function handleResize() {
      resize();
    }

    function touchstart(event) {
      event.preventDefault();
    }

    const element = containerRef.current;
    handleResize();

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    element.addEventListener('touchstart', touchstart, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      element.removeEventListener('touchstart', touchstart);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseUp, isLoaded, resize]);

  return (
    src && (
      <>
        <div
          ref={containerRef}
          className={classes.root}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <img
            ref={imgRef}
            className={clsx(classes.image, isZooming && ZOOM_CLASS, isPixelated && PIXELATED_CLASS)}
            src={src}
            alt={alt}
            draggable={false}
            onLoad={handleLoad}
          />
        </div>
        <div className={classes.zoom}>
          <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${Math.floor(zoom)}%`}</div>
          <IconButton size="small" children={<AddIcon fontSize="small" />} onClick={() => handleZoomChange(null, 10)} />
          <Slider
            className={classes.zoomSlider}
            value={zoom}
            step={10}
            min={MIN}
            max={MAX}
            size="small"
            orientation="vertical"
            onChange={(event, newValue) => handleZoomChange(newValue as number, null)}
          />
          <IconButton
            size="small"
            children={<RemoveIcon fontSize="small" />}
            onClick={() => handleZoomChange(null, -10)}
          />
        </div>
      </>
    )
  );
});

export const ImageViewer = React.memo(WrappedImageViewer);
