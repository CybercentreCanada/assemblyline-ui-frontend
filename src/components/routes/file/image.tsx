import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { alpha, IconButton, Slider } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const MIN = 100;
const MAX = 900;
const ZOOM_CLASS = 'zooming';

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
    [`&.${ZOOM_CLASS}`]: {
      objectFit: 'initial',
      maxHeight: 'none',
      maxWidth: 'none'
    }
  },
  zoom: {
    position: 'fixed',
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    borderRadius: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: theme.spacing(1),
    height: '250px',
    width: '50px',
    padding: `${theme.spacing(2)} 0`
  },
  zoomSlider: {
    '& .MuiSlider-thumb': {
      boxShadow: 'none'
    }
  }
}));

type Data = {
  isDown: boolean;
  zoom?: number;
  startX?: number;
  startY?: number;
  x?: number;
  y?: number;
};

type ResizeProps = {
  zoomValue?: number;
  pageX?: number;
  pageY?: number;
};

type ImageViewerProps = {
  src: string;
  alt: string;
};

const WrappedImageViewer = React.forwardRef(({ src = null, alt = null }: ImageViewerProps, ref) => {
  const classes = useStyles();

  const [zoom, setZoom] = useState<number>(100);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);

  const zoomRef = useRef<number>(null);
  const dragTimer = useRef<number>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationID = useRef<number>();
  const transformData = useRef<any>({
    x: 0,
    y: 0
  });
  const data = useRef<Data>({
    isDown: false,
    zoom: 0,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0
  });

  const handleMouseResize = useCallback(
    ({ zoomValue = MIN, pageX = 0, pageY = 0 }: ResizeProps) => {
      if (!isLoaded || !containerRef.current || !imgRef.current) return;

      const { top, left, width: w } = containerRef.current.getBoundingClientRect();
      menuRef.current.style.top = `${top}px`;
      menuRef.current.style.left = `${left + w - 50}px`;

      // Calculate new width and height based on zoom value
      const aspectRatio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
      let width, height;

      // tall image
      if (aspectRatio > 1) {
        height =
          (zoomValue / 100) * Math.max(128, Math.min(imgRef.current.naturalHeight, containerRef.current.clientHeight));
        width = height / aspectRatio;
      }
      // wide image
      else {
        width =
          (zoomValue / 100) * Math.max(128, Math.min(imgRef.current.naturalWidth, containerRef.current.clientWidth));
        height = width * aspectRatio;
      }

      // const maxWidth = Math.max(128, Math.min(containerRef.current.clientWidth, imgRef.current.naturalWidth));
      // const maxHeight = Math.max(128, Math.min(containerRef.current.clientHeight, imgRef.current.naturalHeight));

      console.log(transformData.current.x, transformData.current.y);

      if (zoomValue <= MIN) {
        setIsZooming(false);
        setZoom(MIN);
        imgRef.current.style.width = `auto`;
        imgRef.current.style.height = `auto`;
        imgRef.current.style.transform = `none`;
        return;
      } else {
        setIsZooming(true);
        setZoom(zoomValue);
        imgRef.current.style.width = `${width}px`;
        imgRef.current.style.height = `${height}px`;
      }

      // Calculate horizontal scroll
      const thresholdX = width - containerRef.current.clientWidth;
      if (thresholdX > 0) {
        const x = transformData.current.x + pageX - data.current.x;
        data.current.x = pageX;
        transformData.current.x = Math.min(0, Math.max(-thresholdX, x));
      } else {
        transformData.current.x = 0;
      }

      // Calculate vertical scroll
      const thresholdY = height - containerRef.current.clientHeight;
      if (thresholdY > 0) {
        const y = transformData.current.y + pageY - data.current.y;
        data.current.y = pageY;
        transformData.current.y = Math.min(0, Math.max(-thresholdY, y));
      } else {
        transformData.current.y = 0;
      }

      imgRef.current.style.transform = `translate(${transformData.current.x}px, ${transformData.current.y}px)`;
    },
    [isLoaded]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>, z: number) => {
      event.stopPropagation();
      if (!isLoaded) return;
      handleMouseResize({ zoomValue: Math.max(MIN, Math.min(MAX, z - Math.floor(event.deltaY / 10))) });
    },
    [handleMouseResize, isLoaded]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!isLoaded || event.button !== 0) return;
      dragTimer.current = new Date().valueOf();
      data.current = {
        isDown: true,
        startX: event.pageX,
        startY: event.pageY,
        x: event.pageX,
        y: event.pageY
      };
      if (animationID.current) cancelAnimationFrame(animationID.current);
    },
    [isLoaded]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>, z: number) => {
      if (!isLoaded || !data.current.isDown) return;
      handleMouseResize({ zoomValue: z, pageX: event.pageX, pageY: event.pageY });
    },
    [handleMouseResize, isLoaded]
  );

  const handleMouseUp = useCallback(() => {
    data.current.isDown = false;

    if (!containerRef.current || !imgRef.current) return;

    // Calculate dragging speed
    const timeDiff = (new Date() as any) - dragTimer.current;
    let speedY = ((data.current.y - data.current.startY) / timeDiff) * 15;
    let speedX = ((data.current.x - data.current.startX) / timeDiff) * 15;
    let speedYAbsolute = Math.abs(speedY);
    let speedXAbsolute = Math.abs(speedX);

    // Request delayed drawing of the scroll
    const draw = () => {
      if (!containerRef.current || !imgRef.current) return;

      const thresholdY = imgRef.current.clientHeight - containerRef.current.clientHeight;
      if (speedYAbsolute > 0 && thresholdY > 0) {
        if (speedY > 0) {
          transformData.current.y = Math.min(0, Math.max(-thresholdY, transformData.current.y + speedYAbsolute--));
        } else {
          transformData.current.y = Math.min(0, Math.max(-thresholdY, transformData.current.y - speedYAbsolute--));
        }
      }

      const thresholdX = imgRef.current.clientWidth - containerRef.current.clientWidth;
      if (speedXAbsolute > 0 && thresholdX > 0) {
        if (speedX > 0) {
          transformData.current.x = Math.min(0, Math.max(-thresholdX, transformData.current.x + speedXAbsolute--));
        } else {
          transformData.current.x = Math.min(0, Math.max(-thresholdX, transformData.current.x - speedXAbsolute--));
        }
      }

      if (imgRef.current.style.width !== 'auto')
        imgRef.current.style.transform = `translate(${transformData.current.x}px, ${transformData.current.y}px)`;

      if (speedXAbsolute <= 0 && speedYAbsolute <= 0) cancelAnimationFrame(animationID.current);
      else animationID.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    const { top, left, width: w } = containerRef.current.getBoundingClientRect();
    menuRef.current.style.top = `${top}px`;
    menuRef.current.style.left = `${left + w - 50}px`;

    // Calculate new width and height based on zoom value
    const aspectRatio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
    const width = imgRef.current.clientWidth;
    const height = imgRef.current.clientWidth * aspectRatio;

    const maxWidth = Math.max(128, Math.min(containerRef.current.clientWidth, imgRef.current.naturalWidth));
    const maxHeight = Math.max(128, Math.min(containerRef.current.clientHeight, imgRef.current.naturalHeight));

    const newZoom = Math.floor((100 * width) / maxWidth);

    if (newZoom <= MIN) {
      setIsZooming(false);
      setZoom(MIN);
      imgRef.current.style.width = `auto`;
      imgRef.current.style.height = `auto`;
    } else if (width / maxWidth >= 5 || height / maxHeight >= 5) {
      setIsZooming(true);
      setZoom(MAX);
      imgRef.current.style.width = `${5 * Math.min(maxWidth, maxHeight / aspectRatio)}px`;
      imgRef.current.style.height = `${5 * Math.min(maxHeight, maxWidth * aspectRatio)}px`;
    } else {
      setIsZooming(true);
      setZoom(newZoom);
      imgRef.current.style.width = `${width}px`;
      imgRef.current.style.height = `${height}px`;
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isLoaded) return;

      if (event.touches.length === 1) {
        dragTimer.current = new Date().valueOf();
        data.current = {
          ...data.current,
          isDown: true,
          startX: event.touches[0].pageX,
          startY: event.touches[0].pageY,
          x: event.touches[0].pageX,
          y: event.touches[0].pageY
        };
      }

      if (event.touches.length === 2) {
        const newZoom = Math.sqrt(
          Math.pow(event.touches[1].pageX - event.touches[0].pageX, 2) +
            Math.pow(event.touches[1].pageY - event.touches[0].pageY, 2)
        );
        data.current = { ...data.current, zoom: newZoom };
      }
    },
    [isLoaded]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>, z: number) => {
      if (!isLoaded) return;
      if (event.touches.length === 1) {
        handleMouseResize({ zoomValue: z, pageX: event.touches[0].pageX, pageY: event.touches[0].pageY });
      } else if (event.touches.length === 2) {
        const newZoom = Math.sqrt(
          Math.pow(event.touches[1].pageX - event.touches[0].pageX, 2) +
            Math.pow(event.touches[1].pageY - event.touches[0].pageY, 2)
        );
        handleMouseResize({
          zoomValue: (z * newZoom) / data.current.zoom,
          pageX: event.touches[0].pageX,
          pageY: event.touches[0].pageY
        });
        data.current = {
          ...data.current,
          zoom: newZoom
        };
      }
    },
    [handleMouseResize, isLoaded]
  );

  useEffect(() => {
    if (!isLoaded) return;

    handleResize();

    function touchstart(event) {
      event.preventDefault();
    }

    const element = containerRef.current;

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
  }, [handleMouseUp, handleResize, isLoaded]);

  return (
    src && (
      <>
        <div
          ref={containerRef}
          className={classes.root}
          onWheel={e => handleWheel(e, zoom)}
          onMouseDown={e => handleMouseDown(e)}
          onMouseMove={e => handleMouseMove(e, zoom)}
          onTouchStart={e => handleTouchStart(e)}
          onTouchMove={e => handleTouchMove(e, zoom)}
        >
          <img
            ref={imgRef}
            className={clsx(classes.image, isZooming && ZOOM_CLASS)}
            src={src}
            alt={alt}
            draggable={false}
            style={
              isZooming
                ? {
                    maxHeight: 'none',
                    maxWidth: 'none'
                  }
                : {}
            }
            onLoad={() => setIsLoaded(true)}
          />
        </div>
        <div ref={menuRef} className={classes.zoom}>
          <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${Math.floor(zoom)}%`}</div>
          <IconButton
            size="small"
            children={<AddIcon fontSize="small" />}
            onClick={() => handleMouseResize({ zoomValue: Math.min(MAX, zoom + 10) })}
          />
          <Slider
            className={classes.zoomSlider}
            value={zoom}
            step={10}
            min={MIN}
            max={MAX}
            size="small"
            orientation="vertical"
            onChange={(event, newValue) => handleMouseResize({ zoomValue: Math.floor(newValue as number) })}
          />
          <IconButton
            size="small"
            children={<RemoveIcon fontSize="small" />}
            onClick={() => handleMouseResize({ zoomValue: Math.max(100, zoom - 10) })}
          />
        </div>
      </>
    )
  );
});

export const ImageViewer = React.memo(WrappedImageViewer);
